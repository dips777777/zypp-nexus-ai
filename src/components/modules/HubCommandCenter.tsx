"use client";

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Target, Zap, Users, Truck, AlertTriangle, CheckCircle } from 'lucide-react';
import { Card, Badge, MetricCard, ProgressBar, Table } from '@/components/ui/Card';
import { api } from '@/lib/mock-data';
import type { Hub, Alert } from '@/types';

export function HubCommandCenter() {
  const [hubs, setHubs] = useState<Hub[]>([]);
  const [selectedHub, setSelectedHub] = useState<Hub | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await api.getHubs();
        setHubs(data);
        setLastUpdated(new Date());
      } catch (error) {
        console.error('Failed to fetch hub data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  const getAutonomyColor = (score: number) => {
    if (score >= 85) return 'success';
    if (score >= 70) return 'info';
    if (score >= 55) return 'warning';
    return 'danger';
  };

  const getAutonomyLabel = (score: number) => {
    if (score >= 85) return 'Fully Autonomous';
    if (score >= 70) return 'High Autonomy';
    if (score >= 55) return 'Partial Autonomy';
    return 'Manual Ops';
  };

  const getAutonomyTextColor = (score: number) => {
    if (score >= 85) return 'text-emerald-600 dark:text-emerald-400';
    if (score >= 70) return 'text-blue-600 dark:text-blue-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getStatusDotColor = (status: string) => {
    if (status === 'active') return 'bg-emerald-500';
    if (status === 'maintenance') return 'bg-amber-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <Card title="Hub Command Center" subtitle="Loading hub autonomy data...">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-gray-100 dark:bg-gray-700 rounded-xl p-6 animate-pulse">
              <div className="h-6 bg-gray-200 dark:bg-gray-600 rounded w-3/4 mb-4" />
              <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/2" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  const avgAutonomy = hubs.reduce((sum, h) => sum + h.autonomyScore, 0) / hubs.length;
  const highAutonomyHubs = hubs.filter(h => h.autonomyScore >= 85).length;
  const lowAutonomyHubs = hubs.filter(h => h.autonomyScore < 70).length;
  const totalAlerts = hubs.reduce((sum, h) => sum + h.alerts.length, 0);

  return (
    <Card title="Hub Command Center" subtitle={`Network Autonomy: ${Math.round(avgAutonomy)}% • Last updated: ${lastUpdated.toLocaleTimeString()}`} className="h-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard label="Avg Autonomy" value={`${Math.round(avgAutonomy)}%`} icon={<Target className="w-5 h-5" />} />
        <MetricCard label="Fully Autonomous" value={highAutonomyHubs} change={`${highAutonomyHubs}/${hubs.length} hubs`} changeType="positive" icon={<CheckCircle className="w-5 h-5" />} />
        <MetricCard label="Needs Attention" value={lowAutonomyHubs} changeType={lowAutonomyHubs > 0 ? 'warning' : 'positive'} icon={<AlertTriangle className="w-5 h-5" />} />
        <MetricCard label="Active Alerts" value={totalAlerts} icon={<Zap className="w-5 h-5" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900 dark:text-white">Hub Autonomy Scores</h4>
          <div className="space-y-3 stagger-children">
            {hubs
              .sort((a, b) => b.autonomyScore - a.autonomyScore)
              .map(hub => (
                <div
                  key={hub.id}
                  className={`bg-white dark:bg-gray-800 border rounded-xl p-4 hover:shadow-md transition-all duration-300 cursor-pointer ${
                    selectedHub?.id === hub.id
                      ? 'bg-blue-50/80 dark:bg-blue-900/10 border-blue-300 dark:border-blue-700 shadow-md shadow-blue-100 dark:shadow-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700'
                  }`}
                  onClick={() => setSelectedHub(hub)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold ${
                        selectedHub?.id === hub.id
                          ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                      }`}>
                        {hub.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2.5 h-2.5 rounded-full ${getStatusDotColor(hub.status)}`} />
                          <h5 className="font-medium text-gray-900 dark:text-white">{hub.name}</h5>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{hub.city} • {hub.fleetSize} vehicles • {hub.riderCount} riders</p>
                      </div>
                    </div>
                    <Badge variant={getAutonomyColor(hub.autonomyScore)}>
                      <span className={getAutonomyTextColor(hub.autonomyScore)}>{hub.autonomyScore}%</span>
                    </Badge>
                  </div>
                  <ProgressBar value={hub.autonomyScore} color={getAutonomyColor(hub.autonomyScore) as any} showLabel={false} />
                  <p className={`text-xs mt-1 font-medium ${getAutonomyTextColor(hub.autonomyScore)}`}>{getAutonomyLabel(hub.autonomyScore)}</p>
                </div>
              ))}
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900 dark:text-white">Operational Metrics</h4>
          <div className="overflow-x-auto">
            <Table
              columns={[
                { key: 'name', header: 'Hub', render: (h: Hub) => (
                  <div>
                    <p className="font-medium">{h.name}</p>
                    <p className="text-xs text-gray-500">{h.city}</p>
                  </div>
                )},
                { key: 'fleetSize', header: 'Fleet', className: 'text-right' },
                { key: 'riderCount', header: 'Riders', className: 'text-right' },
                { key: 'autonomyScore', header: 'Autonomy', className: 'text-right', render: (h: Hub) => (
                  <Badge variant={getAutonomyColor(h.autonomyScore)}>{h.autonomyScore}%</Badge>
                )},
                { key: 'todayDeliveries', header: 'Deliveries', className: 'text-right' },
                { key: 'todayRevenue', header: 'Revenue', className: 'text-right', render: (h: Hub) => `₹${(h.todayRevenue/1000).toFixed(0)}K` },
                { key: 'status', header: 'Status', render: (h: Hub) => <Badge variant={h.status === 'active' ? 'success' : h.status === 'maintenance' ? 'warning' : 'danger'}>{h.status}</Badge> },
              ]}
              data={hubs}
              className="text-sm"
              onRowClick={setSelectedHub}
            />
          </div>
        </div>
      </div>

      {selectedHub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setSelectedHub(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto shadow-2xl border border-gray-200/60 dark:border-gray-700/60 animate-fade-in-scale" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                  {selectedHub.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{selectedHub.name}</h3>
                  <p className="text-sm text-gray-500">{selectedHub.city} • Hub #{selectedHub.id.replace('hub_', '')}</p>
                </div>
              </div>
              <button onClick={() => setSelectedHub(null)} className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700/50 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                <span className="text-lg leading-none">&times;</span>
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <MetricCard label="Autonomy Score" value={`${selectedHub.autonomyScore}%`} icon={<Target className="w-4 h-4" />} />
              <MetricCard label="Fleet Size" value={selectedHub.fleetSize} icon={<Truck className="w-4 h-4" />} />
              <MetricCard label="Active Riders" value={selectedHub.riderCount} icon={<Users className="w-4 h-4" />} />
              <MetricCard label="Deliveries Today" value={selectedHub.todayDeliveries} icon={<CheckCircle className="w-4 h-4" />} />
              <MetricCard label="Revenue Today" value={`₹${(selectedHub.todayRevenue/1000).toFixed(0)}K`} icon={<TrendingUp className="w-4 h-4" />} />
              <MetricCard label="Status" value={selectedHub.status} icon={<Zap className="w-4 h-4" />} />
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <h5 className="font-medium mb-3">Autonomy Breakdown</h5>
              <div className="space-y-3">
                {[
                  { label: 'Alert Auto-Resolution', score: Math.min(95, selectedHub.autonomyScore + 10) },
                  { label: 'Routing Optimization Acceptance', score: Math.min(90, selectedHub.autonomyScore + 5) },
                  { label: 'Charging Schedule Compliance', score: Math.max(40, selectedHub.autonomyScore - 15) },
                  { label: 'Rider Assignment Accuracy', score: Math.min(92, selectedHub.autonomyScore + 8) },
                  { label: 'Maintenance Scheduling', score: Math.max(35, selectedHub.autonomyScore - 20) },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">{item.label}</span>
                    <div className="w-full max-w-[192px]">
                      <ProgressBar value={item.score} color={item.score >= 80 ? 'green' : item.score >= 60 ? 'yellow' : 'red'} showLabel={true} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {selectedHub.alerts.length > 0 && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                <h5 className="font-medium mb-3">Active Alerts ({selectedHub.alerts.length})</h5>
                <div className="overflow-x-auto">
                  <Table
                    columns={[
                      { key: 'type', header: 'Type', render: (a: Alert) => a.type.replace('_', ' ') },
                      { key: 'severity', header: 'Severity', render: (a: Alert) => <Badge variant={a.severity === 'critical' ? 'danger' : a.severity === 'warning' ? 'warning' : 'info'}>{a.severity}</Badge> },
                      { key: 'message', header: 'Message' },
                      { key: 'timestamp', header: 'Time', render: (a: Alert) => new Date(a.timestamp).toLocaleTimeString() },
                      { key: 'action', header: 'Suggested Action', render: (a: Alert) => a.suggestedAction || '-' },
                    ]}
                    data={selectedHub.alerts}
                    className="text-sm"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
