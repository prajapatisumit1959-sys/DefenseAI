import React from 'react';
import { Cpu, ShieldCheck, Activity, Camera, RefreshCw } from 'lucide-react';
import { SYSTEM_SERVICES_STATUS } from '../../data/dashboardData';

export const SystemStatus: React.FC = () => {
  const getServiceIcon = (name: string) => {
    switch (name) {
      case 'AI Analysis Engine':
        return <Cpu className="w-3.5 h-3.5 text-cyan-400" />;
      case 'Interview Monitor':
        return <Activity className="w-3.5 h-3.5 text-blue-400" />;
      case 'Camera Module':
        return <Camera className="w-3.5 h-3.5 text-purple-400" />;
      case 'Risk Engine':
        return <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />;
      default:
        return <Cpu className="w-3.5 h-3.5 text-cyan-400" />;
    }
  };

  return (
    <div className="rounded-xl bg-slate-900/60 border border-slate-800/80 p-5 space-y-4 hover:border-slate-700/80 transition-all">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <h3 className="text-sm font-semibold text-white tracking-tight">
            System Status
          </h3>
        </div>
        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded">
          All Services Ready
        </span>
      </div>

      {/* Services List */}
      <div className="space-y-2.5">
        {SYSTEM_SERVICES_STATUS.map((service) => (
          <div
            key={service.name}
            className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/60 flex items-center justify-between gap-3 text-xs"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-1.5 rounded-md bg-slate-900 border border-slate-800 shrink-0">
                {getServiceIcon(service.name)}
              </div>
              <div className="min-w-0">
                <span className="font-medium text-slate-200 block truncate text-xs">
                  {service.name}
                </span>
                <span className="text-[10px] text-slate-500 font-mono block truncate">
                  {service.details}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {service.simulatedLatency && (
                <span className="text-[10px] font-mono text-slate-500 hidden sm:inline-block">
                  {service.simulatedLatency}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-emerald-950/60 text-emerald-300 border border-emerald-800/40">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>{service.status}</span>
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Disclaimer/Architecture note */}
      <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-500 font-mono flex items-center justify-between">
        <span>Framework: DefenseAI Subsystem Core</span>
        <span className="text-slate-400">Environment: Ready</span>
      </div>
    </div>
  );
};
