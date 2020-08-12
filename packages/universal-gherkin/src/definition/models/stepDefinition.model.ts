import { DocString } from '../../gherkin/models/docString.model'
import { DataTable } from '../../gherkin/models/dataTable.model'

export interface StepExecutionContext<World, Params, Data> {
  world: World
  params: Params
  dataTable: DataTable<Data>
  docString: DocString
}

export interface StepExecutionFunction<World, Params, Data> {
  (context: StepExecutionContext<World, Params, Data>): Promise<any> | void
}

export type StepMatch = string | RegExp

export class StepDefinition<World = any, Params = any, Data = any> {
  constructor(
    public readonly match: StepMatch,
    public readonly execution: StepExecutionFunction<World, Params, Data>
  ) {}
}
