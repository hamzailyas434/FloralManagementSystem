import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Order, OrderItem, DeliveryCost, OrderWithDetails } from '../models/database.types';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  constructor(private supabase: SupabaseService) {}

  async getOrders(): Promise<OrderWithDetails[]> {
    const { data, error } = await this.supabase.client
      .from('orders')
      .select(`
        *,
        customer:customers(*),
        order_items(*),
        delivery_cost:delivery_costs(*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(order => ({
      ...order,
      delivery_cost: Array.isArray(order.delivery_cost)
        ? order.delivery_cost[0]
        : order.delivery_cost
    }));
  }

  async getOrder(id: string): Promise<OrderWithDetails | null> {
    const { data, error } = await this.supabase.client
      .from('orders')
      .select(`
        *,
        customer:customers(*),
        order_items(*),
        delivery_cost:delivery_costs(*)
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    return {
      ...data,
      delivery_cost: Array.isArray(data.delivery_cost)
        ? data.delivery_cost[0]
        : data.delivery_cost
    };
  }

  async createOrder(order: Partial<Order>): Promise<Order> {
    // Remove fields that don't exist in the database schema
    const { customer, order_items, ...dbOrder } = order as any;

    const { data, error } = await this.supabase.client
      .from('orders')
      .insert(dbOrder)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateOrder(id: string, updates: Partial<Order>): Promise<Order> {
    // Remove fields that don't exist in the database schema
    const { customer, order_items, ...dbUpdates } = updates as any;

    console.log('OrderService.updateOrder - Input updates:', updates);
    console.log('OrderService.updateOrder - Cleaned dbUpdates:', dbUpdates);
    console.log('OrderService.updateOrder - Removed fields:', { customer, order_items });

    const { data, error } = await this.supabase.client
      .from('orders')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('OrderService.updateOrder - Error:', error);
      throw error;
    }
    return data;
  }

  async deleteOrder(id: string): Promise<void> {
    const { error } = await this.supabase.client
      .from('orders')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async addOrderItem(item: Partial<OrderItem>): Promise<OrderItem> {
    const { data, error } = await this.supabase.client
      .from('order_items')
      .insert(item)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateOrderItem(id: string, updates: Partial<OrderItem>): Promise<OrderItem> {
    const { data, error } = await this.supabase.client
      .from('order_items')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteOrderItem(id: string): Promise<void> {
    const { error } = await this.supabase.client
      .from('order_items')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async saveDeliveryCost(delivery: Partial<DeliveryCost>): Promise<DeliveryCost> {
    const { data: existing } = await this.supabase.client
      .from('delivery_costs')
      .select('id')
      .eq('order_id', delivery.order_id!)
      .maybeSingle();

    if (existing) {
      const { data, error } = await this.supabase.client
        .from('delivery_costs')
        .update(delivery)
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      const { data, error } = await this.supabase.client
        .from('delivery_costs')
        .insert(delivery)
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  }

  async getNextOrderNumber(): Promise<string> {
    console.log('getNextOrderNumber called');
    
    // Get today's date in YYYYMMDD format
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const dateStr = `${year}${month}${day}`;
    
    // Get all orders from today
    const todayPrefix = `ORD-${dateStr}-`;
    
    const { data, error } = await this.supabase.client
      .from('orders')
      .select('order_number')
      .like('order_number', `${todayPrefix}%`)
      .order('order_number', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error fetching last order number:', error);
      throw error;
    }

    console.log('Last order data for today:', data);

    let nextSequence = 1; // Start from 0001

    if (data && data.length > 0) {
      const lastOrderNumber = data[0].order_number;
      console.log('Last order number:', lastOrderNumber);
      
      // Extract sequence number from ORD-YYYYMMDD-####
      const parts = lastOrderNumber.split('-');
      if (parts.length === 3) {
        const lastSequence = parseInt(parts[2]);
        if (!isNaN(lastSequence)) {
          nextSequence = lastSequence + 1;
        }
      }
    }

    // Format: ORD-YYYYMMDD-####
    const sequenceStr = String(nextSequence).padStart(4, '0');
    const newOrderNumber = `ORD-${dateStr}-${sequenceStr}`;
    
    console.log('Next order number:', newOrderNumber);
    return newOrderNumber;
  }

  async getSaleOrders(): Promise<OrderWithDetails[]> {
    const { data, error } = await this.supabase.client
      .from('orders')
      .select(`
        *,
        customer:customers(*),
        order_items(*)
      `)
      .eq('order_type', 'Sale')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }
}
