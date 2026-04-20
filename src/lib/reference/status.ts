import type { ReferenceRow, ReferenceMetaMap, UiSelectOption } from './types'

/**
 * Canonical status groups used for grouped rendering in AppSelect.
 */
export const STATUS_GROUPS = {
  pipeline: 'Pipeline',
  results: 'Results',
} as const

/**
 * Visual metadata for application statuses, keyed by DB `name`.
 *
 * The DB only stores `{ id, name, sort_order }` — everything visual
 * lives here so designers can tweak the UI without a migration.
 */
export const STATUS_META: ReferenceMetaMap = {
  'To Apply':        { color: 'gray',   group: STATUS_GROUPS.pipeline },
  'Applied':         { color: 'blue',   group: STATUS_GROUPS.pipeline },
  'HR Screening':    { color: 'indigo', group: STATUS_GROUPS.pipeline },
  'Interview':       { color: 'purple', group: STATUS_GROUPS.pipeline },
  'Final Interview': { color: 'violet', group: STATUS_GROUPS.pipeline },

  'Offer':       { color: 'green', group: STATUS_GROUPS.results },
  'Rejected':    { color: 'red',   group: STATUS_GROUPS.results },
  'No Response': { color: 'slate', group: STATUS_GROUPS.results },
  'On Hold':     { color: 'amber', group: STATUS_GROUPS.results },
  'Withdrawn':   { color: 'rose',  group: STATUS_GROUPS.results },
}

const FALLBACK = { color: 'gray' } as const

export function mapStatusesToOptions(statuses: ReferenceRow[]): UiSelectOption[] {
  return [...statuses]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((s) => {
      const meta = STATUS_META[s.name] ?? FALLBACK
      return {
        value: s.id,
        label: s.name,
        color: meta.color,
        group: meta.group,
      }
    })
}
