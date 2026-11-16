export function pickRandom<T>(items: readonly T[], random: () => number = Math.random): T | null {
  if (items.length === 0) return null
  const index = Math.min(Math.floor(random() * items.length), items.length - 1)
  return items[index] ?? null
}
