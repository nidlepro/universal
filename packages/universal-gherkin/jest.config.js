/* eslint-disable @typescript-eslint/no-var-requires */
const { createJestConfig } = require('@nidlepro/universal-cli')

module.exports = createJestConfig({
  reporters: ['<rootDir>/dist/reporters/jest.reporter.js']
})
