import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Sale, SaleWithDetails } from '../models/database.types';

@Injectable({
  providedIn: 'root'
})
export class SalesService {
  constructor(private supabase: SupabaseService) {}

  async getSales(): Promise<SaleWithDetails[]> {
    const { data, error } = await this.supabase.client
      .from('sales')
      .select(`
        *,
        customer:customers(*)
      `)
      .order('sale_date', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  }

  async getSaleById(id: string): Promise<SaleWithDetails | null> {
    const { data, error } = await this.supabase.client
      .from('sales')
      .select(`
        *,
        customer:customers(*)
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async createSale(sale: Partial<Sale>): Promise<Sale> {
    const { data, error } = await this.supabase.client
      .from('sales')
      .insert(sale)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async updateSale(id: string, sale: Partial<Sale>): Promise<Sale> {
    const { data, error } = await this.supabase.client
      .from('sales')
      .update(sale)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async deleteSale(id: string): Promise<void> {
    const { error } = await this.supabase.client
      .from('sales')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }
  }

  async generateSaleNumber(): Promise<string> {
    const { data, error } = await this.supabase.client
      .from('sales')
      .select('sale_number')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      return 'SALE-001';
    }

    const lastNumber = parseInt(data.sale_number.split('-')[1] || '0');
    const nextNumber = lastNumber + 1;
    return `SALE-${nextNumber.toString().padStart(3, '0')}`;
  }
}
