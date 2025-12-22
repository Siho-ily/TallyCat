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
  is_active: boolean;
}

export interface Settings {
  main_backup_mode: 'interval' | 'monthly';
  sub_backup_mode: 'interval' | 'monthly';
  main_backup_interval: number[];
  sub_backup_interval: number[];
  auto_backup: boolean;
  last_main_backup_date: string | null;
  last_sub_backup_date: string | null;
  main_max_backup_size_mb: number;
  sub_max_backup_size_mb: number;
  main_backup_path: string;
  sub_backup_path: string;
  main_auto_delete_months: number;
  sub_auto_delete_months: number;
}

export interface Data {
  records: Record[];
  categories: Category[];
  settings: Settings;
}

export const defaultData: Data = {
  records: [],
  categories: [
    { id: '1', type: 'income', name: '커트', is_active: true },
    { id: '2', type: 'income', name: '염색', is_active: true },
    { id: '3', type: 'income', name: '펌', is_active: true },
    { id: '4', type: 'expense', name: '재료비', is_active: true },
    { id: '5', type: 'expense', name: '월세', is_active: true },
    { id: '6', type: 'expense', name: '전기세', is_active: true },
    { id: '7', type: 'income', name: '기타', is_active: true },
    { id: '8', type: 'expense', name: '기타', is_active: true }
  ],
  settings: {
    main_backup_mode: 'interval',
    sub_backup_mode: 'interval',
    main_backup_interval: [7],
    sub_backup_interval: [30],
    auto_backup: true,
    last_main_backup_date: null,
    last_sub_backup_date: null,
    main_max_backup_size_mb: 500,
    sub_max_backup_size_mb: 1000,
    main_backup_path: '',
    sub_backup_path: '',
    main_auto_delete_months: 3,
    sub_auto_delete_months: 12
  }
};

// Migration function to handle schema changes
async function migrate(db: Low<Data>) {
  if (!db.data) return;

  // Initialize missing top-level keys
  if (!db.data.records) db.data.records = [];
  if (!db.data.categories || db.data.categories.length === 0) {
    db.data.categories = [...defaultData.categories];
  } else {
    // Migration: Add is_active to existing categories
    db.data.categories = db.data.categories.map(c => ({
      ...c,
      is_active: typeof c.is_active === 'undefined' ? true : c.is_active
    }));
  }
  if (!db.data.settings) {
    db.data.settings = { ...defaultData.settings };
  } else {
    // Detailed settings migration
    const s = db.data.settings as any;

    // Migration: Interval conversion (number -> array)
    if (s.backup_interval && !db.data.settings.main_backup_interval) {
      db.data.settings.main_backup_interval = [Number(s.backup_interval)];
      db.data.settings.sub_backup_interval = [Number(s.backup_interval)];
    }

    if (!Array.isArray(db.data.settings.main_backup_interval)) {
      db.data.settings.main_backup_interval = [Number(db.data.settings.main_backup_interval) || 7];
    }
    if (!Array.isArray(db.data.settings.sub_backup_interval)) {
      db.data.settings.sub_backup_interval = [Number(db.data.settings.sub_backup_interval) || 30];
    }

    // Migration: Date and Size fields
    if (s.last_backup_date && !db.data.settings.last_main_backup_date) {
      db.data.settings.last_main_backup_date = s.last_backup_date;
      db.data.settings.last_sub_backup_date = s.last_backup_date;
    }
    if (s.max_backup_size_gb && !db.data.settings.main_max_backup_size_mb) {
      db.data.settings.main_max_backup_size_mb = Math.round(s.max_backup_size_gb * 1024);
      db.data.settings.sub_max_backup_size_mb = Math.round(s.max_backup_size_gb * 1024);
    }
    // Migration: rename existing main_max_backup_size_gb to mb if it exists
    if (s.main_max_backup_size_gb && !s.main_max_backup_size_mb) {
      s.main_max_backup_size_mb = Math.round(s.main_max_backup_size_gb * 1024);
      delete s.main_max_backup_size_gb;
    }
    if (s.sub_max_backup_size_gb && !s.sub_max_backup_size_mb) {
      s.sub_max_backup_size_mb = Math.round(s.sub_max_backup_size_gb * 1024);
      delete s.sub_max_backup_size_gb;
    }
    if (s.auto_delete_months && !db.data.settings.main_auto_delete_months) {
      db.data.settings.main_auto_delete_months = s.auto_delete_months;
      db.data.settings.sub_auto_delete_months = s.auto_delete_months;
    }

    // Default Paths (Migration for older versions)
    const docsPath = app.getPath('documents');
    const defaultBase = path.join(docsPath, 'HairShop_Backups');
    if (!db.data.settings.main_backup_path) {
      db.data.settings.main_backup_path = path.join(defaultBase, 'Main');
    }
    if (!db.data.settings.sub_backup_path) {
      db.data.settings.sub_backup_path = path.join(defaultBase, 'Sub');
    }

    // Final Merge to ensure all keys from defaultData.settings exist
    db.data.settings = { ...defaultData.settings, ...db.data.settings };
  }

  await db.write();
}

let dbInstance: Low<Data> | null = null;
let initPromise: Promise<Low<Data>> | null = null;

export async function getDb(): Promise<Low<Data>> {
  if (dbInstance) return dbInstance;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      const userDataPath = app.getPath('userData');
      const dbPath = path.join(userDataPath, 'db.json');
      console.log('Initializing DB (lowdb v5) at:', dbPath);

      const adapter = new JSONFile<Data>(dbPath);
      const db = new Low<Data>(adapter);

      await db.read();

      if (db.data === null) {
        db.data = { ...defaultData };
        await db.write();
      } else {
        // Run migrations on existing data
        await migrate(db);
      }

      console.log('DB initialized and migrated successfully');
      dbInstance = db;
      return db;
    } catch (error) {
      console.error('Failed to initialize DB:', error);
      initPromise = null; // Allow retry
      throw error;
    }
  })();

  return initPromise;
}
