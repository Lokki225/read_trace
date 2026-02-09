export interface User {
  id: string
  email: string
  name: string
  createdAt: string
  updatedAt: string
}

export const createUser = (overrides?: Partial<User>): User => ({
  id: 'user-123',
  email: 'test@example.com',
  name: 'Test User',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
})

export const createUserList = (count: number, overrides?: Partial<User>): User[] => {
  return Array.from({ length: count }, (_, i) =>
    createUser({
      id: `user-${i + 1}`,
      email: `user${i + 1}@example.com`,
      name: `Test User ${i + 1}`,
      ...overrides,
    }),
  )
}
