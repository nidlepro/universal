import { DefinitionBuilder, Options, Adapter } from './definition/definition.builder'

export { JasmineAdapter } from './adapters/jasmine.adapter'
export { JestAdapter } from './adapters/jest.adapter'

export function createDefinition<World>(options: Options = {}, adapter?: Adapter): DefinitionBuilder<World> {
  return new DefinitionBuilder(options, adapter)
}
