import * as SelectPrimitive from '@radix-ui/react-select'
import { Check, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SelectOption {
  label: string
  value: string
  color?: string
  icon?: React.ReactNode
  group?: string
}

interface AppSelectProps {
  label?: string
  placeholder?: string
  options: SelectOption[]
  value?: string
  onValueChange?: (value: string) => void
  disabled?: boolean
  className?: string
  error?: string
  required?: boolean
  size?: 'sm' | 'md'
}

const dotColors: Record<string, string> = {
  gray:    'bg-gray-400',
  slate:   'bg-slate-400',
  blue:    'bg-blue-500',
  indigo:  'bg-indigo-500',
  purple:  'bg-purple-500',
  violet:  'bg-violet-500',
  green:   'bg-emerald-500',
  emerald: 'bg-emerald-500',
  red:     'bg-red-500',
  orange:  'bg-orange-500',
  amber:   'bg-amber-500',
  yellow:  'bg-yellow-400',
  rose:    'bg-rose-500',
  teal:    'bg-teal-500',
}

function ColorDot({ color, size = 'md' }: { color?: string; size?: 'sm' | 'md' }) {
  if (!color) return null
  return (
    <span
      className={cn(
        'shrink-0 rounded-full ring-1 ring-black/10',
        dotColors[color] || 'bg-gray-400',
        size === 'sm' ? 'h-2 w-2' : 'h-2.5 w-2.5',
      )}
    />
  )
}

const contentClass =
  'z-[200] min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-2xl shadow-gray-300/30 ring-1 ring-gray-100 animate-scale-in'

const viewportClass = 'p-1.5'

function ScrollUp() {
  return (
    <SelectPrimitive.ScrollUpButton className="flex h-7 items-center justify-center border-b border-gray-100 text-gray-400 hover:text-gray-600">
      <ChevronUp className="h-3.5 w-3.5" />
    </SelectPrimitive.ScrollUpButton>
  )
}

function ScrollDown() {
  return (
    <SelectPrimitive.ScrollDownButton className="flex h-7 items-center justify-center border-t border-gray-100 text-gray-400 hover:text-gray-600">
      <ChevronDown className="h-3.5 w-3.5" />
    </SelectPrimitive.ScrollDownButton>
  )
}

function OptionItem({ option }: { option: SelectOption }) {
  return (
    <SelectPrimitive.Item
      value={option.value}
      className={cn(
        'relative flex cursor-pointer select-none items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm outline-none transition-colors duration-100',
        'text-gray-700',
        'data-[highlighted]:bg-indigo-50/70 data-[highlighted]:text-gray-900',
        'data-[state=checked]:bg-indigo-50 data-[state=checked]:text-indigo-800',
      )}
    >
      {option.icon && <span className="shrink-0 text-gray-500">{option.icon}</span>}
      {option.color && <ColorDot color={option.color} />}
      <SelectPrimitive.ItemText>
        <span className="data-[state=checked]:font-medium">{option.label}</span>
      </SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator className="ml-auto pl-2">
        <Check className="h-3.5 w-3.5 text-indigo-600" strokeWidth={2.5} />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  )
}

function FilterOptionItem({ option }: { option: SelectOption }) {
  return (
    <SelectPrimitive.Item
      value={option.value}
      className={cn(
        'relative flex cursor-pointer select-none items-center gap-2.5 rounded-xl px-3 py-2 text-xs outline-none transition-colors duration-100',
        'text-gray-700',
        'data-[highlighted]:bg-indigo-50/70 data-[highlighted]:text-gray-900',
        'data-[state=checked]:bg-indigo-50 data-[state=checked]:text-indigo-800 data-[state=checked]:font-medium',
      )}
    >
      {option.color && <ColorDot color={option.color} size="sm" />}
      <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator className="ml-auto pl-2">
        <Check className="h-3 w-3 text-indigo-600" strokeWidth={2.5} />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  )
}

function bucketByGroup(options: SelectOption[]) {
  const groups: { name: string; items: SelectOption[] }[] = []
  for (const o of options) {
    const name = o.group ?? ''
    let bucket = groups.find((g) => g.name === name)
    if (!bucket) {
      bucket = { name, items: [] }
      groups.push(bucket)
    }
    bucket.items.push(o)
  }
  return groups
}

function renderItems(
  options: SelectOption[],
  Item: (props: { option: SelectOption }) => React.ReactElement,
  labelPaddingClass: string,
) {
  if (!options.some((o) => o.group)) {
    return options.map((o) => <Item key={o.value} option={o} />)
  }
  return bucketByGroup(options).map((g, idx) => (
    <SelectPrimitive.Group key={g.name || `__ungrouped_${idx}`}>
      {idx > 0 && <div className="my-1 mx-2 h-px bg-gray-100" />}
      {g.name && (
        <SelectPrimitive.Label
          className={cn(
            'text-[10px] font-semibold uppercase tracking-wider text-gray-400',
            labelPaddingClass,
          )}
        >
          {g.name}
        </SelectPrimitive.Label>
      )}
      {g.items.map((o) => (
        <Item key={o.value} option={o} />
      ))}
    </SelectPrimitive.Group>
  ))
}

const renderGroupedItems = (opts: SelectOption[]) =>
  renderItems(opts, OptionItem, 'px-3 pt-2 pb-1')

const renderFilterGroupedItems = (opts: SelectOption[]) =>
  renderItems(opts, FilterOptionItem, 'px-3 pt-1.5 pb-0.5')

export function AppSelect({
  label,
  placeholder = 'Select…',
  options,
  value,
  onValueChange,
  disabled,
  className,
  error,
  required,
  size = 'md',
}: AppSelectProps) {
  const selected = options.find((o) => o.value === value)
  const hasValue = !!value

  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <label className="block text-sm font-medium leading-none text-gray-700">
          {label}
          {required && <span className="ml-0.5 text-red-500">*</span>}
        </label>
      )}

      <SelectPrimitive.Root value={value || undefined} onValueChange={onValueChange} disabled={disabled}>
        <SelectPrimitive.Trigger
          className={cn(
            'group flex w-full items-center justify-between gap-2 rounded-xl border text-sm transition-all duration-150',
            hasValue ? 'bg-white' : 'bg-gray-50/80',
            error
              ? 'border-red-300 hover:border-red-400 focus:border-red-400 focus:ring-2 focus:ring-red-500/15'
              : 'border-gray-200 hover:border-gray-300 data-[state=open]:border-indigo-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/15',
            'shadow-sm hover:shadow',
            'data-[state=open]:shadow-md data-[state=open]:ring-2 data-[state=open]:ring-indigo-500/15',
            'text-gray-900 focus:outline-none',
            'disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400 disabled:shadow-none',
            size === 'sm' ? 'px-3 py-2 text-xs' : 'px-4 py-2.5',
          )}
        >
          <span className="flex min-w-0 items-center gap-2.5 truncate">
            {selected?.icon && <span className="shrink-0 text-gray-500">{selected.icon}</span>}
            {selected?.color && <ColorDot color={selected.color} />}
            <SelectPrimitive.Value
              placeholder={
                <span className="text-gray-400">{placeholder}</span>
              }
            />
          </span>
          <SelectPrimitive.Icon className="shrink-0">
            <ChevronDown
              className={cn(
                'text-gray-400 transition-transform duration-200 group-data-[state=open]:rotate-180',
                size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4',
              )}
            />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>

        <SelectPrimitive.Portal>
          <SelectPrimitive.Content
            className={contentClass}
            position="popper"
            sideOffset={6}
            align="start"
            avoidCollisions
          >
            <ScrollUp />
            <SelectPrimitive.Viewport className={cn(viewportClass, 'max-h-[280px]')}>
              {renderGroupedItems(options)}
            </SelectPrimitive.Viewport>
            <ScrollDown />
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>

      {error && (
        <p className="flex items-center gap-1.5 text-xs font-medium text-red-600">
          <span className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
          {error}
        </p>
      )}
    </div>
  )
}

