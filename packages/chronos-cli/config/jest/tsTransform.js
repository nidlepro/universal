/* eslint-disable @typescript-eslint/no-var-requires */
const { createTransformer } = require('ts-jest')
const { tsConfig } = require('../paths')

module.exports = createTransformer({
  tsConfig,
})
