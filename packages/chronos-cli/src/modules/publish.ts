import { Command } from 'commander'
import util from 'util'
import path from 'path'
import fs from 'fs'
import { exec, spawn } from 'child_process'
import { chunksToLinesAsync, chomp } from '@rauschma/stringio'

const execPromise = util.promisify(exec)

async function echoReadable(readable) {
  // eslint-disable-next-line no-restricted-syntax
  for await (const line of chunksToLinesAsync(readable)) {
    console.log(chomp(line))
  }
}

export interface Dependencies {
  [key: string]: string
}

export interface NpmPackage {
  name: string
  relativePath: string
}

export function replaceWildcardsToRelativePaths(
  packages: NpmPackage[],
  pack: NpmPackage,
  dependencies: Dependencies,
): Dependencies {
  return Object.entries(dependencies).reduce((acc, [packageName, packageVersion]) => {
    const dependency = packages.find((pack) => pack.name === packageName)

    if (dependency) {
      const packageRelativePath = path.relative(pack.relativePath, path.join(process.cwd(), dependency.relativePath))

      acc[packageName] = `file:${packageRelativePath}`
    } else {
      acc[packageName] = packageVersion
    }

    return acc
  }, {})
}

export function publishModule(program: Command): void {
  program
    .command('publish')
    .option('--new-version [version]', 'The version with which the packages will be published')
    .option('--skip-build', 'Should script run build before publish')
    .action(async (cmd) => {
      const lernaBin = (await execPromise('yarn bin lerna')).stdout.toString().replace(/(\r\n|\n|\r)/gm, '')
      const packages = (await execPromise(`${lernaBin} ls -l`)).stdout
        .toString()
        .split(/\r?\n/)
        .filter((pack) => pack !== '')
        .map((pack) => {
          const info = pack.replace(/ +(?= )/g, '').split(' ')

          return {
            name: info[0],
            relativePath: info[2],
          }
        })

      if (!cmd.skipBuild) {
        const buildSource = spawn(lernaBin, ['run', '--no-private', '--stream', 'build'], {
          stdio: ['ignore', 'pipe', process.stderr],
        })

        await echoReadable(buildSource.stdout)
      }

      // eslint-disable-next-line no-restricted-syntax
      for (const pack of packages) {
        const filename = path.join(process.cwd(), pack.relativePath, 'package.json')
        const packageJson = JSON.parse(fs.readFileSync(filename).toString())

        packageJson.version = cmd.newVersion
        packageJson.main = 'dist/index.js'

        if (packageJson.dependencies) {
          packageJson.dependencies = replaceWildcardsToRelativePaths(packages, pack, packageJson.dependencies)
        }

        if (packageJson.devDependencies) {
          packageJson.devDependencies = replaceWildcardsToRelativePaths(packages, pack, packageJson.devDependencies)
        }

        fs.writeFileSync(filename, JSON.stringify(packageJson, null, 2))
      }

      await execPromise('git add .')
      await execPromise('git commit -m "this will not be pushed"')

      const publishSource = spawn(
        lernaBin,
        [
          'publish',
          '--no-git-tag-version',
          '--no-verify-access',
          '--no-push',
          '-y',
          '--ignore-scripts',
          '--no-git-reset',
          'from-package',
        ],
        { stdio: ['ignore', 'pipe', process.stderr] },
      )

      await echoReadable(publishSource.stdout)

      await exec('git reset HEAD~1 --hard')
    })
}
