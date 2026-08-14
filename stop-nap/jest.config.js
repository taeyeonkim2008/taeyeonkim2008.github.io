/**
 * The core trigger logic is pure TypeScript with no React Native imports, so
 * it runs on plain Node under babel-jest — no jsdom, no native mocks, no
 * simulator. That is the entire point of keeping src/core platform-free: the
 * decision logic that wakes someone up is testable in milliseconds.
 */
module.exports = {
  preset: 'jest-expo',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/src/**/__tests__/**/*.test.ts'],
  collectCoverageFrom: ['src/core/**/*.ts', '!src/core/types.ts'],
};
