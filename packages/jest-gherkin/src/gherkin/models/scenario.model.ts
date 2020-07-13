import { Tag, parseTags } from './tag.model'
import { Step } from './step.model'
import { StepDefinitionsMap } from '../../definition/definition.builder'

export class Scenario {
  constructor(
    public readonly title: string,
    public readonly steps: Step[],
    public readonly tags: Tag[],
    public readonly lineNumber: number
  ) {}

  static fromGherkin(astScenario: any, stepDefinitions: StepDefinitionsMap) {
    return new Scenario(
      astScenario.name,
      astScenario.steps.reduce((steps: Step[], astStep: any) => {
        steps.push(Step.fromGherkin({
          ...astStep,
          // When use and we should use keyword from previous step until different keyword appears
          keyword: ['and', 'but'].includes(astStep.keyword.trim().toLowerCase())
            ? steps[steps.length - 1].keyword 
            : astStep.keyword
        }, stepDefinitions))
        
        return steps
      }, []),
      parseTags(astScenario.tags),
      astScenario.location.line,
    )
  }
}