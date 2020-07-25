import { DefinitionBuilder, Options, Adapter } from './definition/definition.builder'
import { JestAdapter } from './adapters/jest.adapter'

export { JasmineAdapter } from './adapters/jasmine.adapter'
export { JestAdapter } from './adapters/jest.adapter'

let _adapter: Adapter = new JestAdapter()

export function getAdapter(): Adapter {
  return _adapter
}

export function configureAdapter(adapter: Adapter): void {
  _adapter = adapter 
}

export function createDefinition<World>(options: Partial<Options> = {}): DefinitionBuilder<World> {
  return new DefinitionBuilder(options, getAdapter())
}
