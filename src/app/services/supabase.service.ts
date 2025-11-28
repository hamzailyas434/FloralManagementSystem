import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments';

// Export supabase client for use in other services
export const supabase = createClient(
  environment.supabaseUrl,
  environment.supabaseAnonKey
);

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = supabase;
  }

  get client() {
    return this.supabase;
  }
}
