import type { PropertyStatus } from '../types/cadastral';

export const STATUS_COLORS: Record<PropertyStatus, { cesium: string; hex: string; label: string; bg: string; text: string; ring: string }> = {
  valid: {
    cesium: 'rgba(34, 197, 94, 0.55)',
    hex: '#22c55e',
    label: 'Valid',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    ring: 'ring-emerald-500/40',
  },
  warning: {
    cesium: 'rgba(249, 115, 22, 0.55)',
    hex: '#f97316',
    label: 'Warning',
    bg: 'bg-orange-500/10',
    text: 'text-orange-400',
    ring: 'ring-orange-500/40',
  },
  conflict: {
    cesium: 'rgba(239, 68, 68, 0.55)',
    hex: '#ef4444',
    label: 'Conflict',
    bg: 'bg-red-500/10',
    text: 'text-red-400',
    ring: 'ring-red-500/40',
  },
};

export const SELECTED_COLOR = { cesium: 'rgba(56, 189, 248, 0.75)', hex: '#38bdf8' }; // cyan-400
export const UNDERGROUND_COLOR = { cesium: 'rgba(168, 85, 247, 0.55)', hex: '#a855f7' }; // purple
export const PARCEL_COLOR = { cesium: 'rgba(148, 163, 184, 0.4)', hex: '#94a3b8' };
export const GROUND_COLOR = { cesium: 'rgba(120, 113, 108, 0.25)', hex: '#78716c' };

export function statusForProperty(status: PropertyStatus) {
  return STATUS_COLORS[status];
}
