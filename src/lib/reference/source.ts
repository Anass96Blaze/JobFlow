import type { ReferenceRow, ReferenceMetaMap, UiSelectOption } from './types'

/**
 * Sources are intentionally neutral — no strong colors. The goal is a
 * calm, readable list so the user's attention stays on status and
 * priority, not on where a job was found.
 *
 * Extend this map if you ever want to differentiate e.g. "Referral"
 * with a subtle accent.
 */
export const SOURCE_META: ReferenceMetaMap = {
  LinkedIn:   {},
  Indeed:     {},
  Referral:   { color: 'emerald' },
  Company:    {},
  Recruiter:  {},
  Other:      {},
}

export function mapSourcesToOptions(sources: ReferenceRow[]): UiSelectOption[] {
  return [...sources]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((s) => {
      const meta = SOURCE_META[s.name] ?? {}
      return {
        value: s.id,
        label: s.name,
        color: meta.color,
      }
    })
}
