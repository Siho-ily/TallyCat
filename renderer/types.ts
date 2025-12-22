export interface Record {
  id: string;
  type: 'income' | 'expense';
  category_id: string;
  amount: number;
  date: string;
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
  main_backup_interval: number[]; // Array for multiple days or single interval
  sub_backup_interval: number[];
  auto_backup: boolean;
  last_main_backup_date: string | null;
  last_sub_backup_date: string | null;
  main_max_backup_size_mb: number;
  sub_max_backup_size_mb: number;
  main_backup_path: string;
  sub_backup_path: string;
  main_auto_delete_enabled: boolean;
  main_retention_years: number;
  main_retention_months: number;
  main_retention_days: number;
  main_retention_count: number;
  sub_auto_delete_enabled: boolean;
  sub_retention_years: number;
  sub_retention_months: number;
  sub_retention_days: number;
  sub_retention_count: number;
}

export interface StorageInfo {
  dbSize: number;
  freeSpace: number;
  limitReached: boolean;
  mainTotalSize: number;
  subTotalSize: number;
  mainPathExists: boolean;
  subPathExists: boolean;
}
