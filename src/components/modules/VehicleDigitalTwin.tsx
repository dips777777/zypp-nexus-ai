"use client";

import { useState, useEffect } from 'react';
import { Search, Filter, Battery, Truck, Wrench, AlertTriangle, CheckCircle, XCircle, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import { Card, Badge, MetricCard, ProgressBar, Table } from '@/components/ui/Card';
import { api } from '@/lib/mock-data';
import type { Vehicle } from '@/types';

export function VehicleDigitalTwin() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [hubFilter, setHubFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [viewIndex, setViewIndex] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await api.getVehicles();
        setVehicles(data);
      } catch (error) {
        console.error('Failed to fetch vehicle data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredVehicles = vehicles.filter(v => {
    if (riskFilter !== 'all' && v.predictedFailureRisk !== riskFilter) return false;
    if (hubFilter !== 'all' && v.hubId !== hubFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!v.registrationNumber.toLowerCase().includes(q) &&
          !v.model.toLowerCase().includes(q) &&
          !v.id.toLowerCase().includes(q)) return false;
    }
    return true;
  }).sort((a, b) => a.healthScore - b.healthScore); // Worst health first

  const hubs = [...new Set(vehicles.map(v => v.hubId))].sort();

  const riskColors = {
    critical: 'danger',
    high: 'warning',
    medium: 'info',
    low: 'success',
  } as const;

  if (loading) {
    return (
      <Card title="Vehicle Digital Twin" subtitle="Loading vehicle profiles...">
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-gray-100 dark:bg-gray-700 rounded-xl animate-pulse" />
          ))}
        </div>
      </Card>
    );
  }

  const criticalCount = vehicles.filter(v => v.predictedFailureRisk === 'critical').length;
  const highCount = vehicles.filter(v => v.predictedFailureRisk === 'high').length;
  const avgHealth = Math.round(vehicles.reduce((sum, v) => sum + v.healthScore, 0) / vehicles.length);

  return (
    <Card title="Vehicle Digital Twin" subtitle={`${vehicles.length} vehicles • Avg Health: ${avgHealth}/100`} className="h-full">
      <div className="flex flex-wrap gap-4 items-center mb-4">
        <div className="flex-1 w-full sm:min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search registration, model, ID..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all"
          />
        </div>
        <select value={riskFilter} onChange={e => setRiskFilter(e.target.value)} className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-blue-500/40 transition-all">
          <option value="all">All Risk Levels</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <select value={hubFilter} onChange={e => setHubFilter(e.target.value)} className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-sm w-full sm:min-w-[150px] focus:ring-2 focus:ring-blue-500/40 transition-all">
          <option value="all">All Hubs</option>
          {hubs.map(h => <option key={h} value={h}>Hub {h.replace('hub_', '')}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <MetricCard label="Total Vehicles" value={vehicles.length} />
        <MetricCard label="Critical Risk" value={criticalCount} changeType={criticalCount > 0 ? 'danger' : 'positive'} icon={<AlertTriangle className="w-4 h-4" />} />
        <MetricCard label="High Risk" value={highCount} changeType={highCount > 0 ? 'warning' : 'positive'} icon={<Wrench className="w-4 h-4" />} />
        <MetricCard label="Avg Health Score" value={`${avgHealth}/100`} icon={<CheckCircle className="w-4 h-4" />} />
      </div>

      {selectedVehicle ? (
        <VehicleDetailView vehicle={selectedVehicle} onClose={() => setSelectedVehicle(null)} onNavigate={dir => {
          const idx = filteredVehicles.findIndex(v => v.id === selectedVehicle.id);
          const nextIdx = (idx + dir + filteredVehicles.length) % filteredVehicles.length;
          setSelectedVehicle(filteredVehicles[nextIdx]);
        }} />
      ) : (
        <div className="overflow-x-auto">
          <Table
            columns={[
              { key: 'registrationNumber', header: 'Registration', className: 'font-mono font-medium', render: (v: Vehicle) => (
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    v.predictedFailureRisk === 'critical' ? 'bg-red-500' :
                    v.predictedFailureRisk === 'high' ? 'bg-orange-500' :
                    v.predictedFailureRisk === 'medium' ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`} />
                  {v.registrationNumber}
                </div>
              )},
              { key: 'model', header: 'Model' },
              { key: 'hubId', header: 'Hub', render: (v: Vehicle) => `Hub ${v.hubId.replace('hub_', '')}` },
              { key: 'status', header: 'Status', render: (v: Vehicle) => {
                const configs = {
                  available: { label: 'Available', color: 'success' as const },
                  in_use: { label: 'In Use', color: 'info' as const },
                  charging: { label: 'Charging', color: 'warning' as const },
                  maintenance: { label: 'Maintenance', color: 'default' as const },
                  broken_down: { label: 'Broken Down', color: 'danger' as const },
                };
                const c = configs[v.status];
                return <Badge variant={c.color}>{c.label}</Badge>;
              }},
              { key: 'currentBattery', header: 'Battery', className: 'text-right', render: (v: Vehicle) => (
                <span className={v.currentBattery > 60 ? 'text-green-600' : v.currentBattery > 30 ? 'text-yellow-600' : v.currentBattery > 15 ? 'text-orange-600' : 'text-red-600'}>{v.currentBattery}%</span>
              )},
              { key: 'healthScore', header: 'Health', className: 'text-right', render: (v: Vehicle) => (
                <Badge variant={v.healthScore >= 80 ? 'success' : v.healthScore >= 60 ? 'warning' : 'danger'}>{v.healthScore}</Badge>
              )},
              { key: 'predictedFailureRisk', header: 'Failure Risk', render: (v: Vehicle) => (
                <Badge variant={riskColors[v.predictedFailureRisk]}>{v.predictedFailureRisk}</Badge>
              )},
              { key: 'totalDistance', header: 'Distance (km)', className: 'text-right', render: (v: Vehicle) => v.totalDistance.toLocaleString() },
              { key: 'repairCount', header: 'Repairs', className: 'text-right' },
              { key: 'lastServiceDate', header: 'Last Service', render: (v: Vehicle) => new Date(v.lastServiceDate).toLocaleDateString() },
            ]}
            data={filteredVehicles}
            onRowClick={setSelectedVehicle}
            className="text-sm cursor-pointer hover:shadow-md transition-all duration-300"
          />
        </div>
      )}
    </Card>
  );
}

function VehicleDetailView({ vehicle, onClose, onNavigate }: { vehicle: Vehicle; onClose: () => void; onNavigate: (dir: number) => void }) {
  const getBatteryColor = (b: number) => b > 60 ? 'green' : b > 30 ? 'yellow' : b > 15 ? 'orange' : 'red';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200/60 dark:border-gray-700/60 animate-fade-in-scale w-full max-w-full lg:max-w-4xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-4">
            <button onClick={() => onNavigate(-1)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all"><ChevronLeft className="w-5 h-5" /></button>
            <div>
              <h3 className="text-lg font-semibold">{vehicle.registrationNumber}</h3>
              <p className="text-sm text-gray-500">{vehicle.model} • Hub #{vehicle.hubId.replace('hub_', '')}</p>
            </div>
            <button onClick={() => onNavigate(1)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all"><ChevronRight className="w-5 h-5" /></button>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all text-lg font-medium">×</button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MetricCard label="Health Score" value={`${vehicle.healthScore}/100`} icon={<CheckCircle className="w-4 h-4" />} />
            <MetricCard label="Battery Level" value={`${vehicle.currentBattery}%`} icon={<Battery className="w-4 h-4" />} />
            <MetricCard label="Failure Risk" value={vehicle.predictedFailureRisk} changeType={vehicle.predictedFailureRisk === 'critical' ? 'danger' : vehicle.predictedFailureRisk === 'high' ? 'warning' : 'positive'} icon={<AlertTriangle className="w-4 h-4" />} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800/60 border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-4 space-y-4">
              <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
                  <Battery className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                </span>
                Battery & Power
              </h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Current Charge</span>
                    <span className={getBatteryColor(vehicle.currentBattery) === 'green' ? 'text-green-600' : getBatteryColor(vehicle.currentBattery) === 'yellow' ? 'text-yellow-600' : 'text-red-600'}>{vehicle.currentBattery}%</span>
                  </div>
                  <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${
                        vehicle.currentBattery > 60
                          ? 'bg-gradient-to-r from-green-400 to-green-600'
                          : vehicle.currentBattery > 30
                          ? 'bg-gradient-to-r from-yellow-400 to-amber-500'
                          : vehicle.currentBattery > 15
                          ? 'bg-gradient-to-r from-orange-400 to-orange-600'
                          : 'bg-gradient-to-r from-red-400 to-red-600'
                      }`}
                      style={{ width: `${vehicle.currentBattery}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1"><span>Capacity</span><span>{vehicle.batteryCapacity} kWh</span></div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1"><span>Status</span><span className="capitalize">{vehicle.status.replace('_', ' ')}</span></div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800/60 border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-4 space-y-4">
              <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                  <Truck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </span>
                Usage & Wear
              </h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1"><span>Total Distance</span><span>{vehicle.totalDistance.toLocaleString()} km</span></div>
                  <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${
                        vehicle.totalDistance > 40000
                          ? 'bg-gradient-to-r from-red-400 to-red-600'
                          : vehicle.totalDistance > 30000
                          ? 'bg-gradient-to-r from-yellow-400 to-amber-500'
                          : 'bg-gradient-to-r from-green-400 to-green-600'
                      }`}
                      style={{ width: `${Math.min(100, (vehicle.totalDistance / 50000) * 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500">Expected life: 50,000 km</p>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1"><span>Repair Count</span><span>{vehicle.repairCount}</span></div>
                  <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${
                        vehicle.repairCount > 3
                          ? 'bg-gradient-to-r from-red-400 to-red-600'
                          : vehicle.repairCount > 1
                          ? 'bg-gradient-to-r from-yellow-400 to-amber-500'
                          : 'bg-gradient-to-r from-green-400 to-green-600'
                      }`}
                      style={{ width: `${Math.min(100, vehicle.repairCount * 20)}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1"><span>Last Service</span><span>{new Date(vehicle.lastServiceDate).toLocaleDateString()}</span></div>
                  <p className="text-xs text-gray-500">{Math.round((Date.now() - new Date(vehicle.lastServiceDate).getTime()) / (1000 * 60 * 60 * 24))} days ago</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800/60 border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-4">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center">
                <Wrench className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </span>
              Health Score Breakdown
            </h4>
            <div className="space-y-3">
              {[
                { label: 'Battery Condition (30%)', score: Math.min(100, vehicle.currentBattery * 1.2) },
                { label: 'Distance Traveled (25%)', score: Math.max(0, 100 - (vehicle.totalDistance / 50000) * 100) },
                { label: 'Repair History (25%)', score: Math.max(0, 100 - vehicle.repairCount * 15) },
                { label: 'Usage Anomalies (20%)', score: vehicle.status === 'broken_down' ? 0 : vehicle.status === 'maintenance' ? 40 : vehicle.status === 'charging' ? 85 : 95 },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">{item.label}</span>
                  <div className="w-full max-w-[256px]">
                    <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${
                          item.score >= 80
                            ? 'bg-gradient-to-r from-green-400 to-green-600'
                            : item.score >= 60
                            ? 'bg-gradient-to-r from-yellow-400 to-amber-500'
                            : 'bg-gradient-to-r from-red-400 to-red-600'
                        }`}
                        style={{ width: `${item.score}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 mt-0.5 block text-right">{Math.round(item.score)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800/60 border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-4">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center">
                <Wrench className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </span>
              Predictive Maintenance
            </h4>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {vehicle.predictedFailureRisk === 'critical'
                  ? '⚠️ CRITICAL: Immediate maintenance required. High probability of breakdown within 48 hours.'
                  : vehicle.predictedFailureRisk === 'high'
                  ? '⚠️ HIGH RISK: Schedule preventive maintenance within 7 days. Monitor battery and motor performance closely.'
                  : vehicle.predictedFailureRisk === 'medium'
                  ? '⚠️ MEDIUM RISK: Plan maintenance within 30 days. Consider during next scheduled service.'
                  : '✅ LOW RISK: Vehicle operating within normal parameters. Continue standard maintenance schedule.'}
              </p>
              <div className="mt-3 flex flex-wrap gap-3">
                <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm shadow-sm hover:shadow-md transition-all font-medium">Schedule Maintenance</button>
                <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">View Service History</button>
                <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">Order Parts</button>
              </div>
            </div>
          </div>

          {vehicle.assignedRiderId && (
            <div className="bg-white dark:bg-gray-800/60 border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-4">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/40 flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-green-600 dark:text-green-400" />
                </span>
                Current Assignment
              </h4>
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                <p className="text-sm"><strong>Assigned Rider:</strong> {vehicle.assignedRiderId.replace(`rider_${vehicle.hubId}_`, 'Rider #')}</p>
                <p className="text-sm"><strong>Status:</strong> In Use</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}