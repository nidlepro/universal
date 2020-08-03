/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Command } from 'commander'
import * as jest from 'jest'
import path from 'path'
import merge from 'lodash/merge'

export function createJestConfig(overrideConfig: any): any {
  return merge<any, any>(
    {
      collectCoverageFrom: ['src/**/*.{ts,tsx}'],
      collectCoverage: true,
      setupFiles: [require.resolve('reflect-metadata')],
      moduleFileExtensions: ['web.js', 'js', 'json', 'node', 'mjs', 'ts', 'tsx'],
      transform: {
        '^.+\\.(ts|tsx)$': path.join(__dirname, 'transform/tsTransform.js'),
        '^.+\\.sass$': path.join(__dirname, 'transform/cssTransform.js'),
        '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': path.join(__dirname, 'transform/fileTransform.js'),
      },
      testMatch: ['<rootDir>/src/**/?(*.)(spec).{ts,tsx}'],
      testURL: 'http://localhost',
      testEnvironment: 'node',
      notify: !process.env.CI,
    },
    overrideConfig,
  )
}

export function testModule(program: Command): void {
  program
    .command('test')
    .option(
      '--env <environment>',
      'The test environment used for all tests. This can point to any file or node module. Examples: jsdom, node or path/to/my-environment.js.',
      'jsdom',
    )
    .option(
      '--watch',
      'Watch files for changes and rerun tests related to changed files. If you want to re-run all tests when a file has changed, use the "--watchAll" option instead.',
      false,
    )
    .option('--watchAll', 'Watch all files for changes and trigger tests', false)
    .option(
      '--testPathPattern <regex>',
      'A regexp pattern string that is matched against all tests paths before executing the test. On Windows, you will need to use / as a path separator or escape \\ as \\\\',
    )
    .option('--verbose', 'Display individual test results with the test suite hierarchy.', false)
    .option(
      '--coverage',
      'Indicates that test coverage information should be collected and reported in the output.',
      false,
    )
    .option('--ci', 'When this option is provided, Jest will assume it is running in a CI environment.', false)
    .description('Run tests')
    .action((cmd) => {
      const ci = Boolean(cmd.ci)
      const options = {
        env: cmd.env,
        watch: Boolean(cmd.watch) && !ci,
        watchAll: Boolean(cmd.watchAll) && !ci,
        testPathPattern: cmd.testPathPattern,
        verbose: Boolean(cmd.verbose),
        coverage: Boolean(cmd.coverage),
        ci,
      }
      const argv = Object.keys(options)
        .filter((key) => !!options[key])
        .reduce<string[]>((acc, key) => {
          acc.push(`--${key}`)

          if (typeof options[key] !== 'boolean') {
            acc.push(options[key])
          }

          return acc
        }, [])

      jest.run(argv)
    })
}
