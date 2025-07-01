export interface User {
  id: string;
  email: string;
  name: string;
  photoURL?: string;
  created_at: string;
  updated_at: string;
}

export interface Account {
  id: string;
  user_id: string;
  name: string;
  type: 'checking' | 'savings' | 'credit' | 'investment';
  balance: number;
  color?: string;
  isActive?: boolean;
  created_at: string;
  updated_at?: string;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
  icon: string;
  isActive?: boolean;
  created_at: string;
  updated_at?: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  account_id: string;
  category: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  date: string;
  isRecurring?: boolean;
  recurringType?: 'weekly' | 'monthly' | 'yearly';
  tags?: string[];
  notes?: string;
  created_at: string;
  updated_at?: string;
}

export interface Budget {
  id: string;
  user_id: string;
  category_id: string;
  amount: number;
  period: 'monthly' | 'yearly';
  start_date: string;
  end_date?: string;
  isActive?: boolean;
  created_at: string;
  updated_at?: string;
}

export interface Goal {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  target_date: string;
  color: string;
  icon: string;
  isActive?: boolean;
  created_at: string;
  updated_at?: string;
}

export interface RecurringTransaction {
  id: string;
  user_id: string;
  account_id: string;
  category_id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  frequency: 'weekly' | 'monthly' | 'yearly';
  day_of_week?: number; // 0-6 (Sunday-Saturday)
  day_of_month?: number; // 1-31
  month_of_year?: number; // 1-12
  isActive?: boolean;
  next_due_date: string;
  created_at: string;
  updated_at?: string;
}

// Tipos para compatibilidade com Firebase (legacy)
export interface FirebaseUser {
  id: string;
  email: string;
  name: string;
  photoURL?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FirebaseAccount {
  id: string;
  userId: string;
  name: string;
  type: 'checking' | 'savings' | 'credit' | 'investment';
  balance: number;
  color: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface FirebaseCategory {
  id: string;
  userId: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
  icon: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface FirebaseTransaction {
  id: string;
  userId: string;
  accountId: string;
  categoryId: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  date: Date;
  isRecurring: boolean;
  recurringType?: 'weekly' | 'monthly' | 'yearly';
  tags: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
} 