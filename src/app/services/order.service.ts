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
    const { data, error } = await this.supabase.client
      .from('orders')
      .select('order_number')
      .order('order_number', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error fetching last order number:', error);
      throw error;
    }

    console.log('Last order data:', data);

    if (!data || data.length === 0) {
      console.log('No orders found, starting from 6000');
      return '6000';
    }

    const lastOrderNumber = data[0].order_number;
    console.log('Last order number:', lastOrderNumber);
    
    // Handle NaN case - if order number is not a valid number
    const lastNumber = parseInt(lastOrderNumber);
    if (isNaN(lastNumber)) {
      console.error('Last order number is not a valid number:', lastOrderNumber);
      // Find the highest valid number or start from 6000
      return '6000';
    }
    
    const nextNumber = (lastNumber + 1).toString();
    console.log('Next order number:', nextNumber);
    return nextNumber;
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
