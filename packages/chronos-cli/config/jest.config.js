/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path')

module.exports = {
  collectCoverageFrom: ['src/**/*.{ts,tsx}'],
  collectCoverage: true,
  setupFiles: [require.resolve('reflect-metadata')],
  moduleFileExtensions: ['web.js', 'js', 'json', 'node', 'mjs', 'ts', 'tsx'],
  transform: {
    '^.+\\.(ts|tsx)$': path.join(__dirname, 'jest/tsTransform.js'),
    '^.+\\.sass$': path.join(__dirname, 'jest/cssTransform.js'),
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': path.join(__dirname, 'jest/fileTransform.js'),
  },
  testMatch: ['<rootDir>/src/**/?(*.)(spec).{ts,tsx}'],
  testURL: 'http://localhost',
  testEnvironment: 'node',
  notify: !process.env.CI,
}
