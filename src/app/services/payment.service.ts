import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { PaymentRecord } from '../models/database.types';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  constructor(private supabase: SupabaseService) {}

  async getPaymentsByOrder(orderId: string): Promise<PaymentRecord[]> {
    const { data, error } = await this.supabase.client
      .from('payment_records')
      .select('*')
      .eq('order_id', orderId)
      .order('payment_date', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async createPayment(payment: Partial<PaymentRecord>): Promise<PaymentRecord> {
    const { data, error } = await this.supabase.client
      .from('payment_records')
      .insert(payment)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updatePayment(id: string, updates: Partial<PaymentRecord>): Promise<PaymentRecord> {
    const { data, error } = await this.supabase.client
      .from('payment_records')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deletePayment(id: string): Promise<void> {
    const { error } = await this.supabase.client
      .from('payment_records')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}
