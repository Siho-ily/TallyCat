import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { app } from 'electron';
import path from 'path';

export interface Record {
  id: string;
  type: 'income' | 'expense';
  category_id: string;
  payment_method_id: string;
  amount: number;
  date: string; // ISO 8601 with seconds
  note: string;
}

export interface Category {
  id: string;
  name: string;
  is_active: boolean;
}

export interface PaymentMethod {
  id: string;
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
  payment_methods: PaymentMethod[];
  settings: Settings;
}

export const defaultData: Data = {
  records: [],
  categories: [],
  payment_methods: [
    { id: 'pm1', name: '카드', is_active: true },
    { id: 'pm2', name: '현금', is_active: true }
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

  // Payment Methods Migration
  if (!db.data.payment_methods || db.data.payment_methods.length === 0) {
    db.data.payment_methods = [...defaultData.payment_methods];
  } else {
    // Ensure is_active field exists
    db.data.payment_methods = db.data.payment_methods.map(pm => ({
      ...pm,
      is_active: typeof pm.is_active === 'undefined' ? true : pm.is_active
    }));
  }

  // Get default payment method (카드)
  const defaultPaymentMethod =
    db.data.payment_methods.find(pm => pm.name === '카드') || db.data.payment_methods[0];

  // Categories Migration: Remove type field and merge duplicates
  if (!db.data.categories || db.data.categories.length === 0) {
    db.data.categories = [...defaultData.categories];
  } else {
    const oldCategories = db.data.categories as any[];
    const categoryMap = new Map<string, Category>();
    const idMapping = new Map<string, string>(); // old id -> new id

    // Merge categories with the same name
    for (const oldCat of oldCategories) {
      const name = oldCat.name;
      const isActive = typeof oldCat.is_active === 'undefined' ? true : oldCat.is_active;

      if (categoryMap.has(name)) {
        // Duplicate found - map old id to existing category id
        const existingCat = categoryMap.get(name)!;
        idMapping.set(oldCat.id, existingCat.id);
      } else {
        // New category name - create new category without type
        const newCat: Category = {
          id: oldCat.id,
          name: name,
          is_active: isActive
        };
        categoryMap.set(name, newCat);
        idMapping.set(oldCat.id, newCat.id);
      }
    }

    // Update categories array
    db.data.categories = Array.from(categoryMap.values());

    // Update all records to use new category IDs and add payment_method_id
    db.data.records = db.data.records.map(record => {
      const newCategoryId = idMapping.get(record.category_id) || record.category_id;
      return {
        ...record,
        category_id: newCategoryId,
        // Add payment_method_id if missing
        payment_method_id: record.payment_method_id || defaultPaymentMethod.id
      };
    });
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
    const defaultBase = path.join(docsPath, 'SPMS_Backups');

    // Ensure paths are independent and not empty strings
    if (!db.data.settings.main_backup_path || db.data.settings.main_backup_path.trim() === '') {
      db.data.settings.main_backup_path = path.join(defaultBase, 'Main');
    }

    if (!db.data.settings.sub_backup_path || db.data.settings.sub_backup_path.trim() === '') {
      db.data.settings.sub_backup_path = path.join(defaultBase, 'Sub');
    }

    // Final Merge to ensure all keys from defaultData.settings exist
    db.data.settings = { ...defaultData.settings, ...db.data.settings };

    // last_main_backup_date, last_sub_backup_date가 null이면 현재 시간으로 초기화
    const now = new Date().toISOString();
    if (db.data.settings.last_main_backup_date === null) {
      db.data.settings.last_main_backup_date = now;
    }
    if (db.data.settings.last_sub_backup_date === null) {
      db.data.settings.last_sub_backup_date = now;
    }
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
