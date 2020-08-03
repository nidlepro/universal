/* eslint-disable @typescript-eslint/no-var-requires */
const { createJestConfig } = require('@nidlepro/universal-cli')

module.exports = createJestConfig({
  reporters: ['<rootDir>/src/reporters/jest.reporter.js']
})
