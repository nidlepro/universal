/* eslint-disable @typescript-eslint/no-var-requires */
import { program } from 'commander'
import { Cli } from './cli'
import { lintModule } from './modules/lint'
import { testModule } from './modules/test'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const cli = new Cli(program as any)

cli.load(lintModule)
cli.load(testModule)

export default cli

export { createEslintConfig, createStylelintConfig, createPrettierConfig } from './modules/lint'
export { createJestConfig } from './modules/test'
