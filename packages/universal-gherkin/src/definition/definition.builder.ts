import { StepDefinition, StepMatch, StepExecutionFunction } from './models/stepDefinition.model'
import { GherkinParser } from '../gherkin/gherkin.parser'
import { Feature } from '../gherkin/models/feature.model'

export interface Options {
  timeout: number
}

export interface StackTraceItem {
  filename: string
  row: number
  column: number
}

export interface Adapter {
  run<World>(feature: Feature, world: World, hooks: HookMap, options: Options, stackTrace: StackTraceItem[]): void
}

export type StepType = 'given' | 'when' | 'then'

export interface StepDefinitionsMap<World = any> {
  given: StepDefinition<World, any, any>[]
  when: StepDefinition<World, any, any>[]
  then: StepDefinition<World, any, any>[]
}

export interface Hook<World> {
  (world: World): Promise<void> | void
}

export interface HookMap<World = any> {
  beforeFeature: Hook<World>[],
  beforeScenario: Hook<World>[],
  afterScenario: Hook<World>[],
  afterFeature: Hook<World>[],
}

export class DefinitionBuilder<World = any> {
  world: World = {} as any

  private options: Options

  constructor(
    options: Partial<Options>,
    private readonly adapter: Adapter,
    private readonly parser: GherkinParser = new GherkinParser(),
  ) {
    this.options = Object.assign<any, Options, Partial<Options>>({}, {
      timeout: 300,
    }, options)
  }

  hooks: HookMap<World> = {
    beforeFeature: [],
    beforeScenario: [],
    afterScenario: [],
    afterFeature: [],
  }

  steps: StepDefinitionsMap<World> = {
    given: [],
    when: [],
    then: [],
  }

  from(definition: DefinitionBuilder): this {
    this.steps.given.push(...definition.steps.given)
    this.steps.when.push(...definition.steps.when)
    this.steps.then.push(...definition.steps.then)

    return this
  }

  beforeFeature(hook: Hook<World>): this {
    this.hooks.beforeFeature.push(hook)

    return this
  }

  beforeScenario(hook: Hook<World>): this {
    this.hooks.beforeScenario.push(hook)

    return this
  }

  afterScenario(hook: Hook<World>): this {
    this.hooks.afterScenario.push(hook)

    return this
  }

  afterFeature(hook: Hook<World>): this {
    this.hooks.afterFeature.push(hook)

    return this
  }

  withGiven<Params = any, Data = any>(
    stepMatcher: StepMatch,
    stepExecution: StepExecutionFunction<World, Params, Data>,
  ): this {
    this.steps['given'].push(
      new StepDefinition<World, Params, Data>(stepMatcher, stepExecution)
    )

    return this
  }

  withWhen<Params = any, Data = any>(
    stepMatcher: StepMatch,
    stepExecution: StepExecutionFunction<World, Params, Data>,
  ): this {
    this.steps['when'].push(
      new StepDefinition<World, Params, Data>(stepMatcher, stepExecution)
    )

    return this
  }

  withThen<Params = any, Data = any>(
    stepMatcher: StepMatch,
    stepExecution: StepExecutionFunction<World, Params, Data>,
  ): this {
    this.steps['then'].push(
      new StepDefinition<World, Params, Data>(stepMatcher, stepExecution)
    )

    return this
  }

  run(gherkinFeature: string): void {
    const gherkinLineMatch: any = new Error().stack?.split('\n')[2].match(/\((.*):(.*):(.*)\)/)
    const stackTrace: StackTraceItem[] = [
      { 
        filename: gherkinLineMatch[1], 
        row: Number(gherkinLineMatch[2]), 
        column: Number(gherkinLineMatch[3])
      }
    ]

    try {
      const feature = this.parser.parse(gherkinFeature, this.steps)

      return this.adapter.run<World>(feature, this.world, this.hooks, this.options, stackTrace)
    } catch (err) {
      throw new Error(`Error parsing feature Gherkin: ${err.message}`);
    }
  }
}
