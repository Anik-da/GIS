import React from 'react';
import type { AuditLogEntry, UserRole } from '../../types/cadastral';
import { History, Shield, UserCheck, X, Clock, Tag } from 'lucide-react';

interface Props {
  isOpen: boolean;
  logs: AuditLogEntry[];
  currentRole: UserRole;
  onClose: () => void;
}

export const AuditLogDrawer: React.FC<Props> = ({
  isOpen,
  logs,
  currentRole,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex w-96 flex-col border-l border-slate-800 bg-slate-900/95 p-5 shadow-2xl backdrop-blur-xl animate-in slide-in-from-right">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
            <History className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">System Audit Trail</h2>
            <p className="text-[11px] text-slate-400">Immutable 3D Cadastral Action Log</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Role Banner */}
      <div className="mt-4 flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-xs">
        <span className="text-slate-400 flex items-center gap-1.5">
          <UserCheck className="h-4 w-4 text-cyan-400" /> Active Session Role
        </span>
        <span className="font-bold text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/20">
          {currentRole}
        </span>
      </div>

      {/* Logs List */}
      <div className="mt-4 flex-1 space-y-3 overflow-y-auto pr-1">
        {logs.map((log) => (
          <div
            key={log.id}
            className="rounded-xl border border-slate-800/80 bg-slate-950/40 p-3 text-xs transition-all hover:border-slate-700"
          >
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-slate-500" /> {log.timestamp}
              </span>
              <span className="rounded bg-slate-800 px-1.5 py-0.5 text-slate-300">
                {log.userRole}
              </span>
            </div>

            <div className="mt-2 flex items-center gap-1.5 font-semibold text-slate-200">
              <Tag className="h-3.5 w-3.5 text-purple-400" />
              <span>{log.action.replace('_', ' ')}</span>
            </div>

            <p className="mt-1 text-[11px] text-slate-400 leading-relaxed">{log.details}</p>

            <div className="mt-2 text-[10px] text-slate-500 font-mono">
              Target ID: <span className="text-cyan-400">{log.targetId}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-4 border-t border-slate-800 pt-3">
        <button
          onClick={onClose}
          className="w-full rounded-xl bg-slate-800 py-2.5 text-xs font-semibold text-white hover:bg-slate-700"
        >
          Close Log View
        </button>
      </div>
    </div>
  );
};
