import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Customer } from '../models/database.types';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  constructor(private supabase: SupabaseService) {}

  async getCustomers(): Promise<Customer[]> {
    const { data, error } = await this.supabase.client
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getCustomer(id: string): Promise<Customer | null> {
    const { data, error } = await this.supabase.client
      .from('customers')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async createCustomer(customer: Partial<Customer>): Promise<Customer> {
    const { data, error } = await this.supabase.client
      .from('customers')
      .insert(customer)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateCustomer(id: string, updates: Partial<Customer>): Promise<Customer> {
    const { data, error } = await this.supabase.client
      .from('customers')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteCustomer(id: string): Promise<void> {
    const { error } = await this.supabase.client
      .from('customers')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async searchCustomers(searchTerm: string): Promise<Customer[]> {
    const { data, error } = await this.supabase.client
      .from('customers')
      .select('*')
      .or(`name.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }
}
