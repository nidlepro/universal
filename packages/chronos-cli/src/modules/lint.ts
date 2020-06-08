import { Command } from 'commander'
import { Linter } from 'eslint'
import { Configuration } from 'stylelint'
import { Options } from 'prettier'
import merge from 'lodash/merge'
import stylelintCli from 'stylelint/lib/cli'
import eslintCli from 'eslint/lib/cli'
import fs from 'fs'
import * as paths from '../paths'

export interface EslintOptions {
  quiet: boolean
  format: string
  color: boolean
  config: string
  fix: boolean
}

export interface StylelintOptions {
  quiet: boolean
  formatter: string
  color: boolean
  config: string
  fix: boolean
}

export function createEslintConfig(overrideConfig: Linter.BaseConfig = {}): Linter.BaseConfig {
  return merge<Linter.BaseConfig, Linter.BaseConfig>(
    {
      parser: '@typescript-eslint/parser',
      parserOptions: {
        ecmaVersion: 2020, // Allows for the parsing of modern ECMAScript features
        sourceType: 'module', // Allows for the use of imports
      },
      extends: ['plugin:@typescript-eslint/recommended', 'plugin:prettier/recommended'],
    },
    overrideConfig,
  )
}

export function createStylelintConfig(overrideConfig: Partial<Configuration> = {}): Partial<Configuration> {
  return merge<Partial<Configuration>, Partial<Configuration>>(
    {
      extends: 'stylelint-config-sass-guidelines',
    },
    overrideConfig,
  )
}

export function createPrettierConfig(overrideConfig: Partial<Options>): Partial<Options> {
  return merge<Options, Options>(
    {
      semi: false,
      trailingComma: 'all',
      singleQuote: true,
      printWidth: 120,
      tabWidth: 2,
    },
    overrideConfig,
  )
}

export function lintModule(program: Command): void {
  program
    .command('lint')
    .option('--fix', 'Automatically fix problems', false)
    .option('--scripts-pattern <scriptsPattern>', 'Glob pattern of included script files')
    .option('--styles-pattern <stylesPattern>', 'Glob pattern of included style files')
    .option('--quiet', 'Report errors only', false)
    .option('--format <format>', 'Use a specific output format', 'stylish')
    .option('--color', 'Force enabling of color', false)
    .description('Lint all files')
    .action(async (cmd) => {
      const scriptsPattern: string = cmd.scriptsPattern || 'src/**/*.{ts,tsx}'
      const stylesPattern: string = cmd.stylesPattern || 'src/**/*.{sass,scss}'
      const eslintOptions: EslintOptions = {
        quiet: Boolean(cmd.quiet),
        format: cmd.format,
        color: Boolean(cmd.color),
        config: paths.eslintrc,
        fix: Boolean(cmd.fix),
      }
      const stylelintOptions: StylelintOptions = {
        quiet: Boolean(cmd.quiet),
        formatter: 'string',
        color: Boolean(cmd.color),
        config: paths.stylelintrc,
        fix: Boolean(cmd.fix),
      }

      const eslintArgv = [
        ...Object.keys(eslintOptions)
          .filter((key: string) => !!eslintOptions[key])
          .reduce<string[]>((acc, key) => {
            acc.push(`--${key}`)

            if (typeof eslintOptions[key] !== 'boolean') {
              acc.push(eslintOptions[key])
            }

            return acc
          }, []),
        scriptsPattern,
      ]
      const stylelintArgv = [
        ...Object.keys(stylelintOptions)
          .filter((key: string) => !!stylelintOptions[key])
          .reduce<string[]>((acc, key) => {
            acc.push(`--${key}`)

            if (typeof stylelintOptions[key] !== 'boolean') {
              acc.push(stylelintOptions[key])
            }

            return acc
          }, []),
        stylesPattern,
      ]

      let exitCode = 0

      if (fs.existsSync(paths.eslintrc)) {
        exitCode = await eslintCli.execute(eslintArgv)
      }

      if (fs.existsSync(paths.stylelintrc)) {
        await stylelintCli(stylelintArgv)
      }

      process.exit(process.exitCode || exitCode ? 2 : 0)
    })
}
