import { Info } from 'lucide-react';

interface LegendItem {
  label: string;
  color: string;
  shape: 'square' | 'diamond' | 'striped' | 'circle';
}

const LEGEND_ITEMS: LegendItem[] = [
  { label: 'Parcel', color: '#22d3ee', shape: 'square' },
  { label: 'Building', color: '#f59e0b', shape: 'square' },
  { label: 'Selected', color: '#38bdf8', shape: 'diamond' },
  { label: 'Validation Conflict', color: '#ef4444', shape: 'striped' },
  { label: 'Underground', color: '#a78bfa', shape: 'circle' },
];

export default function MapLegend() {
  return (
    <div className="pointer-events-auto w-56 rounded-xl border border-slate-700/60 bg-slate-900/80 backdrop-blur-md shadow-2xl">
      <div className="flex items-center gap-2 border-b border-slate-700/60 px-4 py-3">
        <Info className="h-4 w-4 text-cyan-400" />
        <h3 className="text-sm font-semibold tracking-wide text-slate-100">Legend</h3>
      </div>
      <div className="space-y-2 p-3">
        {LEGEND_ITEMS.map((item) => (
          <div key={item.label} className="flex items-center gap-3">
            <LegendSwatch item={item} />
            <span className="text-sm text-slate-300">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function LegendSwatch({ item }: { item: LegendItem }) {
  const base = 'h-5 w-5 shrink-0';
  if (item.shape === 'diamond') {
    return (
      <span
        className={`${base} rotate-45 rounded-sm ring-2 ring-white/30`}
        style={{ backgroundColor: item.color }}
      />
    );
  }
  if (item.shape === 'circle') {
    return (
      <span
        className={`${base} rounded-full ring-1 ring-white/20`}
        style={{ backgroundColor: item.color }}
      />
    );
  }
  if (item.shape === 'striped') {
    return (
      <span
        className={`${base} rounded-sm ring-1 ring-white/20`}
        style={{
          background: `repeating-linear-gradient(45deg, ${item.color}, ${item.color} 3px, transparent 3px, transparent 6px)`,
          backgroundColor: 'rgba(239,68,68,0.2)',
        }}
      />
    );
  }
  return (
    <span
      className={`${base} rounded-sm ring-1 ring-white/20`}
      style={{ backgroundColor: item.color }}
    />
  );
}
