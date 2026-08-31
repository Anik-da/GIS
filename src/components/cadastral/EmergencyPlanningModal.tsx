import React from 'react';
import type { Building } from '../../types/cadastral';
import { AlertTriangle, ShieldAlert, Navigation, Layers, Flame, MapPin, X } from 'lucide-react';

interface Props {
  building: Building;
  isOpen: boolean;
  onClose: () => void;
}

export const EmergencyPlanningModal: React.FC<Props> = ({
  building,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md">
      <div className="animate-in fade-in zoom-in-95 w-full max-w-2xl overflow-hidden rounded-3xl border border-red-500/40 bg-slate-900 shadow-2xl">
        {/* Red Emergency Header */}
        <div className="flex items-center justify-between border-b border-red-500/20 bg-red-950/40 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-500/20 text-red-400 border border-red-500/40">
              <Flame className="h-6 w-6 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] font-bold tracking-widest text-red-400 uppercase">
                FIRST RESPONDER 3D TACTICAL VIEW
              </span>
              <h2 className="text-lg font-bold text-white">Emergency 3D Spatial Planning</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Target Building</span>
              <span className="font-bold text-white">{building.name}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs border-t border-slate-800/80 pt-2">
              <span className="text-slate-400">Coordinates</span>
              <span className="font-mono text-cyan-400">
                {building.center.lat.toFixed(4)}°N, {building.center.lon.toFixed(4)}°E
              </span>
            </div>
          </div>

          {/* Vertical Tactical Inspection Grid */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              3D Floor Tactical Evacuation Status
            </span>
            <div className="max-h-[220px] overflow-y-auto space-y-2 pr-1">
              {building.floors.map((floor) => (
                <div
                  key={floor.id}
                  className={`flex items-center justify-between rounded-xl border p-3 text-xs ${
                    floor.isUnderground
                      ? 'border-purple-500/30 bg-purple-950/20'
                      : floor.floorNumber === 4
                      ? 'border-red-500/40 bg-red-950/30'
                      : 'border-slate-800 bg-slate-950/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-cyan-400 w-8">{floor.shortLabel}</span>
                    <span className="font-medium text-slate-200">{floor.label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-slate-400">
                      Z: {floor.zMin}m to {floor.zMax}m
                    </span>
                    <span
                      className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                        floor.floorNumber === 4
                          ? 'bg-red-500/20 text-red-300'
                          : 'bg-emerald-500/20 text-emerald-300'
                      }`}
                    >
                      {floor.floorNumber === 4 ? 'PRIORITY HAZARD' : 'CLEAR'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Access Points */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-3">
              <span className="text-slate-400 flex items-center gap-1">
                <Navigation className="h-3.5 w-3.5 text-cyan-400" /> Primary Access
              </span>
              <p className="mt-1 font-semibold text-slate-200">Ground North Entry (Gate 1)</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-3">
              <span className="text-slate-400 flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-purple-400" /> Sub-Surface Exit
              </span>
              <p className="mt-1 font-semibold text-slate-200">B2 Emergency Duct Stairwell</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-slate-800 p-4">
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-800 px-5 py-2 text-xs font-semibold text-white hover:bg-slate-700"
          >
            Exit Tactical View
          </button>
        </div>
      </div>
    </div>
  );
};
