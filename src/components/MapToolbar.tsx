import { Home, ZoomIn, ZoomOut, Maximize2, Compass, Ruler, Box, Map } from 'lucide-react';

interface MapToolbarProps {
  onHome: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetNorth: () => void;
  onToggleFullscreen: () => void;
  is3D: boolean;
  onToggle2D3D: () => void;
  isMeasuring: boolean;
  onToggleMeasure: () => void;
}

interface ToolButton {
  icon: typeof Home;
  label: string;
  onClick: () => void;
  active?: boolean;
}

export default function MapToolbar({
  onHome,
  onZoomIn,
  onZoomOut,
  onResetNorth,
  onToggleFullscreen,
  is3D,
  onToggle2D3D,
  isMeasuring,
  onToggleMeasure,
}: MapToolbarProps) {
  const buttons: ToolButton[] = [
    { icon: Home, label: 'Home', onClick: onHome },
    { icon: ZoomIn, label: 'Zoom In', onClick: onZoomIn },
    { icon: ZoomOut, label: 'Zoom Out', onClick: onZoomOut },
    { icon: Compass, label: 'Reset North', onClick: onResetNorth },
    { icon: Ruler, label: 'Measure', onClick: onToggleMeasure, active: isMeasuring },
    { icon: Maximize2, label: 'Fullscreen', onClick: onToggleFullscreen },
  ];

  return (
    <div className="pointer-events-auto flex flex-col gap-1.5 rounded-xl border border-slate-700/60 bg-slate-900/80 p-2 backdrop-blur-md shadow-2xl">
      {buttons.map((btn) => (
        <button
          key={btn.label}
          onClick={btn.onClick}
          title={btn.label}
          className={`group relative flex h-10 w-10 items-center justify-center rounded-lg transition-all duration-200 ${
            btn.active
              ? 'bg-cyan-500/20 text-cyan-300 ring-1 ring-cyan-400/50'
              : 'text-slate-300 hover:bg-slate-700/50 hover:text-cyan-300'
          }`}
        >
          <btn.icon className="h-5 w-5" />
          <span className="pointer-events-none absolute left-12 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-md bg-slate-800 px-2 py-1 text-xs font-medium text-slate-100 opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100">
            {btn.label}
          </span>
        </button>
      ))}

      {/* 2D / 3D toggle — separate pill */}
      <div className="mt-1 border-t border-slate-700/60 pt-1.5">
        <button
          onClick={onToggle2D3D}
          title={is3D ? 'Switch to 2D' : 'Switch to 3D'}
          className="group relative flex h-10 w-10 items-center justify-center rounded-lg text-slate-300 transition-all duration-200 hover:bg-slate-700/50 hover:text-cyan-300"
        >
          {is3D ? <Box className="h-5 w-5" /> : <Map className="h-5 w-5" />}
          <span className="pointer-events-none absolute left-12 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-md bg-slate-800 px-2 py-1 text-xs font-medium text-slate-100 opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100">
            {is3D ? '3D Mode' : '2D Mode'}
          </span>
        </button>
      </div>
    </div>
  );
}
