import React from 'react';
import type { Floor } from '../../types/cadastral';

interface Props {
  floors: Floor[];
  selectedFloorId: string | null;
  showUnderground: boolean;
  onSelect: (floorId: string) => void;
}

export const VerticalFloorSlider: React.FC<Props> = ({
  floors,
  selectedFloorId,
  showUnderground,
  onSelect,
}) => {
  const visibleFloors = [...floors]
    .reverse()
    .filter((f) => showUnderground || !f.isUnderground);

  return (
    <div className="pointer-events-auto absolute left-4 top-24 z-20 flex flex-col items-center gap-1.5 rounded-2xl border border-slate-800 bg-slate-900/85 p-2 shadow-xl backdrop-blur-md">
      <div className="px-2 py-1 text-center text-[10px] font-bold tracking-wider text-slate-400">
        FLOORS
      </div>
      <div className="flex max-h-[380px] flex-col gap-1 overflow-y-auto pr-0.5">
        {visibleFloors.map((floor) => {
          const isSelected = selectedFloorId === floor.id;
          return (
            <button
              key={floor.id}
              onClick={() => onSelect(floor.id)}
              className={`group relative flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                isSelected
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                  : floor.isUnderground
                  ? 'bg-purple-950/40 text-purple-300 border border-purple-500/20 hover:bg-purple-900/50'
                  : 'bg-slate-800/60 text-slate-300 hover:bg-slate-700/80 hover:text-white'
              }`}
            >
              <span className="w-6 text-center font-mono text-[11px]">
                {floor.shortLabel}
              </span>
              <span className="hidden text-[10px] opacity-80 group-hover:inline">
                {floor.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
