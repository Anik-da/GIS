import { Globe2 } from 'lucide-react';

export default function AppHeader() {
  return (
    <header className="pointer-events-auto flex items-center justify-between border-b border-slate-700/60 bg-slate-900/90 px-5 py-2.5 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400/20 to-blue-600/20 ring-1 ring-cyan-400/30">
          <Globe2 className="h-5 w-5 text-cyan-400" />
        </div>
        <div className="leading-tight">
          <h1 className="text-sm font-bold tracking-wide text-slate-100">
            VOLU-CAD 3D
          </h1>
          <p className="text-[10px] text-slate-400">3D ULPIN Generation &amp; Vertical Property Mapping System</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden items-center gap-2 md:flex">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] font-medium text-slate-400">GIS Globe Module</span>
        </div>
        <span className="rounded-md border border-slate-700/60 bg-slate-800/60 px-2.5 py-1 text-[10px] font-medium text-slate-400">
          SIH 2026 · SIH26011
        </span>
      </div>
    </header>
  );
}
