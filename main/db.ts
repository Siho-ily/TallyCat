import { JSONFilePreset } from 'lowdb/node';
import { app } from 'electron';
import path from 'path';

export interface Record {
  id: string;
  type: 'income' | 'expense';
  category_id: string;
  amount: number;
  date: string; // ISO 8601 with seconds
  note: string;
}

export interface Category {
  id: string;
  type: 'income' | 'expense';
  name: string;
}

export interface Settings {
  backup_interval: number; // days
  auto_backup: boolean;
  last_backup_date: string | null;
  max_backup_size_gb: number;
  main_backup_path: string;
  sub_backup_path: string;
  auto_delete_months: number;
  auto_delete_type: 'all' | 'auto' | 'manual';
}

export interface Data {
  records: Record[];
  categories: Category[];
  settings: Settings;
}

const defaultData: Data = {
  records: [],
  categories: [
    { id: '1', type: 'income', name: '커트' },
    { id: '2', type: 'income', name: '염색' },
    { id: '3', type: 'income', name: '펌' },
    { id: '4', type: 'expense', name: '재료비' },
    { id: '5', type: 'expense', name: '월세' },
    { id: '6', type: 'expense', name: '전기세' }
  ],
  settings: {
    backup_interval: 7,
    auto_backup: true,
    last_backup_date: null,
    max_backup_size_gb: 1.0,
    main_backup_path: '',
    sub_backup_path: '',
    auto_delete_months: 6,
    auto_delete_type: 'all'
  }
};

let db: any = null;

export async function getDb() {
  if (db) return db;

  const userDataPath = app.getPath('userData');
  const dbPath = path.join(userDataPath, 'db.json');

  db = await JSONFilePreset<Data>(dbPath, defaultData);
  return db;
}
