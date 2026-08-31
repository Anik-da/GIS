import { X, Layers3, Building2, Square, Box, AlertTriangle, ChevronDown, Crosshair } from 'lucide-react';
import { useState } from 'react';
import type { SelectionInfo, SelectionKind } from '../types/gis';

interface SelectionManagerProps {
  selection: SelectionInfo | null;
  onClear: () => void;
}

const KIND_CONFIG: Record<SelectionKind, { icon: typeof Square; label: string; color: string }> = {
  parcel: { icon: Square, label: 'Parcel', color: '#22d3ee' },
  building: { icon: Building2, label: 'Building', color: '#f59e0b' },
  floor: { icon: Layers3, label: 'Floor', color: '#34d399' },
  verticalProperty: { icon: Box, label: 'Vertical Property', color: '#38bdf8' },
  conflict: { icon: AlertTriangle, label: 'Validation Conflict', color: '#ef4444' },
};

export default function SelectionManager({ selection, onClear }: SelectionManagerProps) {
  const [expanded, setExpanded] = useState(true);

  if (!selection) {
    return (
      <div className="pointer-events-auto w-64 rounded-xl border border-slate-700/60 bg-slate-900/80 backdrop-blur-md shadow-2xl">
        <div className="flex items-center gap-2 border-b border-slate-700/60 px-4 py-3">
          <Crosshair className="h-4 w-4 text-cyan-400" />
          <h3 className="text-sm font-semibold tracking-wide text-slate-100">Selection</h3>
        </div>
        <div className="px-4 py-6 text-center">
          <p className="text-xs text-slate-500">Click any object on the globe to view its details.</p>
          <p className="mt-2 text-[10px] text-slate-600">Supports parcels, buildings, floors, vertical properties &amp; conflicts.</p>
        </div>
      </div>
    );
  }

  const config = KIND_CONFIG[selection.kind];
  const Icon = config.icon;

  return (
    <div className="pointer-events-auto w-64 rounded-xl border border-cyan-500/30 bg-slate-900/80 backdrop-blur-md shadow-2xl ring-1 ring-cyan-400/20">
      <div className="flex items-center justify-between border-b border-slate-700/60 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md" style={{ backgroundColor: `${config.color}20` }}>
            <Icon className="h-4 w-4" style={{ color: config.color }} />
          </span>
          <h3 className="text-sm font-semibold tracking-wide text-slate-100">Selection</h3>
        </div>
        <button
          onClick={onClear}
          className="flex h-6 w-6 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-700/50 hover:text-slate-200"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <button
        onClick={() => setExpanded((e) => !e)}
        className="flex w-full items-center justify-between px-4 py-2.5 text-left transition-colors hover:bg-slate-700/30"
      >
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-wider text-slate-500">{config.label}</p>
          <p className="truncate text-sm font-medium text-cyan-300">{selection.label}</p>
        </div>
        <ChevronDown className={`h-4 w-4 shrink-0 text-slate-500 transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>

      {expanded && selection.data && Object.keys(selection.data).length > 0 && (
        <div className="border-t border-slate-700/60 p-3">
          <dl className="space-y-1.5">
            {Object.entries(selection.data).map(([key, value]) => (
              <div key={key} className="flex justify-between gap-3 text-xs">
                <dt className="text-slate-500 capitalize">{key.replace(/_/g, ' ')}</dt>
                <dd className="font-mono text-slate-200">{String(value)}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {expanded && (!selection.data || Object.keys(selection.data).length === 0) && (
        <div className="border-t border-slate-700/60 p-3">
          <p className="text-xs text-slate-500">No additional attributes available for this demo object.</p>
        </div>
      )}
    </div>
  );
}
