import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { LoginCredentials, SignUpData } from '../types/auth-interfaces/auth';

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  public supabase: SupabaseClient;

  constructor() {
    const SUPABASE_URL = environment.supabaseUrl;
    const SUPABASE_KEY = environment.supabasePublishableKey;

    this.supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  }
}
