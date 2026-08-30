"use client";

import { useState, useEffect } from 'react';
import { MapPin, TrendingUp, Cloud, Building2 } from 'lucide-react';
import { Card, Badge, MetricCard, Table } from '@/components/ui/Card';
import { api } from '@/lib/mock-data';
import type { DemandForecast } from '@/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export function DemandForecastMap() {
  const [forecast, setForecast] = useState<DemandForecast[]>([]);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'6h' | '12h' | '24h' | '48h'>('24h');
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const hours = timeRange === '6h' ? 6 : timeRange === '12h' ? 12 : timeRange === '24h' ? 24 : 48;
        const data = await api.getDemandForecast('hub_1', hours);
        setForecast(data);
        setLastUpdated(new Date());
      } catch (error) {
        console.error('Failed to fetch demand forecast:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 300000); // 5 min
    return () => clearInterval(interval);
  }, [timeRange]);

  const zones = [...new Set(forecast.map(f => f.areaId))].sort();
  const currentHour = new Date().getHours();
  
  // Get forecast for current/next few hours
  const now = new Date();
  const currentForecast = forecast.filter(f => {
    const slotTime = new Date(f.timeSlot);
    return slotTime >= now && slotTime <= new Date(now.getTime() + 6 * 3600000);
  });

  const zoneSummary = zones.map(zoneId => {
    const zoneForecast = currentForecast.filter(f => f.areaId === zoneId);
    const totalOrders = zoneForecast.reduce((sum, f) => sum + f.predictedOrders, 0);
    const avgConfidence = zoneForecast.reduce((sum, f) => sum + f.confidence, 0) / Math.max(1, zoneForecast.length);
    const zoneName = zoneForecast[0]?.areaName || zoneId;
    return { zoneId, zoneName, totalOrders, avgConfidence, forecast: zoneForecast };
  }).sort((a, b) => b.totalOrders - a.totalOrders);

  const peakZone = zoneSummary[0];
  const totalPredictedOrders = zoneSummary.reduce((sum, z) => sum + z.totalOrders, 0);

  const maxOrders = Math.max(1, ...zoneSummary.map(z => z.totalOrders));

  const getDemandLevel = (orders: number): 'high' | 'medium' | 'low' => {
    const ratio = orders / maxOrders;
    if (ratio > 0.66) return 'high';
    if (ratio > 0.33) return 'medium';
    return 'low';
  };

  const demandStyles = {
    high: {
      card: 'bg-gradient-to-br from-red-50 to-orange-50 border-red-200/40',
      text: 'text-red-600',
      bar: 'bg-red-500',
    },
    medium: {
      card: 'bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200/40',
      text: 'text-amber-600',
      bar: 'bg-amber-500',
    },
    low: {
      card: 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200/40',
      text: 'text-green-600',
      bar: 'bg-green-500',
    },
  };

  const getTimeLabel = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <Card title="Demand Forecast Map" subtitle="Loading predictions...">
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card title="Demand Forecast Map" subtitle={`Next ${timeRange} • Last updated: ${lastUpdated.toLocaleTimeString()}`} className="h-full">
      <div className="flex flex-wrap gap-4 items-center mb-4">
        <div className="flex gap-2">
          {(['6h', '12h', '24h', '48h'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTimeRange(t)}
              className={`px-3 py-1.5 text-sm transition-all duration-300 ${timeRange === t ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-xl'}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <MetricCard label="Total Predicted Orders" value={totalPredictedOrders} icon={<TrendingUp className="w-4 h-4" />} />
        <MetricCard label="Peak Zone" value={peakZone?.zoneName || '-'} change={`${peakZone?.totalOrders || 0} orders`} icon={<MapPin className="w-4 h-4" />} />
        <MetricCard label="Active Zones" value={zoneSummary.length} icon={<Building2 className="w-4 h-4" />} />
        <MetricCard label="Forecast Confidence" value={`${Math.round(zoneSummary.reduce((s, z) => s + z.avgConfidence, 0) / zoneSummary.length * 100)}%`} icon={<Cloud className="w-4 h-4" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900">Zone Demand Heatmap</h4>
          <div className="bg-white border border-gray-200/60 rounded-xl p-4 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 stagger-children">
              {zoneSummary.map(zone => {
                const level = getDemandLevel(zone.totalOrders);
                const styles = demandStyles[level];
                const barWidth = Math.min(100, (zone.totalOrders / maxOrders) * 100);
                return (
                  <button
                    key={zone.zoneId}
                    onClick={() => setSelectedZone(zone.zoneId)}
                    className={`p-3 rounded-xl text-left transition-all duration-300 hover:shadow-md hover:scale-[1.02] border ${styles.card} ${selectedZone === zone.zoneId ? 'ring-2 ring-blue-400' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{zone.zoneName}</p>
                        <p className="text-xs text-gray-500">{zone.forecast[0]?.factors.join(', ') || 'No factors'}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-2xl font-bold ${styles.text}`}>{zone.totalOrders}</p>
                        <p className="text-xs text-gray-500">Next 6h</p>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-200/60 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${styles.bar}`}
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">{Math.round(zone.avgConfidence * 100)}% conf.</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900">Hourly Demand Trend</h4>
          <div className="bg-white border border-gray-200/60 rounded-xl p-4 shadow-sm h-48 sm:h-64 animate-fade-in">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={zoneSummary.flatMap(z => z.forecast.slice(0, 12)).sort((a, b) => new Date(a.timeSlot).getTime() - new Date(b.timeSlot).getTime())}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="timeSlot" 
                  tickFormatter={getTimeLabel}
                  tick={{ fontSize: 10 }}
                  stroke="#9ca3af"
                />
                <YAxis tick={{ fontSize: 10 }} stroke="#9ca3af" />
                <Tooltip 
                  formatter={(value: any, name: any) => [value, name]}
                  labelFormatter={(label: any) => getTimeLabel(new Date(label))}
                />
                <Bar dataKey="predictedOrders" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                  {zoneSummary.flatMap(z => z.forecast.slice(0, 12)).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.predictedOrders > 50 ? '#ef4444' : entry.predictedOrders > 30 ? '#f59e0b' : '#3b82f6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {selectedZone && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-900">
              {zoneSummary.find(z => z.zoneId === selectedZone)?.zoneName} - Hourly Breakdown
            </h4>
            <button onClick={() => setSelectedZone(null)} className="text-sm text-gray-500 hover:text-gray-700">Close</button>
          </div>
          <div className="overflow-x-auto">
            <Table
              columns={[
                { key: 'timeSlot', header: 'Time Slot', render: (f: any) => getTimeLabel(new Date(f.timeSlot)) },
                 { key: 'predictedOrders', header: 'Predicted Orders', className: 'text-right', render: (f: any) => (
                   <span className={f.predictedOrders > 50 ? 'text-red-600 font-medium' : f.predictedOrders > 30 ? 'text-amber-500' : 'text-green-500'}>{f.predictedOrders}</span>
                 )},
                 { key: 'confidence', header: 'Confidence', className: 'text-right', render: (f: any) => `${Math.round(f.confidence * 100)}%` },
                 { key: 'factors', header: 'Demand Factors', render: (f: any) => (
                  <div className="flex flex-wrap gap-1">
                    {f.factors.map((factor: any) => (
                      <Badge key={factor} variant="info" className="text-xs">{factor.replace('_', ' ')}</Badge>
                    ))}
                  </div>
                )},
              ]}
              data={forecast.filter(f => f.areaId === selectedZone).slice(0, 24) as any}
              className="text-sm"
            />
          </div>
        </div>
      )}

      <div className="mt-6 border-t border-gray-200 pt-4">
        <h4 className="font-semibold text-gray-900 mb-3">All Zones - Next 24 Hours</h4>
        <div className="overflow-x-auto">
          <Table
            columns={[
              { key: 'zoneName', header: 'Zone' },
               { key: 'timeSlot', header: 'Time', render: (f: any) => getTimeLabel(new Date(f.timeSlot)) },
               { key: 'predictedOrders', header: 'Orders', className: 'text-right', render: (f: any) => f.predictedOrders },
               { key: 'confidence', header: 'Confidence', className: 'text-right', render: (f: any) => `${Math.round(f.confidence * 100)}%` },
               { key: 'factors', header: 'Factors', render: (f: any) => f.factors.map((x: any) => <Badge key={x} variant="info" className="text-xs mr-1">{x.replace('_', ' ')}</Badge>) },
            ]}
            data={forecast.slice(0, 50) as any}
            className="text-sm"
          />
        </div>
      </div>
    </Card>
  );
}
