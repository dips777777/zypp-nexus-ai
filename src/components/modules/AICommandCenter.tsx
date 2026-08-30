"use client";

import { useState, useEffect } from 'react';
import { MapPin, AlertTriangle, Truck, Battery, Activity, ChevronDown, ChevronUp, Signal } from 'lucide-react';
import { Card, Badge, MetricCard, Table } from '@/components/ui/Card';
import { api } from '@/lib/mock-data';
import type { Hub, Alert } from '@/types';

export function AICommandCenter() {
  const [hubs, setHubs] = useState<Hub[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [selectedHub, setSelectedHub] = useState<string | null>(null);
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
            <div key={i} className="h-16 bg-gray-100 dark:bg-gray-700/50 rounded-xl animate-pulse" />
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
          const autonomyColor = hub.autonomyScore >= 85 ? 'text-emerald-600 dark:text-emerald-400' : hub.autonomyScore >= 70 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400';
          
          return (
            <div key={hub.id} className="border border-gray-200/60 dark:border-gray-700/60 rounded-xl overflow-hidden hover:shadow-md transition-all duration-300 bg-white dark:bg-gray-800/60">
              <button
                onClick={() => toggleHub(hub.id)}
                className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-gray-50/80 dark:hover:bg-gray-700/30 transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 ${getStatusDot(hub.status)}`} />
                  </div>
                  <div className="text-left">
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{hub.name}</h4>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{hub.city} &bull; {hub.fleetSize} vehicles &bull; {hub.riderCount} riders</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={getStatusColor(hub.status)}>{hub.status}</Badge>
                  <span className={`text-sm font-bold ${autonomyColor}`}>{hub.autonomyScore}%</span>
                  <Badge variant={hubCritical > 0 ? 'danger' : hubWarnings > 0 ? 'warning' : 'success'}>
                    {hubCritical > 0 ? `${hubCritical} Critical` : hubWarnings > 0 ? `${hubWarnings} Warnings` : 'All Clear'}
                  </Badge>
                  <div className="w-6 h-6 rounded-lg bg-gray-100 dark:bg-gray-700/50 flex items-center justify-center">
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-gray-400" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-400" />}
                  </div>
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-gray-100 dark:border-gray-700/50 p-4 bg-gray-50/50 dark:bg-gray-800/30">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                    <MetricCard label="Deliveries Today" value={hub.todayDeliveries.toLocaleString()} />
                    <MetricCard label="Revenue" value={`₹${(hub.todayRevenue / 100000).toFixed(1)}L`} />
                    <MetricCard label="Margin" value={`₹${((hub.todayRevenue - hub.todayCosts) / 100000).toFixed(1)}L`} />
                  </div>
                  
                  {hubAlerts.length > 0 && (
                    <div>
                      <h5 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm flex items-center gap-2">
                        <Signal className="w-4 h-4 text-gray-400" />
                        Active Alerts
                      </h5>
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
