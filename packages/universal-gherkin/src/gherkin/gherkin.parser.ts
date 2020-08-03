import { Parser, AstBuilder } from '@cucumber/gherkin'
import { Feature } from './models/feature.model'
import { StepDefinitionsMap } from '../definition/definition.builder'

export class GherkinParser {
  constructor(
    private readonly parser: Parser = new Parser(
      new AstBuilder(() => '')
    ),
  ) {}

  parse(gherkinFeature: string, stepDefinitions: StepDefinitionsMap): Feature {
    const { feature }: any = this.parser.parse(gherkinFeature)

    return Feature.fromGherkin(feature, stepDefinitions)
  }
}
