"use client";

import { useState, useEffect } from 'react';
import { AlertTriangle, Wrench, Battery, Truck, Calendar, Clock, Filter, Download, ArrowUpRight } from 'lucide-react';
import { Card, Badge, MetricCard, ProgressBar, Table } from '@/components/ui/Card';
import { api } from '@/lib/mock-data';
import type { Vehicle, Alert } from '@/types';

export function PredictiveMaintenanceEngine() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [timeHorizon, setTimeHorizon] = useState<'48h' | '7d' | '30d'>('7d');
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vData, aData] = await Promise.all([
          api.getVehicles(),
          api.getAlerts(),
        ]);
        setVehicles(vData);
        setAlerts(aData);
        setLastUpdated(new Date());
      } catch (error) {
        console.error('Failed to fetch maintenance data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  const maintenanceAlerts = alerts.filter(a => 
    a.type === 'maintenance_due' || a.type === 'vehicle_breakdown' || a.type === 'battery_low'
  );

  const criticalVehicles = vehicles.filter(v => v.predictedFailureRisk === 'critical');
  const highRiskVehicles = vehicles.filter(v => v.predictedFailureRisk === 'high');
  const dueForService = vehicles.filter(v => v.totalDistance > 35000 && v.status !== 'maintenance');
  const overdueService = vehicles.filter(v => v.totalDistance > 45000);

  const getRiskColor = (risk: Vehicle['predictedFailureRisk']) => {
    const colors: Record<Vehicle['predictedFailureRisk'], 'success' | 'warning' | 'danger' | 'info'> = {
      critical: 'danger',
      high: 'warning',
      medium: 'info',
      low: 'success',
    };
    return colors[risk];
  };

  if (loading) {
    return (
      <Card title="Predictive Maintenance Engine" subtitle="Loading predictions...">
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card title="Predictive Maintenance Engine" subtitle={`AI-powered failure prediction • Last updated: ${lastUpdated.toLocaleTimeString()}`} className="h-full">
      <div className="flex flex-wrap gap-4 items-center mb-4">
        <div className="flex gap-2">
          {(['48h', '7d', '30d'] as const).map(h => (
            <button
              key={h}
              onClick={() => setTimeHorizon(h)}
              className={`px-3 py-1.5 text-sm font-medium transition-all ${
                timeHorizon === h
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-md'
                  : 'bg-gray-100 rounded-xl hover:bg-gray-200:bg-gray-700 text-gray-700'
              }`}
            >
              {h}
            </button>
          ))}
        </div>
        <select value={riskFilter} onChange={e => setRiskFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-xl bg-white text-sm ml-auto">
          <option value="all">All Risk Levels</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
        <MetricCard label="Critical Risk" value={criticalVehicles.length} changeType={criticalVehicles.length > 0 ? 'danger' : 'positive'} icon={<AlertTriangle className="w-4 h-4" />} />
        <MetricCard label="High Risk" value={highRiskVehicles.length} changeType={highRiskVehicles.length > 0 ? 'warning' : 'positive'} icon={<Wrench className="w-4 h-4" />} />
        <MetricCard label="Due for Service" value={dueForService.length} icon={<Calendar className="w-4 h-4" />} />
        <MetricCard label="Overdue (>45k km)" value={overdueService.length} changeType={overdueService.length > 0 ? 'danger' : 'positive'} icon={<Clock className="w-4 h-4" />} />
        <MetricCard label="Maintenance Alerts" value={maintenanceAlerts.length} icon={<AlertTriangle className="w-4 h-4" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900">Critical & High Risk Vehicles</h4>
          <div className="space-y-2 max-h-96 overflow-y-auto stagger-children">
            {vehicles
              .filter(v => v.predictedFailureRisk === 'critical' || v.predictedFailureRisk === 'high')
              .sort((a, b) => a.healthScore - b.healthScore)
              .map(vehicle => (
                <div key={vehicle.id} className={`bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-300:border-blue-700 transition-colors ${
                  vehicle.predictedFailureRisk === 'critical'
                    ? 'border-l-4 border-l-red-500 bg-red-50/50'
                    : 'border-l-4 border-l-amber-500 bg-amber-50/50'
                }`}>
                  <div className="flex flex-wrap items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-medium text-gray-900">{vehicle.registrationNumber}</span>
                      <Badge variant={getRiskColor(vehicle.predictedFailureRisk)}>{vehicle.predictedFailureRisk}</Badge>
                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-1.5 py-0.5 rounded-full ${
                        vehicle.predictedFailureRisk === 'critical'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          vehicle.predictedFailureRisk === 'critical' ? 'bg-red-500 animate-pulse' : 'bg-amber-500'
                        }`} />
                        {vehicle.predictedFailureRisk === 'critical' ? 'Urgent' : 'Attention'}
                      </span>
                      <span className="text-sm text-gray-500">{vehicle.model}</span>
                    </div>
                    <Badge variant={vehicle.healthScore >= 80 ? 'success' : vehicle.healthScore >= 60 ? 'warning' : 'danger'}>
                      Health: {vehicle.healthScore}
                    </Badge>
                  </div>
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                    <div><span className="font-medium">Battery:</span> <span className={vehicle.currentBattery < 20 ? 'text-red-600' : ''}>{vehicle.currentBattery}%</span></div>
                    <div><span className="font-medium">Distance:</span> {vehicle.totalDistance.toLocaleString()} km</div>
                    <div><span className="font-medium">Repairs:</span> {vehicle.repairCount}</div>
                    <div><span className="font-medium">Last Service:</span> {new Date(vehicle.lastServiceDate).toLocaleDateString()}</div>
                  </div>
                   <div className="mt-3 flex flex-wrap gap-2">
                    <button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl px-4 py-1.5 text-xs font-medium hover:from-blue-700 hover:to-indigo-700 shadow-sm transition-all">Schedule Now</button>
                    <button className="px-3 py-1.5 text-xs border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100:bg-gray-700">View Details</button>
                    <button className="px-3 py-1.5 text-xs border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100:bg-gray-700">Order Parts</button>
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900">Maintenance Schedule Recommendations</h4>
          <div className="space-y-2 max-h-96 overflow-y-auto stagger-children">
            {vehicles
              .filter(v => v.totalDistance > 35000 && v.status !== 'maintenance' && v.predictedFailureRisk !== 'critical' && v.predictedFailureRisk !== 'high')
              .sort((a, b) => b.totalDistance - a.totalDistance)
              .slice(0, 20)
              .map(vehicle => (
                <div key={vehicle.id} className="bg-white border border-gray-200 rounded-xl p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-medium text-sm">{vehicle.registrationNumber}</span>
                      <span className="text-xs text-gray-500">{vehicle.model}</span>
                      <Badge variant="warning">Due Soon</Badge>
                    </div>
                    <div className="text-right text-sm">
                      <div>{vehicle.totalDistance.toLocaleString()} km</div>
                      <div className="text-gray-500">Health: {vehicle.healthScore}</div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-4 mt-4">
        <h4 className="font-semibold text-gray-900 mb-3">Maintenance Alerts</h4>
        <div className="overflow-x-auto">
          <Table
            columns={[
              { key: 'type', header: 'Type', render: (a: Alert) => a.type.replace('_', ' ') },
              { key: 'hubId', header: 'Hub', render: (a: Alert) => `Hub ${a.hubId.replace('hub_', '')}` },
              { key: 'vehicleId', header: 'Vehicle', render: (a: Alert) => a.vehicleId ? a.vehicleId.split('_').pop() : '-' },
              { key: 'severity', header: 'Severity', render: (a: Alert) => <Badge variant={a.severity === 'critical' ? 'danger' : a.severity === 'warning' ? 'warning' : 'info'}>{a.severity}</Badge> },
              { key: 'message', header: 'Message' },
              { key: 'timestamp', header: 'Time', render: (a: Alert) => new Date(a.timestamp).toLocaleString() },
              { key: 'action', header: 'Suggested Action', render: (a: Alert) => a.suggestedAction || '-' },
            ]}
            data={maintenanceAlerts}
            className="text-sm"
          />
        </div>
      </div>
    </Card>
  );
}
