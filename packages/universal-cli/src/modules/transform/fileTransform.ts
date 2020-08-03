import path from 'path'

export function process(src: string, filename: string): string {
  return `module.exports = ${JSON.stringify(path.basename(filename))};`
}
