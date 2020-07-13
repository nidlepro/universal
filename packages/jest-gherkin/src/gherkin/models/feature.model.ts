import { Scenario } from './scenario.model'
import { Tag, parseTags } from './tag.model'
import { Step } from './step.model'
import { DataTable, DataTableRow } from './dataTable.model'
import { StepDefinitionsMap } from '../../definition/definition.builder'

export function interpolateReplace(text: string, data: any) {
  return text.replace(/<(\S*)>/g, (_, firstMatch: string) => (
    data[firstMatch] || ''
  ))
}

export function parseOutlineScenario(astOutlineScenario: any, stepDefinitions: StepDefinitionsMap): Scenario[] {
  const examples = DataTable.fromGherkin({
    rows: [astOutlineScenario.examples[0].tableHeader, ...astOutlineScenario.examples[0].tableBody],
    location: astOutlineScenario.examples[0].location,
  }) as DataTable

  return examples.rows.map((example: DataTableRow<any>) => {
    return new Scenario(
      interpolateReplace(astOutlineScenario.name, example.data),
      astOutlineScenario.steps.map((step: any) => (
        Step.fromGherkin({
          ...step,
          text: interpolateReplace(step.text, example.data),
        }, stepDefinitions)
      )),
      parseTags(astOutlineScenario.tags),
      astOutlineScenario.location.line,
    )
  })
}

export class Feature {
  constructor(
    public readonly title: string,
    public readonly scenarios: Scenario[],
    public readonly tags: Tag[],
  ) {}

  run() {}

  static fromGherkin(astFeature: any, stepDefinitions: StepDefinitionsMap): Feature {
    const backgroundSteps = astFeature.children
      .filter((child: any) => child.background)
      .map((child: any) => child.background)
      .reduce((steps: any[], background: any) => {
        steps.push(...background.steps)

        return steps
      }, [])

    return new Feature(
      astFeature.name as string,
      astFeature.children
        .filter((child: any) => child.scenario)
        .reduce((scenarios: Scenario[], { scenario }: any) => {
          if (scenario.keyword === 'Scenario') {
            scenarios.push(Scenario.fromGherkin({
              ...scenario,
              steps: [...backgroundSteps, ...scenario.steps]
            }, stepDefinitions))
          } else {
            scenarios.push(...parseOutlineScenario({
              ...scenario,
              steps: [...backgroundSteps, ...scenario.steps]
            }, stepDefinitions))
          }

          return scenarios
        }, []),
      parseTags(astFeature.tags),
    )
  }
}