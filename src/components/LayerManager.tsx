import { Layers, Eye, EyeOff } from 'lucide-react';
import type { LayerConfig } from '../types/gis';

interface LayerManagerProps {
  layers: LayerConfig[];
  onToggle: (id: string) => void;
}

export default function LayerManager({ layers, onToggle }: LayerManagerProps) {
  return (
    <div className="pointer-events-auto w-64 rounded-xl border border-slate-700/60 bg-slate-900/80 backdrop-blur-md shadow-2xl">
      <div className="flex items-center gap-2 border-b border-slate-700/60 px-4 py-3">
        <Layers className="h-4 w-4 text-cyan-400" />
        <h3 className="text-sm font-semibold tracking-wide text-slate-100">Layer Manager</h3>
      </div>
      <div className="max-h-80 overflow-y-auto p-2">
        {layers.map((layer) => (
          <div
            key={layer.id}
            className="group flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-slate-700/40"
          >
            <span
              className="h-3 w-3 shrink-0 rounded-sm ring-1 ring-white/20"
              style={{ backgroundColor: layer.color }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate">{layer.label}</p>
              <p className="text-[11px] text-slate-400 truncate">{layer.description}</p>
            </div>
            <button
              onClick={() => onToggle(layer.id)}
              title={layer.visible ? 'Hide layer' : 'Show layer'}
              className={`flex h-7 w-7 items-center justify-center rounded-md transition-all ${
                layer.visible
                  ? 'text-cyan-400 hover:bg-cyan-500/15'
                  : 'text-slate-500 hover:bg-slate-700/50'
              }`}
            >
              {layer.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </button>
          </div>
        ))}
      </div>
      <div className="border-t border-slate-700/60 px-3 py-2">
        <p className="text-[10px] text-slate-500">
          {layers.filter((l) => l.visible).length} of {layers.length} layers active
        </p>
      </div>
    </div>
  );
}
