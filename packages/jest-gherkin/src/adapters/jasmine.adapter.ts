import { Adapter } from '../definition/definition.builder'
import { Feature } from '../gherkin/models/feature.model'

export class JasmineAdapter implements Adapter {
  run<World>(feature: Feature, world: World): void {
    describe(feature.title, () => {
      feature.scenarios.forEach((scenario) => {
        it(scenario.title, (done: any) => (
          scenario.steps.reduce<Promise<any>>((promise, step) => {
            return promise.then(() => step.definition.execution({
              world,
              params: step.params,
              dataTable: step.dataTable,
              docString: step.docString,
            }))
          }, Promise.resolve()).then(done)
        ))
      })
    })
  }
}
