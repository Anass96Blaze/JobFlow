import type { ReactNode } from 'react'

/**
 * Raw reference-table row shape as it lives in Supabase.
 * All reference tables (statuses, priorities, sources, action_types)
 * share this exact shape.
 *
 * Keep this minimal. Never store UI concerns (colors, icons) in the DB.
 */
export interface ReferenceRow {
  id: string
  name: string
  sort_order: number
}

/**
 * Semantic color tokens supported by the UI layer (AppSelect ColorDot,
 * badges, etc.). Adding a new token? Register it in `app-select.tsx`
 * `dotColors` as well.
 */
export type SemanticColor =
  | 'gray'
  | 'slate'
  | 'blue'
  | 'indigo'
  | 'purple'
  | 'violet'
  | 'green'
  | 'emerald'
  | 'red'
  | 'orange'
  | 'amber'
  | 'yellow'
  | 'rose'
  | 'teal'

/**
 * UI-friendly option consumed by the Radix-based `AppSelect`.
 * This is what every mapper produces.
 */
export interface UiSelectOption {
  value: string
  label: string
  color?: SemanticColor
  icon?: ReactNode
  group?: string
  description?: string
}

/**
 * Visual/grouping metadata for a single reference entry, keyed by the
 * canonical `name` stored in the DB. Mappers merge this with the raw
 * row at render time.
 */
export interface ReferenceMeta {
  color?: SemanticColor
  icon?: ReactNode
  group?: string
  description?: string
}

export type ReferenceMetaMap = Record<string, ReferenceMeta>
