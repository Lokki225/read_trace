declare global {
  function describe(name: string, fn: () => void): void
  function it(name: string, fn: () => void | Promise<void>): void
  function test(name: string, fn: () => void | Promise<void>): void
  function beforeEach(fn: () => void | Promise<void>): void
  function afterEach(fn: () => void | Promise<void>): void
  function beforeAll(fn: () => void | Promise<void>): void
  function afterAll(fn: () => void | Promise<void>): void

  namespace jest {
    function fn(): any
    function clearAllMocks(): void
    function resetAllMocks(): void
  }

  interface Matchers<R> {
    toBe(expected: any): R
    toEqual(expected: any): R
    toHaveProperty(property: string): R
    toHaveBeenCalled(): R
    toHaveBeenCalledWith(...args: any[]): R
  }

  const expect: (actual: any) => Matchers<void>
}

export {}
