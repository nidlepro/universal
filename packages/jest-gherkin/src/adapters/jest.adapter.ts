import { Feature } from "../gherkin/models/feature.model";

export interface Adapter {
  run<World>(feature: Feature, world: World): void
}

export class JestAdapter implements Adapter {
  run<World>(feature: Feature, world: World): void {
    describe(feature.title, () => {
      feature.scenarios.forEach((scenario) => {
        test(scenario.title, () => (
          scenario.steps.reduce<Promise<any>>((promise, step) => {
            return promise.then(() => step.definition.execution({
              world,
              params: step.params,
              dataTable: step.dataTable,
              docString: step.docString,
            }))
          }, Promise.resolve())
        ))
      })
    })
  }
}
