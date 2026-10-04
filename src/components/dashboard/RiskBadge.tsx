import React from 'react';
import { DashboardRiskLevel } from '../../types/dashboard';
import { ShieldCheck, AlertTriangle, ShieldAlert } from 'lucide-react';

interface RiskBadgeProps {
  level: DashboardRiskLevel;
  size?: 'sm' | 'md';
  showIcon?: boolean;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({
  level,
  size = 'md',
  showIcon = true,
}) => {
  const getBadgeConfig = () => {
    switch (level) {
      case 'Low Risk':
        return {
          containerClass: 'bg-emerald-950/60 text-emerald-300 border-emerald-800/50',
          dotClass: 'bg-emerald-400',
          icon: ShieldCheck,
          label: 'Low Risk',
        };
      case 'Review Required':
        return {
          containerClass: 'bg-amber-950/60 text-amber-300 border-amber-800/50',
          dotClass: 'bg-amber-400',
          icon: AlertTriangle,
          label: 'Review Required',
        };
      case 'High Risk':
        return {
          containerClass: 'bg-rose-950/60 text-rose-300 border-rose-800/50',
          dotClass: 'bg-rose-400',
          icon: ShieldAlert,
          label: 'High Risk',
        };
      default:
        return {
          containerClass: 'bg-slate-800 text-slate-300 border-slate-700',
          dotClass: 'bg-slate-400',
          icon: ShieldCheck,
          label: level,
        };
    }
  };

  const config = getBadgeConfig();
  const Icon = config.icon;

  const sizeClasses =
    size === 'sm'
      ? 'px-2 py-0.5 text-[10px]'
      : 'px-2.5 py-1 text-[11px] font-medium';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border font-mono tracking-tight ${config.containerClass} ${sizeClasses} transition-colors`}
    >
      {showIcon ? (
        <Icon className={size === 'sm' ? 'w-3 h-3 shrink-0' : 'w-3.5 h-3.5 shrink-0'} />
      ) : (
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${config.dotClass}`} />
      )}
      <span className="whitespace-nowrap">{config.label}</span>
    </span>
  );
};
