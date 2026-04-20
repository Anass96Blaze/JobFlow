import type { UiSelectOption } from './types'

/**
 * Reference-data UI layer.
 *
 * Responsibility split:
 *  - Supabase: stores only `{ id, name, sort_order }` per reference table.
 *  - This folder: owns every visual decision (color, icon, grouping)
 *    and turns raw rows into `UiSelectOption`s for `AppSelect`.
 *
 * To add a new reference table:
 *  1. Create `<name>.ts(x)` in this folder.
 *  2. Export a `XXX_META: ReferenceMetaMap` constant.
 *  3. Export a `mapXxxToOptions(rows)` helper.
 *  4. Re-export both from this barrel.
 */

export * from './types'
export { STATUS_META, STATUS_GROUPS, mapStatusesToOptions } from './status'
export { PRIORITY_META, mapPrioritiesToOptions } from './priority'
export { SOURCE_META, mapSourcesToOptions } from './source'
export { ACTION_TYPE_META, mapActionTypesToOptions } from './action-type'

/**
 * Small utility for freeform string lists (e.g. interview formats,
 * outcomes) that don't have a reference table yet.
 */
export function mapStringsToOptions(values: string[]): UiSelectOption[] {
  return values.map((v) => ({ value: v, label: v }))
}
