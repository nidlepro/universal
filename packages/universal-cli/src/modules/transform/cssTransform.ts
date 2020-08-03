export function process(): string {
  return 'module.exports = {};'
}

export function getCacheKey(): string {
  // The output is always the same.
  return 'cssTransform'
}
