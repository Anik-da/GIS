import React from 'react';
import {
  Globe2,
  ShieldCheck,
  Flame,
  History,
  Layers,
  Eye,
  UserCheck,
  Layers3,
} from 'lucide-react';
import type { UserRole, ExplodeState } from '../types/cadastral';

interface Props {
  userRole: UserRole;
  explodeState: ExplodeState;
  showUnderground: boolean;
  activeConflictCount: number;
  onRoleChange: (role: UserRole) => void;
  onToggleExplode: () => void;
  onToggleUnderground: () => void;
  onOpenValidation: () => void;
  onOpenEmergency: () => void;
  onOpenAudit: () => void;
}

export default function AppHeader({
  userRole,
  explodeState,
  showUnderground,
  activeConflictCount,
  onRoleChange,
  onToggleExplode,
  onToggleUnderground,
  onOpenValidation,
  onOpenEmergency,
  onOpenAudit,
}: Props) {
  return (
    <header className="pointer-events-auto flex flex-wrap items-center justify-between border-b border-slate-800 bg-slate-900/95 px-5 py-2.5 shadow-lg backdrop-blur-xl">
      {/* Brand Title */}
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-md shadow-cyan-500/20 ring-1 ring-white/20">
          <Globe2 className="h-5 w-5 text-white" />
        </div>
        <div className="leading-tight">
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-black tracking-wide text-white">VOLU-CAD 3D</h1>
            <span className="rounded-md border border-cyan-500/30 bg-cyan-500/10 px-2 py-0.5 text-[10px] font-bold text-cyan-300">
              SIH26011
            </span>
          </div>
          <p className="text-[10px] text-slate-400">3D ULPIN &amp; Vertical Property Mapping Platform</p>
        </div>
      </div>

      {/* Quick Action Navigation Bar */}
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleExplode}
          className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all active:scale-95 ${
            explodeState === 'exploded'
              ? 'border-cyan-400 bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
              : 'border-slate-700 bg-slate-800/80 text-slate-200 hover:bg-slate-700'
          }`}
        >
          <Layers3 className="h-4 w-4" />
          {explodeState === 'exploded' ? 'Collapse 3D Floors' : 'Explode 3D Floors'}
        </button>

        <button
          onClick={onToggleUnderground}
          className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all active:scale-95 ${
            showUnderground
              ? 'border-purple-400 bg-purple-500/20 text-purple-300'
              : 'border-slate-700 bg-slate-800/80 text-slate-400 hover:bg-slate-700'
          }`}
        >
          <Layers className="h-4 w-4" />
          Underground Mode
        </button>

        <button
          onClick={onOpenValidation}
          className="relative flex items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-300 transition-all hover:bg-red-500/20 active:scale-95"
        >
          <ShieldCheck className="h-4 w-4 text-red-400" />
          3D Validation
          {activeConflictCount > 0 && (
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              {activeConflictCount}
            </span>
          )}
        </button>

        <button
          onClick={onOpenEmergency}
          className="flex items-center gap-1.5 rounded-xl border border-orange-500/30 bg-orange-500/10 px-3 py-1.5 text-xs font-semibold text-orange-300 transition-all hover:bg-orange-500/20 active:scale-95"
        >
          <Flame className="h-4 w-4 text-orange-400" />
          Emergency View
        </button>

        <button
          onClick={onOpenAudit}
          className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-semibold text-slate-300 transition-all hover:bg-slate-700"
        >
          <History className="h-4 w-4 text-purple-400" />
          Audit Trail
        </button>
      </div>

      {/* Role Switcher */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-2.5 py-1 text-xs">
          <UserCheck className="h-3.5 w-3.5 text-cyan-400" />
          <span className="text-[10px] text-slate-400">ROLE:</span>
          <select
            value={userRole}
            onChange={(e) => onRoleChange(e.target.value as UserRole)}
            className="bg-transparent font-bold text-cyan-300 focus:outline-none cursor-pointer"
          >
            <option value="ADMIN" className="bg-slate-900 text-white">ADMIN</option>
            <option value="SURVEY_OFFICER" className="bg-slate-900 text-white">SURVEY OFFICER</option>
            <option value="VERIFICATION_OFFICER" className="bg-slate-900 text-white">VERIFICATION OFFICER</option>
            <option value="VIEWER" className="bg-slate-900 text-white">VIEWER (PUBLIC)</option>
          </select>
        </div>
      </div>
    </header>
  );
}
