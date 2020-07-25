const chalk = require('chalk')

class GherkinConsoleReporter {
  constructor(globalConfig, options) {
    this._globalConfig = globalConfig
    this._options = options
  }

  onTestResult(test, testResult, aggregatedResult) {
    console.log(testResult)

    const resultsGroups = testResult.testResults.reduce((acc, result) => {
      if (!acc[result.ancestorTitles[0]]) {
        acc[result.ancestorTitles[0]] = []
      }

      acc[result.ancestorTitles[0]].push(result)

      return acc
    }, {})

    console.log('\n' + Object.keys(resultsGroups).map((groupName) => {
      return `${groupName}\n\n${resultsGroups[groupName].map(result => {
        if (result.status === 'failed') {
          return `${result.title}\n\n${chalk.red(result.failureMessages)}`
        }

        return result.title
      }).join('\n\n')}\n`
    }).join('\n----------------------------------------\n\n'))
  }
}

module.exports = GherkinConsoleReporter
