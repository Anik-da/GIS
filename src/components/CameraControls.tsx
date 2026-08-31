import { Navigation2, RotateCcw, Crosshair } from 'lucide-react';

interface CameraControlsProps {
  onGoToDemo: () => void;
  onResetView: () => void;
}

export default function CameraControls({ onGoToDemo, onResetView }: CameraControlsProps) {
  return (
    <div className="pointer-events-auto flex flex-col gap-2">
      <button
        onClick={onGoToDemo}
        className="group flex items-center gap-2.5 rounded-lg border border-cyan-500/40 bg-cyan-500/15 px-4 py-2.5 text-sm font-semibold text-cyan-200 backdrop-blur-md shadow-2xl transition-all duration-200 hover:bg-cyan-500/25 hover:ring-1 hover:ring-cyan-400/50"
      >
        <Navigation2 className="h-4 w-4 transition-transform group-hover:scale-110" />
        Go To Demo Area
      </button>
      <button
        onClick={onResetView}
        className="group flex items-center justify-center gap-2 rounded-lg border border-slate-700/60 bg-slate-900/80 px-4 py-2 text-xs font-medium text-slate-300 backdrop-blur-md shadow-xl transition-all duration-200 hover:text-cyan-300"
        title="Reset camera to default view"
      >
        <RotateCcw className="h-3.5 w-3.5" />
        Reset View
      </button>
      <div className="flex items-center gap-1.5 rounded-lg border border-slate-700/40 bg-slate-900/60 px-3 py-1.5 text-[10px] text-slate-500 backdrop-blur-sm">
        <Crosshair className="h-3 w-3" />
        <span>Karnataka / Bengaluru</span>
      </div>
    </div>
  );
}
