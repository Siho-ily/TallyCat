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
  backup_interval: number;
  auto_backup: boolean;
  last_backup_date: string | null;
  max_backup_size_gb: number;
  main_backup_path: string;
  sub_backup_path: string;
  auto_delete_months: number;
  auto_delete_type: 'all' | 'auto' | 'manual';
}

export interface StorageInfo {
  dbSize: number;
  freeSpace: number;
  limitReached: boolean;
}
