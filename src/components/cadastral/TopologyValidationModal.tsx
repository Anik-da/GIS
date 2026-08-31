import React from 'react';
import type { ValidationConflict } from '../../types/cadastral';
import { ShieldCheck, AlertOctagon, CheckCircle, X, Layers, Box, AlertTriangle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  conflicts: ValidationConflict[];
  onClose: () => void;
  onResolveConflict: (id: string) => void;
}

export const TopologyValidationModal: React.FC<Props> = ({
  isOpen,
  conflicts,
  onClose,
  onResolveConflict,
}) => {
  if (!isOpen) return null;

  const totalConflicts = conflicts.length;
  const activeConflicts = conflicts.filter((c) => !c.resolved).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-md">
      <div className="animate-in fade-in zoom-in-95 w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">3D Spatial Topology Validation Engine</h2>
              <p className="text-xs text-slate-400">
                SIH26011 Automated Geometry & Volume Overlap Detector
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Status Summary Banner */}
        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-center">
            <span className="text-xs text-slate-400">Rules Evaluated</span>
            <p className="mt-1 text-lg font-bold text-cyan-400">6 Rules</p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-center">
            <span className="text-xs text-slate-400">Active Conflicts</span>
            <p className={`mt-1 text-lg font-bold ${activeConflicts > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
              {activeConflicts} Detected
            </p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-center">
            <span className="text-xs text-slate-400">Compliance Score</span>
            <p className="mt-1 text-lg font-bold text-amber-400">84.5%</p>
          </div>
        </div>

        {/* Conflict List */}
        <div className="mt-4 max-h-[320px] space-y-3 overflow-y-auto pr-1">
          {conflicts.map((conflict) => (
            <div
              key={conflict.id}
              className={`rounded-xl border p-4 transition-all ${
                conflict.resolved
                  ? 'border-slate-800 bg-slate-950/40 opacity-60'
                  : conflict.severity === 'HIGH'
                  ? 'border-red-500/30 bg-red-950/20'
                  : 'border-amber-500/30 bg-amber-950/20'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {conflict.severity === 'HIGH' ? (
                    <AlertOctagon className="h-5 w-5 text-red-400" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-amber-400" />
                  )}
                  <span className="font-bold text-white">{conflict.type.replace('_', ' ')}</span>
                  <span
                    className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                      conflict.severity === 'HIGH' ? 'bg-red-500/20 text-red-300' : 'bg-amber-500/20 text-amber-300'
                    }`}
                  >
                    {conflict.severity}
                  </span>
                </div>

                <button
                  onClick={() => onResolveConflict(conflict.id)}
                  className={`flex items-center gap-1 rounded-lg px-3 py-1 text-xs font-semibold transition-all ${
                    conflict.resolved
                      ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30'
                  }`}
                >
                  <CheckCircle className="h-3.5 w-3.5" />
                  {conflict.resolved ? 'Resolved' : 'Mark Resolved'}
                </button>
              </div>

              <p className="mt-2 text-xs text-slate-300">{conflict.description}</p>

              <div className="mt-3 flex items-center gap-4 text-[11px] text-slate-400 font-mono">
                <span className="flex items-center gap-1">
                  <Box className="h-3.5 w-3.5 text-cyan-400" /> VPID: {conflict.vpid}
                </span>
                <span className="flex items-center gap-1">
                  <Layers className="h-3.5 w-3.5 text-purple-400" /> Z-Range: {conflict.locationZ.min}m → {conflict.locationZ.max}m
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end border-t border-slate-800 pt-4">
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-800 px-5 py-2 text-xs font-semibold text-white transition-colors hover:bg-slate-700"
          >
            Close Engine View
          </button>
        </div>
      </div>
    </div>
  );
};
