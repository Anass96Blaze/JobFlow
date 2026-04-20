import type { ReferenceRow, ReferenceMetaMap, UiSelectOption } from './types'

/**
 * Priority visual mapping.
 *
 *  High   → red    (urgent / hot)
 *  Medium → amber  (warm)
 *  Low    → gray   (muted)
 */
export const PRIORITY_META: ReferenceMetaMap = {
  High:   { color: 'red' },
  Medium: { color: 'amber' },
  Low:    { color: 'gray' },
}

const FALLBACK = { color: 'gray' } as const

export function mapPrioritiesToOptions(priorities: ReferenceRow[]): UiSelectOption[] {
  return [...priorities]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((p) => {
      const meta = PRIORITY_META[p.name] ?? FALLBACK
      return {
        value: p.id,
        label: p.name,
        color: meta.color,
      }
    })
}
