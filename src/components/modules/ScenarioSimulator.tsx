"use client";

import { useState, useEffect, useMemo } from 'react';
import { TrendingUp, TrendingDown, Target, Users, Truck, Battery, DollarSign, RotateCcw, Sparkles, BarChart3, Activity, Zap, Leaf } from 'lucide-react';
import { Card, MetricCard, ProgressBar } from '@/components/ui/Card';
import { api, defaultScenarioParams, defaultScenarioProjection, type ScenarioParams, type ScenarioProjection } from '@/lib/mock-data';
import { runScenario } from '@/lib/ai-scoring';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

export function ScenarioSimulator() {
  const [params, setParams] = useState<ScenarioParams>({ ...defaultScenarioParams });
  const [projection, setProjection] = useState<ScenarioProjection>(defaultScenarioProjection);
  const [baselineProjection, setBaselineProjection] = useState<ScenarioProjection>(defaultScenarioProjection);
  const [history, setHistory] = useState<Array<{ params: ScenarioParams; projection: ScenarioProjection; timestamp: Date }>>([]);
  const [loading, setLoading] = useState(false);
  const [activePreset, setActivePreset] = useState<string>('custom');

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        const result = await api.runScenario(params);
        setProjection(result);
      } catch (error) {
        console.error('Scenario simulation failed:', error);
        setProjection(runScenario(params));
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [params]);

  useEffect(() => {
    const runBaseline = async () => {
      try {
        const result = await api.runScenario(defaultScenarioParams);
        setBaselineProjection(result);
      } catch {
        setBaselineProjection(runScenario(defaultScenarioParams));
      }
    };
    runBaseline();
  }, []);

  const handleParamChange = (key: keyof ScenarioParams, value: number) => {
    const clampedValue = Math.max(
      PARAM_RANGES[key].min,
      Math.min(PARAM_RANGES[key].max, value)
    );
    setParams(prev => ({ ...prev, [key]: clampedValue }));
    setActivePreset('custom');
  };

  const applyPreset = (preset: ScenarioParams) => {
    setParams(preset);
    setActivePreset('preset');
  };

  const saveToHistory = () => {
    setHistory(prev => [
      { params: { ...params }, projection: { ...projection }, timestamp: new Date() },
      ...prev.slice(0, 9)
    ]);
  };

  const revenueDiff = projection.monthlyRevenue - baselineProjection.monthlyRevenue;
  const marginDiff = projection.monthlyMargin - baselineProjection.monthlyMargin;
  const uptimeDiff = projection.vehicleUptime - baselineProjection.vehicleUptime;
  const utilizationDiff = projection.riderUtilization - baselineProjection.riderUtilization;

  const PARAM_RANGES = {
    riderCount: { min: 50, max: 300, step: 5, label: 'Active Riders', unit: '' },
    maintenanceBudget: { min: 50000, max: 500000, step: 10000, label: 'Maintenance Budget', unit: '₹/month' },
    autonomyLevel: { min: 40, max: 95, step: 5, label: 'AI Autonomy Level', unit: '%' },
    chargingStations: { min: 4, max: 20, step: 1, label: 'Charging Stations', unit: '' },
    vehicleUtilizationTarget: { min: 50, max: 95, step: 5, label: 'Vehicle Utilization Target', unit: '%' },
  } as const;

  const PRESETS: Array<{ name: string; params: ScenarioParams; description: string; icon: React.ReactNode }> = [
    {
      name: 'Conservative',
      params: { riderCount: 100, maintenanceBudget: 120000, autonomyLevel: 60, chargingStations: 6, vehicleUtilizationTarget: 65 },
      description: 'Low risk, steady operations',
      icon: <Activity className="w-4 h-4" />,
    },
    {
      name: 'Aggressive Growth',
      params: { riderCount: 180, maintenanceBudget: 250000, autonomyLevel: 85, chargingStations: 12, vehicleUtilizationTarget: 90 },
      description: 'Maximize revenue, higher ops intensity',
      icon: <TrendingUp className="w-4 h-4" />,
    },
    {
      name: 'Cost Optimized',
      params: { riderCount: 110, maintenanceBudget: 150000, autonomyLevel: 80, chargingStations: 8, vehicleUtilizationTarget: 75 },
      description: 'Lean operations, high automation',
      icon: <Zap className="w-4 h-4" />,
    },
    {
      name: 'Current Baseline',
      params: { ...defaultScenarioParams },
      description: 'Today\'s operating parameters',
      icon: <BarChart3 className="w-4 h-4" />,
    },
  ];

  const KEY_METRICS_ICONS: Record<string, React.ReactNode> = {
    'Vehicle Uptime': <Truck className="w-4 h-4" />,
    'Rider Utilization': <Users className="w-4 h-4" />,
    'Breakdowns/Month': <Target className="w-4 h-4" />,
    'CO₂ Saved': <Leaf className="w-4 h-4" />,
  };

  if (loading) {
    return (
      <Card title="Scenario Simulator" subtitle="Interactive what-if analysis for hub operations" className="h-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <div className="space-y-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-16 bg-gray-200 rounded-xl animate-pulse" />
              ))}
            </div>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i}>
                  <div className="h-4 bg-gray-200 rounded-xl animate-pulse w-32 mb-2" />
                  <div className="h-2 bg-gray-200 rounded-xl animate-pulse" />
                </div>
              ))}
            </div>
          </div>
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-24 bg-gray-200 rounded-xl animate-pulse" />
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-72 bg-gray-200 rounded-xl animate-pulse" />
              <div className="h-72 bg-gray-200 rounded-xl animate-pulse" />
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card title="Scenario Simulator" subtitle="Interactive what-if analysis for hub operations" className="h-full">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls Panel */}
        <div className="lg:col-span-1 space-y-6">
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Quick Presets</h4>
            <div className="space-y-2 stagger-children">
              {PRESETS.map(preset => {
                const isSelected = activePreset === preset.name || (activePreset === 'preset' && JSON.stringify(params) === JSON.stringify(preset.params));
                return (
                  <button
                    key={preset.name}
                    onClick={() => applyPreset(preset.params)}
                    className={`w-full p-3 rounded-xl border-2 text-left transition-all duration-300 ${
                      isSelected
                        ? 'bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border-blue-300 shadow-md shadow-blue-100'
                        : 'border-gray-200 hover:border-gray-300:border-gray-600 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-300 ${
                        isSelected
                          ? 'bg-blue-100 text-blue-600'
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        {preset.icon}
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium truncate">{preset.name}</div>
                        <div className="text-xs text-gray-500 mt-0.5 truncate">{preset.description}</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h4 className="font-semibold text-gray-900 mb-4">Control Parameters</h4>
            <div className="space-y-6">
              {(Object.keys(PARAM_RANGES) as Array<keyof ScenarioParams>).map(key => {
                const range = PARAM_RANGES[key];
                const value = params[key];
                const percentage = ((value - range.min) / (range.max - range.min)) * 100;
                
                return (
                  <div key={key} className="space-y-1">
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-sm font-medium text-gray-700">{range.label}</label>
                      <span className="text-sm font-mono text-blue-600">
                        {value}{range.unit ? ` ${range.unit}` : ''}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={range.min}
                      max={range.max}
                      step={range.step}
                      value={value}
                      onChange={e => handleParamChange(key, Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none accent-blue-600"
                    />
                    <div className="flex justify-between text-[10px] text-gray-400 px-0.5">
                      <span>{range.min}{range.unit}</span>
                      <span>{range.max}{range.unit}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <button
              onClick={saveToHistory}
              disabled={loading}
              className="w-full mt-4 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 font-medium"
            >
              <Sparkles className="w-4 h-4 animate-pulse" />
              Save Scenario to History
            </button>
          </div>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <MetricCard
              label="Monthly Revenue"
              value={`₹${(projection.monthlyRevenue / 100000).toFixed(1)}L`}
              change={revenueDiff !== 0 ? `${revenueDiff > 0 ? '+' : ''}${(revenueDiff / 100000).toFixed(1)}L vs baseline` : 'Baseline'}
              changeType={revenueDiff > 0 ? 'positive' : revenueDiff < 0 ? 'negative' : 'neutral'}
              icon={<DollarSign className="w-4 h-4" />}
            />
            <MetricCard
              label="Monthly Margin"
              value={`₹${(projection.monthlyMargin / 100000).toFixed(1)}L`}
              change={`${projection.marginPercent.toFixed(1)}% (${marginDiff > 0 ? '+' : ''}${(marginDiff / 100000).toFixed(1)}L)`}
              changeType={marginDiff > 0 ? 'positive' : marginDiff < 0 ? 'negative' : 'neutral'}
              icon={<Target className="w-4 h-4" />}
            />
            <MetricCard
              label="Vehicle Uptime"
              value={`${projection.vehicleUptime.toFixed(1)}%`}
              change={uptimeDiff !== 0 ? `${uptimeDiff > 0 ? '+' : ''}${uptimeDiff.toFixed(1)}%` : 'Baseline'}
              changeType={uptimeDiff > 0 ? 'positive' : uptimeDiff < 0 ? 'negative' : 'neutral'}
              icon={<Truck className="w-4 h-4" />}
            />
            <MetricCard
              label="Rider Utilization"
              value={`${projection.riderUtilization.toFixed(1)}%`}
              change={utilizationDiff !== 0 ? `${utilizationDiff > 0 ? '+' : ''}${utilizationDiff.toFixed(1)}%` : 'Baseline'}
              changeType={utilizationDiff > 0 ? 'positive' : utilizationDiff < 0 ? 'negative' : 'neutral'}
              icon={<Users className="w-4 h-4" />}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200/60 rounded-xl p-4 shadow-sm">
              <h4 className="font-semibold text-gray-900 mb-4">Projected Monthly P&L</h4>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={[
                  { name: 'Revenue', value: projection.monthlyRevenue, baseline: baselineProjection.monthlyRevenue },
                  { name: 'Costs', value: projection.monthlyCosts, baseline: baselineProjection.monthlyCosts },
                  { name: 'Margin', value: projection.monthlyMargin, baseline: baselineProjection.monthlyMargin },
                ]}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorCosts" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorMargin" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tickFormatter={v => `₹${(v/100000).toFixed(1)}L`} tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(v: any) => [`₹${(v/100000).toFixed(1)}L`, '']} />
                  <Area type="monotone" dataKey="value" stroke="#22c55e" fillOpacity={1} fill="url(#colorRevenue)" />
                  <Area type="monotone" dataKey="value" stroke="#ef4444" fillOpacity={1} fill="url(#colorCosts)" />
                  <Area type="monotone" dataKey="value" stroke="#3b82f6" fillOpacity={1} fill="url(#colorMargin)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white border border-gray-200/60 rounded-xl p-4 shadow-sm">
              <h4 className="font-semibold text-gray-900 mb-4">Key Metrics vs Baseline</h4>
              <div className="space-y-4">
                {[
                  { label: 'Vehicle Uptime', current: projection.vehicleUptime, baseline: baselineProjection.vehicleUptime, unit: '%', good: 'higher', color: 'blue' as const },
                  { label: 'Rider Utilization', current: projection.riderUtilization, baseline: baselineProjection.riderUtilization, unit: '%', good: 'higher', color: 'indigo' as const },
                  { label: 'Breakdowns/Month', current: projection.breakdownsPerMonth, baseline: baselineProjection.breakdownsPerMonth, unit: '', good: 'lower', color: 'amber' as const },
                  { label: 'CO₂ Saved', current: projection.co2Saved, baseline: baselineProjection.co2Saved, unit: ' kg', good: 'higher', color: 'emerald' as const },
                ].map(metric => {
                  const diff = metric.current - metric.baseline;
                  const isGood = (metric.good === 'higher' && diff > 0) || (metric.good === 'lower' && diff < 0);
                  const colorClasses: Record<string, string> = {
                    blue: 'bg-blue-100 text-blue-600',
                    indigo: 'bg-indigo-100 text-indigo-600',
                    amber: 'bg-amber-100 text-amber-600',
                    emerald: 'bg-emerald-100 text-emerald-600',
                  };
                  return (
                    <div key={metric.label} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorClasses[metric.color]}`}>
                          {KEY_METRICS_ICONS[metric.label]}
                        </div>
                        <span className="text-sm text-gray-700">{metric.label}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">{metric.current.toFixed(1)}{metric.unit}</div>
                        <div className={`text-xs ${isGood ? 'text-green-600' : diff !== 0 ? 'text-red-600' : 'text-gray-500'}`}>
                          {diff !== 0 ? `${diff > 0 ? '+' : ''}${diff.toFixed(1)}${metric.unit} vs baseline` : 'Same as baseline'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Scenario History */}
          {history.length > 0 && (
            <div className="bg-white border border-gray-200/60 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-900">Scenario History</h4>
                <button className="text-sm text-gray-500 hover:text-gray-700 transition-colors">Clear</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Time</th>
                      <th className="text-right py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Riders</th>
                      <th className="text-right py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Maint. Budget</th>
                      <th className="text-right py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Autonomy</th>
                      <th className="text-right py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Revenue</th>
                      <th className="text-right py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Margin</th>
                      <th className="text-right py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Uptime</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((entry, idx) => (
                      <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-2 px-3 text-gray-500">{entry.timestamp.toLocaleTimeString()}</td>
                        <td className="py-2 px-3 text-right">{entry.params.riderCount}</td>
                        <td className="py-2 px-3 text-right">₹{(entry.params.maintenanceBudget/1000).toFixed(0)}K</td>
                        <td className="py-2 px-3 text-right">{entry.params.autonomyLevel}%</td>
                        <td className="py-2 px-3 text-right font-medium">₹{(entry.projection.monthlyRevenue/100000).toFixed(1)}L</td>
                        <td className="py-2 px-3 text-right font-medium">{entry.projection.marginPercent.toFixed(1)}%</td>
                        <td className="py-2 px-3 text-right">{entry.projection.vehicleUptime.toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
