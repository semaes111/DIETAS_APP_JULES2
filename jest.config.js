const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-node',
  testMatch: [
    '<rootDir>/tests/**/*.test.{js,ts}',
    '<rootDir>/__tests__/**/*.{js,ts}'
  ],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  collectCoverageFrom: [
    'app/**/*.{js,ts,jsx,tsx}',
    'lib/**/*.{js,ts}',
    '!app/**/layout.{js,ts,jsx,tsx}',
    '!app/**/loading.{js,ts,jsx,tsx}',
    '!app/**/not-found.{js,ts,jsx,tsx}',
    '!app/**/error.{js,ts,jsx,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  verbose: true,
  testTimeout: 30000,
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)