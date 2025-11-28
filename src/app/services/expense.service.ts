import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Expense } from '../models/database.types';

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {
  constructor(private supabase: SupabaseService) {}

  async getExpenses(filters?: {
    startDate?: string;
    endDate?: string;
    type?: string;
  }): Promise<Expense[]> {
    let query = this.supabase.client
      .from('expenses')
      .select('*')
      .order('expense_date', { ascending: false });

    if (filters?.startDate) {
      query = query.gte('expense_date', filters.startDate);
    }
    if (filters?.endDate) {
      query = query.lte('expense_date', filters.endDate);
    }
    if (filters?.type) {
      query = query.eq('expense_type', filters.type);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  }

  async createExpense(expense: Partial<Expense>): Promise<Expense> {
    const { data, error } = await this.supabase.client
      .from('expenses')
      .insert(expense)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateExpense(id: string, updates: Partial<Expense>): Promise<Expense> {
    const { data, error } = await this.supabase.client
      .from('expenses')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteExpense(id: string): Promise<void> {
    const { error } = await this.supabase.client
      .from('expenses')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}
