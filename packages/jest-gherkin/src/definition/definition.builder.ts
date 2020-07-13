import { StepDefinition, StepMatch, StepExecutionFunction } from './models/stepDefinition.model'
import { GherkinParser } from '../gherkin/gherkin.parser'
import { JestAdapter, Adapter } from '../adapters/jest.adapter'

export type StepType = 'given' | 'when' | 'then'

export interface StepDefinitionsMap<World = any> {
  given: StepDefinition<World, any, any>[]
  when: StepDefinition<World, any, any>[]
  then: StepDefinition<World, any, any>[]
}

export interface Options {}

export class DefinitionBuilder<World = any> {
  world: World = {} as any

  constructor(
    private readonly options: Options = {},
    private readonly adapter: Adapter = new JestAdapter(),
    private readonly parser: GherkinParser = new GherkinParser(),
  ) {}

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
    try {
      const feature = this.parser.parse(gherkinFeature, this.steps)

      return this.adapter.run<World>(feature, this.world)
    } catch (err) {
      throw new Error(`Error parsing feature Gherkin: ${err.message}`);
    }
  }
}
