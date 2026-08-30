"use client";

import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  action?: ReactNode;
}

export function Card({ children, className = '', title, subtitle, action }: CardProps) {
  return (
    <div className={`bg-white backdrop-blur-sm rounded-xl border border-gray-200/60 shadow-sm hover:shadow-md transition-shadow duration-300 ${className}`}>
      {(title || action) && (
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            {title && <h3 className="text-lg font-bold text-gray-900 tracking-tight">{title}</h3>}
            {subtitle && <p className="text-xs text-gray-400 mt-0.5 font-medium">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}

interface MetricCardProps {
  label: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral' | 'warning' | 'danger';
  icon?: ReactNode;
  className?: string;
}

const iconBgColors: Record<string, string> = {
  positive: 'bg-emerald-50 text-emerald-600',
  negative: 'bg-red-50 text-red-600',
  warning: 'bg-amber-50 text-amber-600',
  danger: 'bg-red-50 text-red-600',
  neutral: 'bg-blue-50 text-blue-600',
};

export function MetricCard({ label, value, change, changeType = 'neutral', icon, className = '' }: MetricCardProps) {
  return (
    <div className={`bg-white backdrop-blur-sm rounded-xl border border-gray-200/60 p-4 hover:shadow-md transition-all duration-300 group ${className}`}>
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1.5 tracking-tight">{value}</p>
          {change && (
            <p className={`text-xs mt-1.5 flex items-center gap-1 font-medium ${
              changeType === 'positive' ? 'text-emerald-600' :
              changeType === 'negative' ? 'text-red-600' :
              changeType === 'warning' ? 'text-amber-600' :
              changeType === 'danger' ? 'text-red-600' :
              'text-gray-400'
            }`}>
              {change}
            </p>
          )}
        </div>
        {icon && (
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110 ${iconBgColors[changeType || 'neutral']}`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
}

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  const variants = {
    default: 'bg-gray-100 text-gray-600',
    success: 'bg-emerald-50 text-emerald-700',
    warning: 'bg-amber-50 text-amber-700',
    danger: 'bg-red-50 text-red-700',
    info: 'bg-blue-50 text-blue-700',
  };
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}

interface TableProps {
  columns: Array<{ key: string; header: string; render?: (row: any) => ReactNode; className?: string }>;
  data: any[];
  className?: string;
  emptyMessage?: string;
  onRowClick?: (row: any) => void;
}

export function Table({ columns, data, className = '', emptyMessage = 'No data available', onRowClick }: TableProps) {
  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        {emptyMessage}
      </div>
    );
  }
  
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            {columns.map(col => (
              <th key={col.key} className={`px-3 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider ${col.className || ''}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.map((row, rowIndex) => (
            <tr 
              key={row.id || rowIndex} 
              className={`${onRowClick ? 'cursor-pointer hover:bg-gray-50:bg-gray-700/30' : ''} transition-colors`}
              onClick={() => onRowClick?.(row)}
            >
              {columns.map(col => (
                <td key={col.key} className={`px-3 py-2.5 ${col.className || ''}`}>
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  showLabel?: boolean;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
}

export function ProgressBar({ value, max = 100, className = '', showLabel = true, color = 'blue' }: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const colors = {
    blue: 'bg-gradient-to-r from-blue-500 to-blue-400',
    green: 'bg-gradient-to-r from-emerald-500 to-emerald-400',
    yellow: 'bg-gradient-to-r from-amber-500 to-amber-400',
    red: 'bg-gradient-to-r from-red-500 to-red-400',
    purple: 'bg-gradient-to-r from-purple-500 to-purple-400',
  };
  
  return (
    <div className={className}>
      <div className="flex items-center justify-between text-xs mb-1">
        {showLabel && <span className="text-gray-500 font-medium">{Math.round(percentage)}%</span>}
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div 
          className={`${colors[color]} h-full rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
