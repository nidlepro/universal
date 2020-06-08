import { Command } from 'commander'

export interface LoadModuleFunction {
  (program: Command): void
}

export class Cli {
  constructor(private readonly program: Command) {}

  public load(loadModule: LoadModuleFunction): void {
    loadModule(this.program)
  }

  public execute(argv: string[]): void {
    this.program.parse(argv)
  }
}
