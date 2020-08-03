import { Options, HookMap, StackTraceItem } from '../definition/definition.builder'
import { BaseAdapter } from './base.adapter'
import { Feature } from '../gherkin/models/feature.model'

export class JasmineAdapter extends BaseAdapter {
  run<World>(
    feature: Feature, 
    world: World, 
    hooks: HookMap, 
    options: Options, 
    stackTrace: StackTraceItem[]
  ): void {
    const describeFn = feature.tags.includes('@skip') ? xdescribe : describe

    describeFn(this.getFeatureTitle(feature), () => {
      hooks.beforeFeature.forEach((hook) => {
        beforeAll(() => (
          hook(world)
        ))
      })

      hooks.beforeScenario.forEach((hook) => {
        beforeEach(() => (
          hook(world)
        ))
      })

      hooks.afterFeature.forEach((hook) => {
        afterAll(() => (
          hook(world)
        ))
      })

      hooks.afterScenario.forEach((hook) => {
        afterEach(() => (
          hook(world)
        ))
      })

      feature.scenarios.forEach((scenario) => {
        const itFn = scenario.tags.includes('@skip') ? xit : it

        itFn(this.getScenarioTitle(scenario), () => (
          this.handleScenario(scenario, world, options, stackTrace)
        ))
      })
    })
  }
}
