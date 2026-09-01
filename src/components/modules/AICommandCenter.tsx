"use client";

import { useState, useEffect } from 'react';
import { MapPin, AlertTriangle, Truck, Battery, Activity, ChevronDown, ChevronUp, Signal } from 'lucide-react';
import { Card, Badge, MetricCard, Table } from '@/components/ui/Card';
import { api } from '@/lib/mock-data';
import type { Hub, Alert } from '@/types';

export function AICommandCenter() {
  const [hubs, setHubs] = useState<Hub[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [expandedHubs, setExpandedHubs] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [hubsData, alertsData] = await Promise.all([
          api.getHubs(),
          api.getAlerts(),
        ]);
        setHubs(hubsData);
        setAlerts(alertsData);
        setLastUpdated(new Date());
      } catch (error) {
        console.error('Failed to fetch command center data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const totalFleet = hubs.reduce((sum, h) => sum + h.fleetSize, 0);
  const totalRiders = hubs.reduce((sum, h) => sum + h.riderCount, 0);
  const totalDeliveries = hubs.reduce((sum, h) => sum + h.todayDeliveries, 0);
  const criticalAlerts = alerts.filter(a => a.severity === 'critical').length;
  const warningAlerts = alerts.filter(a => a.severity === 'warning').length;

  const toggleHub = (hubId: string) => {
    setExpandedHubs(prev => {
      const next = new Set(prev);
      if (next.has(hubId)) next.delete(hubId);
      else next.add(hubId);
      return next;
    });
  };

  const getStatusColor = (status: Hub['status']) => {
    switch (status) {
      case 'active': return 'success';
      case 'maintenance': return 'warning';
      case 'offline': return 'danger';
    }
  };

  const getStatusDot = (status: Hub['status']) => {
    switch (status) {
      case 'active': return 'bg-emerald-500';
      case 'maintenance': return 'bg-amber-500';
      case 'offline': return 'bg-red-500';
    }
  };

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'battery_low': return <Battery className="w-4 h-4" />;
      case 'vehicle_breakdown': return <Truck className="w-4 h-4" />;
      case 'high_demand': return <Activity className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <Card title="AI Command Center" subtitle="Loading hub network...">
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card title="AI Command Center" subtitle={`Last updated: ${lastUpdated.toLocaleTimeString()}`} className="h-full">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6 stagger-children">
        <MetricCard label="Total Hubs" value={hubs.length} icon={<MapPin className="w-4 h-4" />} />
        <MetricCard label="Total Fleet" value={totalFleet} icon={<Truck className="w-4 h-4" />} />
        <MetricCard label="Active Riders" value={totalRiders} icon={<Activity className="w-4 h-4" />} />
        <MetricCard label="Deliveries Today" value={totalDeliveries.toLocaleString()} icon={<MapPin className="w-4 h-4" />} />
        <MetricCard 
          label="Critical Alerts" 
          value={criticalAlerts} 
          change={warningAlerts > 0 ? `${warningAlerts} warnings` : 'All clear'}
          changeType={criticalAlerts > 0 ? 'danger' : warningAlerts > 0 ? 'warning' : 'positive'}
          icon={<AlertTriangle className="w-4 h-4" />}
        />
      </div>

      <div className="space-y-2.5">
        {hubs.map(hub => {
          const hubAlerts = alerts.filter(a => a.hubId === hub.id);
          const hubCritical = hubAlerts.filter(a => a.severity === 'critical').length;
          const hubWarnings = hubAlerts.filter(a => a.severity === 'warning').length;
          const isExpanded = expandedHubs.has(hub.id);
          const autonomyColor = hub.autonomyScore >= 85 ? 'text-emerald-600' : hub.autonomyScore >= 70 ? 'text-blue-600' : 'text-red-600';
          
          return (
            <div key={hub.id} className="border border-gray-200/60 rounded-xl overflow-hidden hover:shadow-md transition-all duration-300 bg-white">
              <button
                onClick={() => toggleHub(hub.id)}
                className="w-full px-3 py-3.5 transition-colors hover:bg-gray-50 sm:px-4"
              >
                <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-center gap-3.5">
                    <div className="relative">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                        <MapPin className="h-5 w-5 text-blue-600" />
                      </div>
                      <span className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white ${getStatusDot(hub.status)}`} />
                    </div>
                    <div className="min-w-0 text-left">
                      <h4 className="truncate text-sm font-semibold text-gray-900">{hub.name}</h4>
                      <p className="text-xs text-gray-400">{hub.city} &bull; {hub.fleetSize} vehicles &bull; {hub.riderCount} riders</p>
                    </div>
                  </div>
                  <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
                    <Badge variant={getStatusColor(hub.status)}>{hub.status}</Badge>
                    <span className={`text-sm font-bold ${autonomyColor}`}>{hub.autonomyScore}%</span>
                    <Badge variant={hubCritical > 0 ? 'danger' : hubWarnings > 0 ? 'warning' : 'success'}>
                      {hubCritical > 0 ? `${hubCritical} Critical` : hubWarnings > 0 ? `${hubWarnings} Warnings` : 'All Clear'}
                    </Badge>
                    <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gray-100">
                      {isExpanded ? <ChevronUp className="h-3.5 w-3.5 text-gray-400" /> : <ChevronDown className="h-3.5 w-3.5 text-gray-400" />}
                    </div>
                  </div>
                </div>
              </button>
              {isExpanded && (
                <div className="border-t border-gray-100 p-4 bg-gray-50/50">
                  <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <MetricCard label="Deliveries Today" value={hub.todayDeliveries.toLocaleString()} />
                    <MetricCard label="Revenue" value={`₹${(hub.todayRevenue / 100000).toFixed(1)}L`} />
                    <MetricCard label="Margin" value={`₹${((hub.todayRevenue - hub.todayCosts) / 100000).toFixed(1)}L`} />
                  </div>
                  
                  {hubAlerts.length > 0 && (
                    <div>
                      <h5 className="font-semibold text-gray-900 mb-2 text-sm flex items-center gap-2">
                        <Signal className="w-4 h-4 text-gray-400" />
                        Active Alerts
                      </h5>
                      <div className="overflow-x-auto">
                        <Table
                          columns={[
                            { key: 'type', header: 'Type', render: (a: Alert) => (
                              <span className="flex items-center gap-2">{getAlertIcon(a.type)} {a.type.replace('_', ' ')}</span>
                            )},
                            { key: 'message', header: 'Message' },
                            { key: 'severity', header: 'Severity', render: (a: Alert) => <Badge variant={a.severity === 'critical' ? 'danger' : a.severity === 'warning' ? 'warning' : 'info'}>{a.severity}</Badge> },
                            { key: 'timestamp', header: 'Time', render: (a: Alert) => new Date(a.timestamp).toLocaleTimeString() },
                            { key: 'action', header: 'Action', render: (a: Alert) => a.suggestedAction || '-' },
                          ]}
                          data={hubAlerts}
                          className="text-sm"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
