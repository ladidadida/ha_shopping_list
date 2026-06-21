// Minimal RRULE <-> preset conversion for the card detail panel's recurrence
// picker. Covers the common cases (daily/weekly/monthly/yearly + weekly BYDAY);
// anything else falls back to "custom" with the raw RRULE string preserved.

export const WEEKDAYS = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'] as const

export const WEEKDAY_LABELS: Record<string, string> = {
  MO: 'Mo',
  TU: 'Di',
  WE: 'Mi',
  TH: 'Do',
  FR: 'Fr',
  SA: 'Sa',
  SU: 'So',
}

export type RrulePreset =
  | { kind: 'none' }
  | { kind: 'daily' }
  | { kind: 'weekly'; days: string[] }
  | { kind: 'monthly' }
  | { kind: 'yearly' }
  | { kind: 'custom'; raw: string }

export function parseRrulePreset(rrule: string | null): RrulePreset {
  if (!rrule) return { kind: 'none' }

  const parts: Record<string, string> = {}
  for (const part of rrule.split(';')) {
    const [key, value] = part.split('=')
    if (key && value) parts[key] = value
  }
  const keys = Object.keys(parts)

  if (parts.FREQ === 'DAILY' && keys.length === 1) return { kind: 'daily' }
  if (parts.FREQ === 'WEEKLY' && (keys.length === 1 || (keys.length === 2 && parts.BYDAY))) {
    return { kind: 'weekly', days: parts.BYDAY ? parts.BYDAY.split(',') : [] }
  }
  if (parts.FREQ === 'MONTHLY' && keys.length === 1) return { kind: 'monthly' }
  if (parts.FREQ === 'YEARLY' && keys.length === 1) return { kind: 'yearly' }
  return { kind: 'custom', raw: rrule }
}

export function buildRrule(preset: RrulePreset): string | null {
  switch (preset.kind) {
    case 'none':
      return null
    case 'daily':
      return 'FREQ=DAILY'
    case 'weekly':
      return preset.days.length > 0 ? `FREQ=WEEKLY;BYDAY=${preset.days.join(',')}` : 'FREQ=WEEKLY'
    case 'monthly':
      return 'FREQ=MONTHLY'
    case 'yearly':
      return 'FREQ=YEARLY'
    case 'custom':
      return preset.raw.trim() || null
  }
}
