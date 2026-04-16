import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | null | undefined): string {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function formatDateTime(date: string | null | undefined): string {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function isOverdue(date: string | null | undefined): boolean {
  if (!date) return false
  return new Date(date) < new Date()
}

export function daysFromNow(date: string | null | undefined): number | null {
  if (!date) return null
  const diff = new Date(date).getTime() - new Date().getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

const statusColorMap: Record<string, string> = {
  'To Apply': 'gray',
  'Applied': 'blue',
  'HR Screening': 'yellow',
  'Interview': 'purple',
  'Final Interview': 'indigo',
  'Offer': 'green',
  'Rejected': 'red',
  'No Response': 'orange',
  'On Hold': 'gray',
  'Withdrawn': 'orange',
}

const priorityColorMap: Record<string, string> = {
  'High': 'red',
  'Medium': 'yellow',
  'Low': 'gray',
}

export function getStatusColor(name: string): string {
  return statusColorMap[name] || 'gray'
}

export function getPriorityColor(name: string): string {
  return priorityColorMap[name] || 'gray'
}
