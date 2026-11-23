const nextJest = require('next/jest.js')

const createJestConfig = nextJest({
  dir: './',
})

const config = {
  coverageProvider: 'v8',
  testEnvironment: 'node',
  testPathIgnorePatterns: ['<rootDir>/app/api/.*/route.test.ts'],
  moduleNameMapper: {
    '^@/tests/(.*)$': '<rootDir>/__tests__/$1',
    '^@/(.*)$': '<rootDir>/$1',
  },
}

module.exports = createJestConfig(config)