interface FilterSelectProps {
  placeholder: string
  options: SelectOption[]
  value: string
  onValueChange: (value: string) => void
  icon?: React.ReactNode
}

export function FilterSelect({ placeholder, options, value, onValueChange, icon }: FilterSelectProps) {
  const selected = options.find((o) => o.value === value)
  const hasValue = !!value

  return (
    <SelectPrimitive.Root value={value || undefined} onValueChange={onValueChange}>
      <SelectPrimitive.Trigger
        className={cn(
          'group flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium transition-all duration-150',
          'focus:outline-none focus:ring-2 focus:ring-indigo-500/20',
          'data-[state=open]:ring-2 data-[state=open]:ring-indigo-500/20',
          hasValue
            ? 'border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 data-[state=open]:border-indigo-300'
            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50 data-[state=open]:border-gray-300',
          'shadow-sm',
        )}
      >
        {icon && (
          <span className={cn('shrink-0', hasValue ? 'text-indigo-500' : 'text-gray-400')}>
            {icon}
          </span>
        )}
        {selected?.color && <ColorDot color={selected.color} size="sm" />}
        <SelectPrimitive.Value placeholder={placeholder} />
        <SelectPrimitive.Icon className="ml-0.5 shrink-0">
          <ChevronDown
            className={cn(
              'h-3 w-3 transition-transform duration-200 group-data-[state=open]:rotate-180',
              hasValue ? 'text-indigo-400' : 'text-gray-400',
            )}
          />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          className={contentClass}
          position="popper"
          sideOffset={6}
          align="start"
          avoidCollisions
        >
          <ScrollUp />
          <SelectPrimitive.Viewport className={cn(viewportClass, 'max-h-[280px]')}>
            <SelectPrimitive.Item
              value="__all__"
              className={cn(
                'relative flex cursor-pointer select-none items-center gap-2.5 rounded-xl px-3 py-2 text-xs outline-none transition-colors duration-100',
                'text-gray-500 italic',
                'data-[highlighted]:bg-gray-50 data-[highlighted]:text-gray-700 data-[highlighted]:not-italic',
              )}
            >
              <SelectPrimitive.ItemText>{placeholder}</SelectPrimitive.ItemText>
              <SelectPrimitive.ItemIndicator className="ml-auto pl-2">
                <Check className="h-3 w-3 text-indigo-500" strokeWidth={2.5} />
              </SelectPrimitive.ItemIndicator>
            </SelectPrimitive.Item>

            <div className="my-1 mx-2 h-px bg-gray-100" />

            {renderFilterGroupedItems(options)}
          </SelectPrimitive.Viewport>
          <ScrollDown />
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  )
}