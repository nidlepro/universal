export class DocString {
  constructor(
    public readonly content?: string,
    public readonly lineNumber?: number,
  ) {}

  static fromGherkin(astDocString: any): DocString | undefined {
    if (!astDocString) return

    return new DocString(
      astDocString.content,
      astDocString.location.line,
    )
  }
}
