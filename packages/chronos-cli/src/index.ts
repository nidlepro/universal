import { program } from 'commander'
import { Cli } from './cli'
import { lintModule } from './modules/lint'
import { testModule } from './modules/test'
import { publishModule } from './modules/publish'

const cli = new Cli(program as any)

cli.load(lintModule)
cli.load(testModule)
cli.load(publishModule)

export default cli

export { createEslintConfig, createStylelintConfig, createPrettierConfig } from './modules/lint'
export { createJestConfig } from './modules/test'
