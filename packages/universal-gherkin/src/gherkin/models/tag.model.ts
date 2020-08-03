export type Tag = string

export function parseTags(tags: any[] = []): Tag[] {
  return tags.map((tag: any) => tag.name.toLowerCase())
}
