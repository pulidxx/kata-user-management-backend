module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
  setupFiles: ['<rootDir>/test/jest.setup.ts'],
  testMatch: ['<rootDir>/test/**/*.test.ts', '<rootDir>/test/**/__tests__/**/*.test.ts'],
    moduleDirectories: ['node_modules', 'src'],
  };