import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
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
  main_backup_interval: number;
  sub_backup_interval: number;
  auto_backup: boolean;
  last_main_backup_date: string | null;
  last_sub_backup_date: string | null;
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

export const defaultData: Data = {
  records: [],
  categories: [
    { id: '1', type: 'income', name: '커트' },
    { id: '2', type: 'income', name: '염색' },
    { id: '3', type: 'income', name: '펌' },
    { id: '4', type: 'expense', name: '재료비' },
    { id: '5', type: 'expense', name: '월세' },
    { id: '6', type: 'expense', name: '전기세' },
    { id: '7', type: 'income', name: '기타' },
    { id: '8', type: 'expense', name: '기타' }
  ],
  settings: {
    main_backup_interval: 7,
    sub_backup_interval: 30,
    auto_backup: true,
    last_main_backup_date: null,
    last_sub_backup_date: null,
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

  try {
    const userDataPath = app.getPath('userData');
    const dbPath = path.join(userDataPath, 'db.json');
    console.log('Initializing DB (lowdb v5) at:', dbPath);

    // Manual initialization for lowdb v5
    const adapter = new JSONFile<Data>(dbPath);
    db = new Low(adapter);

    // Load data from file or use defaultData if file doesn't exist
    await db.read();

    // lowdb v5 doesn't automatically write defaultData if file is missing,
    // so we handle it here:
    if (db.data === null) {
      db.data = { ...defaultData };
      await db.write();
    }

    console.log('DB initialized successfully');
    return db;
  } catch (error) {
    console.error('Failed to initialize DB:', error);
    throw error;
  }
}
