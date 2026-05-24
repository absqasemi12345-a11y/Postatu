import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let client: SupabaseClient | null = null;

if (supabaseUrl && supabaseAnonKey) {
  client = createClient(supabaseUrl, supabaseAnonKey);
}

// Simple in-memory mock state for preview when keys are missing
let mockSession: any = null;
const listeners = new Set<(event: string, session: any) => void>();

// Proxy to handle missing client gracefully
export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    if (!client) {
      if (prop === 'auth') {
        return {
          getSession: () => Promise.resolve({ data: { session: mockSession } }),
          onAuthStateChange: (callback: any) => {
            listeners.add(callback);
            // Trigger immediately with current state
            setTimeout(() => callback('SIGNED_IN', mockSession), 0);
            return { data: { subscription: { unsubscribe: () => listeners.delete(callback) } } };
          },
          signInWithPassword: ({ email }: { email: string }) => {
            mockSession = { user: { id: 'mock-id', email }, access_token: 'mock-token' };
            listeners.forEach(cb => cb('SIGNED_IN', mockSession));
            return Promise.resolve({ data: { session: mockSession, user: mockSession.user }, error: null });
          },
          signUp: ({ email }: { email: string }) => {
            mockSession = { user: { id: 'mock-id', email }, access_token: 'mock-token' };
            listeners.forEach(cb => cb('SIGNED_UP', mockSession));
            return Promise.resolve({ data: { session: mockSession, user: mockSession.user }, error: null });
          },
          signOut: () => {
            mockSession = null;
            listeners.forEach(cb => cb('SIGNED_OUT', null));
            return Promise.resolve({ error: null });
          },
        } as any;
      }
      
      if (prop === 'from') {
        const mockResult = { data: [], error: null };
        const mockPromise = Promise.resolve(mockResult);
        const mockChain = {
          select: () => Object.assign(mockPromise, mockChain),
          in: () => Object.assign(mockPromise, mockChain),
          order: () => Object.assign(mockPromise, mockChain),
          eq: () => Object.assign(mockPromise, mockChain),
          upsert: () => mockPromise,
          insert: () => mockPromise,
          delete: () => mockChain,
        };
        return () => mockChain;
      }
    }
    return (client as any)?.[prop];
  },
});
