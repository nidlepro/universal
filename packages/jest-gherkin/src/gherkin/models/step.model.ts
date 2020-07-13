import { DocString } from './docString.model'
import { DataTable } from './dataTable.model'
import { StepDefinitionsMap } from '../../definition/definition.builder'
import { StepDefinition } from '../../definition/models/stepDefinition.model'

export class MultipleStepDefinitionError extends Error {
  constructor(
    public readonly stepText: string, 
    public readonly lineNumber: number, 
    public readonly matches: StepDefinition[]
  ) {
    super(`Multiple Step Definition for "${stepText}"`)
  }
}

export class UndefinedStepError extends Error {
  constructor(
    public readonly stepText: string, 
    public readonly lineNumber: number, 
    public readonly matches: StepDefinition[]
  ) {
    super(`Undefined step "${stepText}"`)
  }
}

export class Step {
  constructor(
    public readonly text: string,
    public readonly keyword: string,
    public readonly lineNumber: number,
    public readonly definition: StepDefinition,
    public readonly params: any,
    public readonly docString?: DocString,
    public readonly dataTable?: DataTable,
  ) {}

  static fromGherkin(astStep: any, stepDefinitions: StepDefinitionsMap) {
    const keyword = astStep.keyword.trim().toLowerCase() as string
    let params: any
    const matchedDefinitions: StepDefinition[] = stepDefinitions[keyword].filter((stepDefinition: StepDefinition) => {
      if (typeof stepDefinition.match === 'string') {
        return stepDefinition.match === astStep.text
      } else if (stepDefinition.match instanceof RegExp) {
        const match = (astStep.text as string).match(stepDefinition.match)
        
        params = match?.groups

        return match
      }
      
      return false
    })

    if (matchedDefinitions.length > 1) {
      throw new MultipleStepDefinitionError(
        astStep.text,
        astStep.location.line,
        matchedDefinitions,
      )
    } else if (matchedDefinitions.length === 0) {
      throw new UndefinedStepError(
        astStep.text,
        astStep.location.line,
        matchedDefinitions,
      )
    }

    return new Step(
      astStep.text,
      keyword,
      astStep.location.line,
      matchedDefinitions[0],
      params,
      DocString.fromGherkin(astStep.docString),
      DataTable.fromGherkin(astStep.dataTable),
    )
  }
}
