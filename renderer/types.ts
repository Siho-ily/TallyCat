export interface Record {
  id: string;
  type: 'income' | 'purchase' | 'spending';
  category_id: string;
  payment_method_id: string;
  amount: number;
  date: string;
  note: string;
}

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'purchase' | 'spending';
  is_active: boolean;
  is_default?: boolean;
  default_amount?: number;
}

export interface PaymentMethod {
  id: string;
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

export interface AutomationRule {
  id: string;
  name: string;
  type: 'income' | 'purchase' | 'spending';
  amount: number;
  category_id: string;
  payment_method_id: string;
  day_of_month: number[];
  is_active: boolean;
  executed_dates?: string[]; // YYYY-MM-DD
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
