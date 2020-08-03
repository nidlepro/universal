import { createTransformer } from 'ts-jest'
import { tsConfig } from '../../paths'

module.exports = createTransformer({
  tsConfig,
})
