import { Archive, ClipboardList, Clock, FileText, Handshake, Send, ThumbsUp } from 'lucide-react'
import type { ReferenceRow, ReferenceMetaMap, UiSelectOption } from './types'

const iconClass = 'h-3.5 w-3.5'

/**
 * Action-type visual mapping. Icons are kept subtle (small, muted,
 * inherited color) so they enrich the row without competing with the
 * label.
 */
export const ACTION_TYPE_META: ReferenceMetaMap = {
  'Tailor CV':          { color: 'blue',    icon: <FileText className={iconClass} /> },
  'Submit Application': { color: 'indigo',  icon: <Send className={iconClass} /> },
  'Follow Up':          { color: 'violet',  icon: <Send className={iconClass} /> },
  'Prep Interview':     { color: 'purple',  icon: <ClipboardList className={iconClass} /> },
  'Send Thank You':     { color: 'green',   icon: <ThumbsUp className={iconClass} /> },
  'Negotiate Offer':    { color: 'emerald', icon: <Handshake className={iconClass} /> },
  'Wait':               { color: 'amber',   icon: <Clock className={iconClass} /> },
  'Archive':            { color: 'slate',   icon: <Archive className={iconClass} /> },
}

const FALLBACK = { color: 'gray' } as const

export function mapActionTypesToOptions(actionTypes: ReferenceRow[]): UiSelectOption[] {
  return [...actionTypes]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((a) => {
      const meta = ACTION_TYPE_META[a.name] ?? FALLBACK
      return {
        value: a.id,
        label: a.name,
        color: meta.color,
        icon: meta.icon,
      }
    })
}
