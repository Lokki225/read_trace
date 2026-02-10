module.exports = {
  displayName: 'e2e',
  testEnvironment: 'node',
  testMatch: ['**/tests/e2e/**/*.test.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\\.tsx?$': ['@swc/jest'],
  },
  setupFiles: ['<rootDir>/jest.e2e.setup.js'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.tsx',
  ],
  testTimeout: 30000,
};
