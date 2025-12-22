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
  main_auto_delete_months: number;
  sub_auto_delete_months: number;
}

export interface StorageInfo {
  dbSize: number;
  freeSpace: number;
  limitReached: boolean;
}
