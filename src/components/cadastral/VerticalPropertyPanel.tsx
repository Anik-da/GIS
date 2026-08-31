import React from 'react';
import type { VerticalProperty } from '../../types/cadastral';
import { statusForProperty } from '../../data/colors';
import {
  Layers,
  Box,
  Ruler,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileCheck,
  ShieldCheck,
  Building2,
  X,
  ExternalLink,
} from 'lucide-react';

interface Props {
  property: VerticalProperty | null;
  onClose: () => void;
  onRunValidation: () => void;
  onOpenPassport: () => void;
}

export const VerticalPropertyPanel: React.FC<Props> = ({
  property,
  onClose,
  onRunValidation,
  onOpenPassport,
}) => {
  if (!property) return null;

  const statusInfo = statusForProperty(property.status);

  return (
    <div className="animate-in slide-in-from-right pointer-events-auto absolute right-4 top-20 z-20 w-96 rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-2xl backdrop-blur-xl transition-all duration-300">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-cyan-500/10 px-2 py-0.5 text-xs font-semibold text-cyan-400">
              {property.isUnderground ? 'SUB-SURFACE' : 'VERTICAL UNIT'}
            </span>
            <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ${statusInfo.bg} ${statusInfo.text}`}>
              {property.status === 'valid' && <CheckCircle2 className="h-3 w-3" />}
              {property.status === 'warning' && <AlertTriangle className="h-3 w-3" />}
              {property.status === 'conflict' && <XCircle className="h-3 w-3" />}
              {statusInfo.label}
            </span>
          </div>
          <h2 className="mt-1 text-lg font-bold tracking-tight text-white">
            {property.floorLabel}
          </h2>
          <p className="font-mono text-xs text-slate-400">VPID: {property.vpid}</p>
        </div>

        <button
          onClick={onClose}
          className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
          title="Close panel"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Main Grid Specs */}
      <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
        <div className="rounded-xl border border-slate-800/80 bg-slate-950/50 p-3">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Building2 className="h-3.5 w-3.5 text-cyan-400" />
            <span>ULPIN Code</span>
          </div>
          <p className="mt-1 font-mono font-medium text-slate-200">{property.ulpin}</p>
        </div>

        <div className="rounded-xl border border-slate-800/80 bg-slate-950/50 p-3">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Layers className="h-3.5 w-3.5 text-purple-400" />
            <span>Property Type</span>
          </div>
          <p className="mt-1 font-medium text-slate-200">{property.propertyType}</p>
        </div>

        <div className="rounded-xl border border-slate-800/80 bg-slate-950/50 p-3">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Ruler className="h-3.5 w-3.5 text-emerald-400" />
            <span>Z-Min / Z-Max</span>
          </div>
          <p className="mt-1 font-mono font-medium text-slate-200">
            {property.zMin}m → {property.zMax}m ({property.height}m)
          </p>
        </div>

        <div className="rounded-xl border border-slate-800/80 bg-slate-950/50 p-3">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Box className="h-3.5 w-3.5 text-amber-400" />
            <span>3D Volume</span>
          </div>
          <p className="mt-1 font-mono font-medium text-slate-200">
            {property.volume.toLocaleString()} m³
          </p>
        </div>
      </div>

      {/* Owner & Legal Verification */}
      <div className="mt-3 rounded-xl border border-slate-800/80 bg-slate-950/60 p-3 text-xs">
        <div className="flex items-center justify-between text-slate-400">
          <span>Registered Owner</span>
          <span className="font-semibold text-slate-200">{property.ownerName || 'State Land Cadastre'}</span>
        </div>
        <div className="mt-2 flex items-center justify-between border-t border-slate-800/60 pt-2 text-slate-400">
          <span>Document Matching</span>
          <span className="inline-flex items-center gap-1 font-medium text-emerald-400">
            <FileCheck className="h-3.5 w-3.5" /> VERIFIED
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-4 space-y-2">
        <button
          onClick={onRunValidation}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 py-2.5 text-xs font-semibold text-red-300 transition-all hover:bg-red-500/20 active:scale-[0.98]"
        >
          <ShieldCheck className="h-4 w-4 text-red-400" />
          Run 3D Topology Validation
        </button>

        <button
          onClick={onOpenPassport}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 py-2.5 text-xs font-semibold text-white shadow-lg shadow-cyan-500/20 transition-all hover:brightness-110 active:scale-[0.98]"
        >
          <ExternalLink className="h-4 w-4" />
          View Digital Property Passport
        </button>
      </div>
    </div>
  );
};
