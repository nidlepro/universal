import { hex } from 'chalk'
import { Feature } from '../gherkin/models/feature.model'
import { Adapter, Options, HookMap, StackTraceItem } from '../definition/definition.builder'
import { Scenario } from '../gherkin/models/scenario.model'
import { Step } from '../gherkin/models/step.model'

export interface TimeoutOptions {
  wait: number
  rejectMessage: string
}

const capitalize = (s: string): string => {
  if (typeof s !== 'string') return ''
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export class StepFailedError extends Error {}

export abstract class BaseAdapter implements Adapter {
  abstract run<World>(
    feature: Feature,
    world: World,
    hooks: HookMap,
    options: Options,
    stackTrace: StackTraceItem[]
  ): void

  protected handleScenario<World = any>(scenario: Scenario, world: World, options: Options, stackTrace: StackTraceItem[]) {
    let failedStep: Step

    return scenario.steps.reduce<Promise<any>>((promise, step) => {
      return promise.then(() => this.timeoutPromise(Promise.resolve(step.definition.execution({
        world,
        params: step.params,
        dataTable: step.dataTable,
        docString: step.docString,
      })), { wait: options.timeout, rejectMessage: `Step "${step.text}" exceeded timeout` })).catch(err => {
        if (!failedStep) {
          failedStep = step
        }

        return Promise.reject(err)
      })
    }, Promise.resolve()).catch(err => {
      const stepError = new StepFailedError(err.message)

      const stack = err.stack.split('\n').filter(stackRow => !/base\.adapter\./.test(stackRow) && !/task_queues\.js/.test(stackRow))
    
      stackTrace.forEach((item) => {
        stack.push(`    at gherkin (${item.filename}:${item.row + failedStep.lineNumber - 1}:0)`)
      })

      stepError.stack = stack.join('\n')

      return Promise.reject(stepError)
    })
  }

  protected timeoutPromise(promise: Promise<any>, options: TimeoutOptions): Promise<any> {
    const timeout = new Promise((_ , reject) => {
      const id = setTimeout(() => {
        clearTimeout(id)
        reject(options.rejectMessage)
      }, options.wait)
    })

    return Promise.race([
      promise,
      timeout,
    ])
  }

  protected getScenarioTitle(scenario: Scenario): string {
    return [
      `${hex('#7c5295')('Scenario')}: ${hex('#eee')(scenario.title)}`, 
      ...scenario.steps.map(step => `  ${hex('#FFCA4B')(capitalize(step.originalKeyword).padStart(7, ' '))}${hex('#eee')(step.text.trim())}`),
    ].join('\n')
  }

  protected getFeatureTitle(feature: Feature): string {
    return `${hex('#7c5295')('Feature')}: ${hex('#eee')(feature.title)}`
  }
}