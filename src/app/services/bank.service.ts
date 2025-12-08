import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { BankBalance, BankTransaction } from '../models/database.types';

@Injectable({
  providedIn: 'root'
})
export class BankService {
  constructor(private supabase: SupabaseService) {}

  async getCurrentBalance(): Promise<number> {
    try {
      const { data, error } = await this.supabase.client
        .from('bank_balance')
        .select('balance')
        .single();
      
      if (error) throw error;
      return data?.balance || 0;
    } catch (err) {
      console.error('Error getting bank balance:', err);
      return 0;
    }
  }

  async getBankBalance(): Promise<BankBalance | null> {
    try {
      const { data, error } = await this.supabase.client
        .from('bank_balance')
        .select('*')
        .single();
      
      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error getting bank balance:', err);
      return null;
    }
  }

  async updateBalance(
    amount: number, 
    type: 'deposit' | 'withdrawal' | 'order_payment' | 'expense', 
    description: string, 
    referenceId?: string
  ): Promise<number> {
    try {
      // Get current balance
      const currentBalance = await this.getCurrentBalance();
      
      // Calculate new balance
      const adjustment = (type === 'deposit' || type === 'order_payment') ? amount : -amount;
      const newBalance = currentBalance + adjustment;
      
      // Get bank balance ID
      const bankBalanceId = await this.getBankBalanceId();
      
      // Update balance
      const { error: updateError } = await this.supabase.client
        .from('bank_balance')
        .update({ 
          balance: newBalance, 
          last_updated: new Date().toISOString() 
        })
        .eq('id', bankBalanceId);
      
      if (updateError) throw updateError;
      
      // Record transaction
      const { error: transactionError } = await this.supabase.client
        .from('bank_transactions')
        .insert({
          transaction_date: new Date().toISOString().split('T')[0],
          transaction_type: type,
          amount: Math.abs(amount),
          description,
          reference_id: referenceId
        });
      
      if (transactionError) throw transactionError;
      
      return newBalance;
    } catch (err: any) {
      console.error('Error updating bank balance:', err);
      throw new Error('Failed to update bank balance: ' + err.message);
    }
  }

  async getTransactions(limit?: number): Promise<BankTransaction[]> {
    try {
      let query = this.supabase.client
        .from('bank_transactions')
        .select('*')
        .order('transaction_date', { ascending: false })
        .order('created_at', { ascending: false });
      
      if (limit) {
        query = query.limit(limit);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error getting transactions:', err);
      return [];
    }
  }

  async getTransactionsByDateRange(startDate: string, endDate: string): Promise<BankTransaction[]> {
    try {
      const { data, error } = await this.supabase.client
        .from('bank_transactions')
        .select('*')
        .gte('transaction_date', startDate)
        .lte('transaction_date', endDate)
        .order('transaction_date', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error getting transactions by date range:', err);
      return [];
    }
  }

  private async getBankBalanceId(): Promise<string> {
    const { data } = await this.supabase.client
      .from('bank_balance')
      .select('id')
      .single();
    
    if (!data?.id) {
      throw new Error('Bank balance record not found');
    }
    
    return data.id;
  }

  async setInitialBalance(balance: number, notes?: string): Promise<void> {
    try {
      const bankBalanceId = await this.getBankBalanceId();
      
      await this.supabase.client
        .from('bank_balance')
        .update({ 
          balance, 
          notes,
          last_updated: new Date().toISOString() 
        })
        .eq('id', bankBalanceId);
    } catch (err: any) {
      throw new Error('Failed to set initial balance: ' + err.message);
    }
  }
}
