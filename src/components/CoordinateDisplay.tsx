import { MapPin, Mountain } from 'lucide-react';
import type { Coordinates } from '../types/gis';

interface CoordinateDisplayProps {
  coordinates: Coordinates | null;
}

export default function CoordinateDisplay({ coordinates }: CoordinateDisplayProps) {
  const lat = coordinates?.latitude ?? 0;
  const lng = coordinates?.longitude ?? 0;
  const elev = coordinates?.elevation ?? 0;

  return (
    <div className="pointer-events-auto flex items-center gap-4 rounded-lg border border-slate-700/60 bg-slate-900/80 px-4 py-2.5 backdrop-blur-md shadow-2xl">
      <div className="flex items-center gap-2">
        <MapPin className="h-4 w-4 text-cyan-400" />
        <div className="flex items-baseline gap-1.5">
          <span className="text-[10px] uppercase tracking-wider text-slate-500">Lat</span>
          <span className="font-mono text-sm font-medium text-slate-100 tabular-nums">
            {formatCoord(lat, 'lat')}
          </span>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-[10px] uppercase tracking-wider text-slate-500">Lng</span>
          <span className="font-mono text-sm font-medium text-slate-100 tabular-nums">
            {formatCoord(lng, 'lng')}
          </span>
        </div>
      </div>
      <div className="h-5 w-px bg-slate-700" />
      <div className="flex items-center gap-2">
        <Mountain className="h-4 w-4 text-cyan-400" />
        <div className="flex items-baseline gap-1.5">
          <span className="text-[10px] uppercase tracking-wider text-slate-500">Elev</span>
          <span className="font-mono text-sm font-medium text-slate-100 tabular-nums">
            {elev >= 0 ? elev.toFixed(1) : '—'} m
          </span>
        </div>
      </div>
    </div>
  );
}

function formatCoord(value: number, type: 'lat' | 'lng'): string {
  const dir = type === 'lat' ? (value >= 0 ? 'N' : 'S') : (value >= 0 ? 'E' : 'W');
  return `${Math.abs(value).toFixed(5)}° ${dir}`;
}
