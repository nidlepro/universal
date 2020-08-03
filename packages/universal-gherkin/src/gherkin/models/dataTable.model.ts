export class DataTableRow<T> {
  constructor(
    public readonly data: T,
    public readonly lineNumber: number
  ) {}
}

export class DataTable<T = any> {
  constructor(
    public readonly rows: DataTableRow<T>[],
    public readonly lineNumber: number,
  ) {}

  static fromGherkin(astDataTable: any): DataTable | undefined {
    if (!astDataTable) return

    const [ header, ...rows ] = astDataTable.rows 

    return new DataTable(
      rows.map((row: any) => (
        new DataTableRow(
          row.cells.reduce((data: any, cell: any, idx: number) => {
            data[header.cells[idx].value] = cell.value

            return data
          }, {}),
          row.location.line,
        )
      )),
      astDataTable.location.line,
    )
  }
}