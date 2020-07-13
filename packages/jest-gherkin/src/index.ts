import { DefinitionBuilder, Options } from './definition/definition.builder'
import { Adapter } from './adapters/jest.adapter'

export function createDefinition<World>(options: Options = {}, adapter?: Adapter): DefinitionBuilder<World> {
  return new DefinitionBuilder(options, adapter)
}
