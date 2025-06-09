import { createClient } from '@supabase/supabase-js';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { cache } from 'react';

// Types for database tables
export type User = {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
  full_name?: string;
  company_name?: string;
  company_size?: string;
  industry?: string;
  role?: string;
  onboarding_completed?: boolean;
  subscription_tier?: 'free' | 'basic' | 'pro' | 'enterprise';
  subscription_status?: 'active' | 'trialing' | 'past_due' | 'canceled';
  stripe_customer_id?: string;
};

export type Supplier = {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  country: string;
  product_categories: string[];
  contact_email?: string;
  contact_phone?: string;
  website?: string;
  verified: boolean;
  rating?: number;
  user_id: string;
  notes?: string;
};

export type TariffData = {
  id: string;
  created_at: string;
  updated_at: string;
  country: string;
  hts_code: string;
  description: string;
  rate: number;
  effective_date: string;
  expiration_date?: string;
};

export type PricingModel = {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  description?: string;
  user_id: string;
  product_id: string;
  base_cost: number;
  tariff_cost: number;
  shipping_cost: number;
  other_costs: number;
  current_price: number;
  suggested_price: number;
  margin_percentage: number;
  scenario_type: 'absorb' | 'pass_through' | 'split';
  is_active: boolean;
};

export type Database = {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: Omit<User, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>;
      };
      suppliers: {
        Row: Supplier;
        Insert: Omit<Supplier, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Supplier, 'id' | 'created_at' | 'updated_at'>>;
      };
      tariff_data: {
        Row: TariffData;
        Insert: Omit<TariffData, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<TariffData, 'id' | 'created_at' | 'updated_at'>>;
      };
      pricing_models: {
        Row: PricingModel;
        Insert: Omit<PricingModel, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<PricingModel, 'id' | 'created_at' | 'updated_at'>>;
      };
    };
  };
};

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Error handling for missing environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Missing Supabase environment variables. Please check your .env file.'
  );
}

/**
 * Creates a Supabase client for use in browser environments
 * @returns Supabase client
 */
export const createBrowserClient = () => {
  return createClientComponentClient<Database>({
    supabaseUrl,
    supabaseKey: supabaseAnonKey,
  });
};

/**
 * Creates a cached Supabase client for use in server components
 * This uses Next.js cache() to deduplicate requests
 */
export const createServerClient = cache(() => {
  const cookieStore = cookies();
  return createServerComponentClient<Database>({ cookies: () => cookieStore });
});

/**
 * Creates a Supabase admin client with full privileges
 * @returns Supabase admin client
 * @note This should only be used in secure server contexts
 */
export const createAdminClient = () => {
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseServiceKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
  }
  
  return createClient<Database>(supabaseUrl!, supabaseServiceKey);
};

/**
 * Helper function to get the current authenticated user
 * @param client Supabase client
 * @returns The current user or null
 */
export const getCurrentUser = async (client: ReturnType<typeof createBrowserClient | typeof createServerClient>) => {
  const { data: { user } } = await client.auth.getUser();
  return user;
};

/**
 * Helper function to get the current user's profile data
 * @param client Supabase client
 * @returns The user profile data or null
 */
export const getUserProfile = async (client: ReturnType<typeof createBrowserClient | typeof createServerClient>) => {
  const { data: { user } } = await client.auth.getUser();
  
  if (!user) return null;
  
  const { data, error } = await client
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();
    
  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
  
  return data;
};

/**
 * Helper function to update a user's profile
 * @param client Supabase client
 * @param userId User ID
 * @param updates Profile updates
 * @returns The updated profile or null
 */
export const updateUserProfile = async (
  client: ReturnType<typeof createBrowserClient | typeof createServerClient>,
  userId: string,
  updates: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>
) => {
  const { data, error } = await client
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
    
  if (error) {
    console.error('Error updating user profile:', error);
    return null;
  }
  
  return data;
};

/**
 * Helper function to fetch suppliers for a user
 * @param client Supabase client
 * @param userId User ID
 * @param options Query options
 * @returns Array of suppliers
 */
export const getUserSuppliers = async (
  client: ReturnType<typeof createBrowserClient | typeof createServerClient>,
  userId: string,
  options?: {
    limit?: number;
    offset?: number;
    country?: string;
    verified?: boolean;
  }
) => {
  let query = client
    .from('suppliers')
    .select('*')
    .eq('user_id', userId);
    
  if (options?.country) {
    query = query.eq('country', options.country);
  }
  
  if (options?.verified !== undefined) {
    query = query.eq('verified', options.verified);
  }
  
  if (options?.limit) {
    query = query.limit(options.limit);
  }
  
  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching user suppliers:', error);
    return [];
  }
  
  return data;
};

/**
 * Helper function to fetch tariff data
 * @param client Supabase client
 * @param htsCode HTS code
 * @param country Country
 * @returns Tariff data or null
 */
export const getTariffData = async (
  client: ReturnType<typeof createBrowserClient | typeof createServerClient>,
  htsCode: string,
  country: string
) => {
  const { data, error } = await client
    .from('tariff_data')
    .select('*')
    .eq('hts_code', htsCode)
    .eq('country', country)
    .lte('effective_date', new Date().toISOString())
    .or(`expiration_date.is.null,expiration_date.gt.${new Date().toISOString()}`)
    .order('effective_date', { ascending: false })
    .limit(1)
    .single();
    
  if (error) {
    console.error('Error fetching tariff data:', error);
    return null;
  }
  
  return data;
};

/**
 * Helper function to create a pricing model
 * @param client Supabase client
 * @param model Pricing model data
 * @returns The created pricing model or null
 */
export const createPricingModel = async (
  client: ReturnType<typeof createBrowserClient | typeof createServerClient>,
  model: Omit<PricingModel, 'id' | 'created_at' | 'updated_at'>
) => {
  const { data, error } = await client
    .from('pricing_models')
    .insert(model)
    .select()
    .single();
    
  if (error) {
    console.error('Error creating pricing model:', error);
    return null;
  }
  
  return data;
};

// Note: @supabase/auth-helpers-nextjs is deprecated in favor of @supabase/ssr
// Consider migrating to @supabase/ssr in a future update
