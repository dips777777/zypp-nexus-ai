"use client";

import { useState, useEffect } from 'react';
import { Battery, Truck, MapPin, AlertCircle, CheckCircle, Loader2, Filter, Search } from 'lucide-react';
import { Card, Badge, Table, MetricCard } from '@/components/ui/Card';
import { api } from '@/lib/mock-data';
import type { Vehicle } from '@/types';

const STATUS_CONFIG = {
  available: { label: 'Available', color: 'success', icon: CheckCircle },
  in_use: { label: 'In Use', color: 'info', icon: Truck },
  charging: { label: 'Charging', color: 'warning', icon: Battery },
  maintenance: { label: 'Maintenance', color: 'default', icon: Loader2 },
  broken_down: { label: 'Broken Down', color: 'danger', icon: AlertCircle },
} as const;

export function LiveFleetIntelligence() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [hubFilter, setHubFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'healthScore', direction: 'asc' });
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await api.getVehicles();
        setVehicles(data);
        setFilteredVehicles(data);
        setLastUpdated(new Date());
      } catch (error) {
        console.error('Failed to fetch fleet data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let result = [...vehicles];
    
    if (statusFilter !== 'all') {
      result = result.filter(v => v.status === statusFilter);
    }
    if (hubFilter !== 'all') {
      result = result.filter(v => v.hubId === hubFilter);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(v => 
        v.registrationNumber.toLowerCase().includes(q) ||
        v.model.toLowerCase().includes(q) ||
        v.id.toLowerCase().includes(q)
      );
    }
    
    result.sort((a, b) => {
      const aVal = a[sortConfig.key as keyof Vehicle] as string | number;
      const bVal = b[sortConfig.key as keyof Vehicle] as string | number;
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    
    setFilteredVehicles(result);
  }, [vehicles, statusFilter, hubFilter, searchQuery, sortConfig]);

  const getBatteryColor = (battery: number) => {
    if (battery > 60) return 'text-emerald-600 dark:text-emerald-400';
    if (battery > 30) return 'text-amber-600 dark:text-amber-400';
    if (battery > 15) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  const hubs = [...new Set(vehicles.map(v => v.hubId))].sort();

  if (loading) {
    return (
      <Card title="Live Fleet Intelligence" subtitle="Loading vehicle data...">
        <div className="space-y-2.5">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-12 bg-gray-100 dark:bg-gray-700/50 rounded-xl animate-pulse" />
          ))}
        </div>
      </Card>
    );
  }

  const statusCounts = Object.keys(STATUS_CONFIG).reduce((acc, key) => {
    acc[key] = vehicles.filter(v => v.status === key).length;
    return acc;
  }, {} as Record<string, number>);

  const lowBatteryCount = vehicles.filter(v => v.currentBattery < 20 && v.status !== 'charging').length;
  const criticalHealthCount = vehicles.filter(v => v.predictedFailureRisk === 'critical').length;

  return (
    <Card title="Live Fleet Intelligence" subtitle={`Last updated: ${lastUpdated.toLocaleTimeString()}`} className="h-full">
      <div className="mb-5 flex flex-wrap gap-3 items-center">
        <div className="flex-1 w-full sm:min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search registration, model, ID..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200/60 dark:border-gray-700/60 rounded-xl bg-gray-50 dark:bg-gray-800/60 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 dark:focus:border-blue-500 transition-all placeholder:text-gray-400"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2.5 border border-gray-200/60 dark:border-gray-700/60 rounded-xl bg-gray-50 dark:bg-gray-800/60 text-sm w-full sm:min-w-[150px] focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
        >
          <option value="all">All Statuses</option>
          {Object.entries(STATUS_CONFIG).map(([key, config]) => (
            <option key={key} value={key}>{config.label} ({statusCounts[key] || 0})</option>
          ))}
        </select>
        <select
          value={hubFilter}
          onChange={e => setHubFilter(e.target.value)}
          className="px-3 py-2.5 border border-gray-200/60 dark:border-gray-700/60 rounded-xl bg-gray-50 dark:bg-gray-800/60 text-sm w-full sm:min-w-[150px] focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
        >
          <option value="all">All Hubs</option>
          {hubs.map(hubId => (
            <option key={hubId} value={hubId}>Hub {hubId.replace('hub_', '')}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-5 stagger-children">
        <MetricCard label="Total Vehicles" value={vehicles.length} icon={<Truck className="w-4 h-4" />} />
        <MetricCard label="Low Battery" value={lowBatteryCount} changeType={lowBatteryCount > 0 ? 'danger' : 'positive'} icon={<Battery className="w-4 h-4" />} />
        <MetricCard label="Critical Health" value={criticalHealthCount} changeType={criticalHealthCount > 0 ? 'danger' : 'positive'} icon={<AlertCircle className="w-4 h-4" />} />
        <MetricCard label="Available" value={statusCounts.available || 0} changeType="positive" icon={<CheckCircle className="w-4 h-4" />} />
        <MetricCard label="In Use" value={statusCounts.in_use || 0} icon={<Truck className="w-4 h-4" />} />
        <MetricCard label="Charging" value={statusCounts.charging || 0} icon={<Battery className="w-4 h-4" />} />
      </div>

      <div className="overflow-x-auto">
        <Table
          columns={[
            { key: 'registrationNumber', header: 'Registration', className: 'font-mono font-medium' },
            { key: 'model', header: 'Model' },
            { key: 'hubId', header: 'Hub', render: (v: Vehicle) => `Hub ${v.hubId.replace('hub_', '')}` },
            { 
              key: 'status', 
              header: 'Status', 
              render: (v: Vehicle) => {
                const config = STATUS_CONFIG[v.status];
                const Icon = config.icon;
                return (
                  <Badge variant={config.color as any} className="flex items-center gap-1">
                    <Icon className="w-3 h-3" />
                    {config.label}
                  </Badge>
                );
              }
            },
            { 
              key: 'currentBattery', 
              header: 'Battery', 
              className: 'text-right',
              render: (v: Vehicle) => (
                <span className={`font-semibold ${getBatteryColor(v.currentBattery)}`}>{v.currentBattery}%</span>
              )
            },
            { 
              key: 'healthScore', 
              header: 'Health', 
              className: 'text-right',
              render: (v: Vehicle) => (
                <Badge variant={v.healthScore >= 80 ? 'success' : v.healthScore >= 60 ? 'warning' : 'danger'}>
                  {v.healthScore}
                </Badge>
              )
            },
            { 
              key: 'predictedFailureRisk', 
              header: 'Risk', 
              render: (v: Vehicle) => (
                <Badge variant={
                  v.predictedFailureRisk === 'critical' ? 'danger' :
                  v.predictedFailureRisk === 'high' ? 'warning' :
                  v.predictedFailureRisk === 'medium' ? 'info' : 'success'
                }>
                  {v.predictedFailureRisk}
                </Badge>
              )
            },
            { 
              key: 'totalDistance', 
              header: 'Distance', 
              className: 'text-right',
              render: (v: Vehicle) => `${v.totalDistance.toLocaleString()} km`
            },
            { 
              key: 'repairCount', 
              header: 'Repairs', 
              className: 'text-right' 
            },
            { 
              key: 'lastServiceDate', 
              header: 'Last Service', 
              render: (v: Vehicle) => new Date(v.lastServiceDate).toLocaleDateString()
            },
          ]}
          data={filteredVehicles}
          onRowClick={setSelectedVehicle}
          className="text-sm"
        />
      </div>

      {selectedVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setSelectedVehicle(null)}>
          <div className="bg-white dark:bg-gray-800/95 backdrop-blur-md rounded-2xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto shadow-2xl border border-gray-200/60 dark:border-gray-700/60 animate-fade-in-scale" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                  <Truck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Vehicle Details</h3>
                  <p className="text-xs text-gray-400 font-mono">{selectedVehicle.registrationNumber}</p>
                </div>
              </div>
              <button onClick={() => setSelectedVehicle(null)} className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700/50 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                <span className="text-lg leading-none">&times;</span>
              </button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-3"><span className="text-xs text-gray-400 block mb-1">Model</span><span className="font-semibold text-gray-900 dark:text-white">{selectedVehicle.model}</span></div>
                <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-3"><span className="text-xs text-gray-400 block mb-1">Hub</span><span className="font-semibold text-gray-900 dark:text-white">Hub {selectedVehicle.hubId.replace('hub_', '')}</span></div>
                <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-3"><span className="text-xs text-gray-400 block mb-1">Status</span><span className="font-semibold text-gray-900 dark:text-white capitalize">{selectedVehicle.status.replace('_', ' ')}</span></div>
                <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-3"><span className="text-xs text-gray-400 block mb-1">Battery</span><span className={`font-bold text-lg ${getBatteryColor(selectedVehicle.currentBattery)}`}>{selectedVehicle.currentBattery}%</span></div>
                <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-3"><span className="text-xs text-gray-400 block mb-1">Health Score</span><span className="font-bold text-lg text-gray-900 dark:text-white">{selectedVehicle.healthScore}/100</span></div>
                <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-3"><span className="text-xs text-gray-400 block mb-1">Failure Risk</span><Badge variant={
                  selectedVehicle.predictedFailureRisk === 'critical' ? 'danger' :
                  selectedVehicle.predictedFailureRisk === 'high' ? 'warning' :
                  selectedVehicle.predictedFailureRisk === 'medium' ? 'info' : 'success'
                }>{selectedVehicle.predictedFailureRisk}</Badge></div>
                <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-3"><span className="text-xs text-gray-400 block mb-1">Total Distance</span><span className="font-semibold text-gray-900 dark:text-white">{selectedVehicle.totalDistance.toLocaleString()} km</span></div>
                <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-3"><span className="text-xs text-gray-400 block mb-1">Repairs</span><span className="font-semibold text-gray-900 dark:text-white">{selectedVehicle.repairCount}</span></div>
                <div className="col-span-2 bg-gray-50 dark:bg-gray-700/30 rounded-xl p-3"><span className="text-xs text-gray-400 block mb-1">Last Service</span><span className="font-semibold text-gray-900 dark:text-white">{new Date(selectedVehicle.lastServiceDate).toLocaleDateString()}</span></div>
                <div className="col-span-2 bg-gray-50 dark:bg-gray-700/30 rounded-xl p-3"><span className="text-xs text-gray-400 block mb-1">GPS Location</span><span className="font-mono text-xs text-gray-600 dark:text-gray-300">{selectedVehicle.location[0].toFixed(4)}, {selectedVehicle.location[1].toFixed(4)}</span></div>
                {selectedVehicle.assignedRiderId && (
                  <div className="col-span-2 bg-blue-50 dark:bg-blue-900/10 rounded-xl p-3"><span className="text-xs text-blue-600 dark:text-blue-400 block mb-1">Assigned Rider</span><span className="font-semibold text-gray-900 dark:text-white">{selectedVehicle.assignedRiderId.replace(`rider_${selectedVehicle.hubId}_`, 'Rider #')}</span></div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
