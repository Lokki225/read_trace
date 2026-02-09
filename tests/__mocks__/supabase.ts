const mockFn = (fn?: any) => fn || (() => {})

export const mockSupabaseClient = {
  auth: {
    onAuthStateChange: (callback: (event: string, session: any) => void) => {
      callback('SIGNED_OUT', null)
      return {
        data: { subscription: { unsubscribe: mockFn() } },
      }
    },
    signUp: () =>
      Promise.resolve({
        data: { user: { id: 'user-123', email: 'test@example.com' } },
        error: null,
      }),
    signInWithPassword: () =>
      Promise.resolve({
        data: { user: { id: 'user-123', email: 'test@example.com' } },
        error: null,
      }),
    signOut: () => Promise.resolve({ error: null }),
    getUser: () =>
      Promise.resolve({
        data: { user: { id: 'user-123', email: 'test@example.com' } },
        error: null,
      }),
    getSession: () =>
      Promise.resolve({
        data: { session: null },
        error: null,
      }),
  },
  from: (table: string) => ({
    select: () => Promise.resolve({ data: [], error: null }),
    insert: () => Promise.resolve({ data: [], error: null }),
    update: () => Promise.resolve({ data: [], error: null }),
    delete: () => Promise.resolve({ data: [], error: null }),
    eq: () => Promise.resolve({ data: [], error: null }),
    single: () =>
      Promise.resolve({
        data: {},
        error: null,
      }),
  }),
  realtime: {
    on: () => ({ data: null, error: null }),
    subscribe: () =>
      Promise.resolve({
        data: { subscription: { unsubscribe: mockFn() } },
      }),
  },
}

export const createMockSupabaseClient = () => mockSupabaseClient
