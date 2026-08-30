"use client";

import { useState, useEffect, useMemo } from 'react';
import { Bot, Zap, TrendingUp, Wrench, MapPin, DollarSign, Truck, Battery, Search, Loader2, CheckCircle, Clock, AlertTriangle, Radio } from 'lucide-react';
import { Card, Badge, MetricCard, Table, ProgressBar } from '@/components/ui/Card';
import { api, mockAgentActivity } from '@/lib/mock-data';
import type { AgentActivity } from '@/types';

const AGENT_CONFIG = {
  fleet_optimizer: { label: 'Fleet Optimizer', icon: Truck, color: 'blue', description: 'Rebalances vehicles across zones' },
  maintenance_predictor: { label: 'Maintenance Predictor', icon: Wrench, color: 'orange', description: 'Predicts failures before breakdown' },
  demand_forecaster: { label: 'Demand Forecaster', icon: TrendingUp, color: 'green', description: 'Predicts delivery demand by zone' },
  route_optimizer: { label: 'Route Optimizer', icon: MapPin, color: 'purple', description: 'Optimizes delivery routes in real-time' },
  pricing_engine: { label: 'Pricing Engine', icon: DollarSign, color: 'yellow', description: 'Dynamic pricing for peak hours' },
  rider_matcher: { label: 'Rider Matcher', icon: Zap, color: 'pink', description: 'Matches orders to optimal riders' },
  charging_scheduler: { label: 'Charging Scheduler', icon: Battery, color: 'cyan', description: 'Schedules off-peak charging' },
  expansion_scout: { label: 'Expansion Scout', icon: Bot, color: 'indigo', description: 'Scores new city opportunities' },
} as const;

const COLOR_MAP: Record<string, { bg: string; text: string; border: string; gradient: string; iconBg: string }> = {
  blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200/40', gradient: 'from-blue-500/10 to-blue-600/5', iconBg: 'bg-blue-100' },
  orange: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200/40', gradient: 'from-orange-500/10 to-orange-600/5', iconBg: 'bg-orange-100' },
  green: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200/40', gradient: 'from-green-500/10 to-green-600/5', iconBg: 'bg-green-100' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200/40', gradient: 'from-purple-500/10 to-purple-600/5', iconBg: 'bg-purple-100' },
  yellow: { bg: 'bg-yellow-50', text: 'text-yellow-600', border: 'border-yellow-200/40', gradient: 'from-yellow-500/10 to-yellow-600/5', iconBg: 'bg-yellow-100' },
  pink: { bg: 'bg-pink-50', text: 'text-pink-600', border: 'border-pink-200/40', gradient: 'from-pink-500/10 to-pink-600/5', iconBg: 'bg-pink-100' },
  cyan: { bg: 'bg-cyan-50', text: 'text-cyan-600', border: 'border-cyan-200/40', gradient: 'from-cyan-500/10 to-cyan-600/5', iconBg: 'bg-cyan-100' },
  indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-200/40', gradient: 'from-indigo-500/10 to-indigo-600/5', iconBg: 'bg-indigo-100' },
};

const IMPACT_STYLES: Record<string, string> = {
  critical: 'border-l-4 border-l-red-500 bg-red-50/30',
  high: 'border-l-4 border-l-amber-500 bg-amber-50/30',
  medium: 'border-l-4 border-l-blue-500 bg-blue-50/30',
  low: 'border-l-4 border-l-gray-300',
};

export function AIAgentActivityCenter() {
  const [activities, setActivities] = useState<AgentActivity[]>([]);
  const [agentFilter, setAgentFilter] = useState<string>('all');
  const [impactFilter, setImpactFilter] = useState<string>('all');
  const [timeFilter, setTimeFilter] = useState<'1h' | '6h' | '24h' | '7d'>('24h');
  const [searchQuery, setSearchQuery] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const hoursBack = timeFilter === '1h' ? 1 : timeFilter === '6h' ? 6 : timeFilter === '24h' ? 24 : 168;
        const data = await api.getAgentActivity(hoursBack);
        setActivities(data);
        setLastUpdated(new Date());
      } catch (error) {
        console.error('Failed to fetch agent activity:', error);
        setActivities(mockAgentActivity);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [timeFilter]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      setLastUpdated(new Date());
    }, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const filteredActivities = useMemo(() => {
    return activities.filter(a => {
      if (agentFilter !== 'all' && a.agentType !== agentFilter) return false;
      if (impactFilter !== 'all' && a.impact !== impactFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!a.action.toLowerCase().includes(q) &&
            !a.target.toLowerCase().includes(q) &&
            !a.details.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [activities, agentFilter, impactFilter, searchQuery]);

  const agentStats = useMemo(() => {
    const stats: Record<string, { count: number; automated: number; highImpact: number }> = {};
    activities.forEach(a => {
      if (!stats[a.agentType]) stats[a.agentType] = { count: 0, automated: 0, highImpact: 0 };
      stats[a.agentType].count++;
      if (a.automated) stats[a.agentType].automated++;
      if (a.impact === 'high') stats[a.agentType].highImpact++;
    });
    return stats;
  }, [activities]);

  const totalActions = activities.length;
  const automatedActions = activities.filter(a => a.automated).length;
  const highImpactActions = activities.filter(a => a.impact === 'high').length;
  const automationRate = totalActions > 0 ? Math.round((automatedActions / totalActions) * 100) : 0;

  if (loading) {
    return (
      <Card title="AI Agent Activity Center" subtitle="Live log of autonomous agent actions">
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card title="AI Agent Activity Center" subtitle={`Live agent log • ${automationRate}% automated • Updated: ${lastUpdated.toLocaleTimeString()}`} className="h-full">
      <div className="flex flex-wrap gap-4 items-center mb-4">
        <div className="flex-1 w-full sm:min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search actions, targets, details..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl bg-white text-sm"
          />
        </div>
        <select value={agentFilter} onChange={e => setAgentFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-xl bg-white text-sm w-full sm:min-w-[160px]">
          <option value="all">All Agents</option>
          {Object.entries(AGENT_CONFIG).map(([key, config]) => (
            <option key={key} value={key}>{config.label} ({agentStats[key]?.count || 0})</option>
          ))}
        </select>
        <select value={impactFilter} onChange={e => setImpactFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-xl bg-white text-sm">
          <option value="all">All Impact</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <select value={timeFilter} onChange={e => setTimeFilter(e.target.value as any)} className="px-3 py-2 border border-gray-300 rounded-xl bg-white text-sm">
          <option value="1h">Last Hour</option>
          <option value="6h">Last 6 Hours</option>
          <option value="24h">Last 24 Hours</option>
          <option value="7d">Last 7 Days</option>
        </select>
        <button
          type="button"
          role="switch"
          aria-checked={autoRefresh}
          onClick={() => setAutoRefresh(!autoRefresh)}
          className="flex items-center gap-2 text-sm text-gray-700"
        >
          <span className="relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2:ring-offset-gray-800"
            style={{ backgroundColor: autoRefresh ? '#3b82f6' : '#d1d5db' }}>
            <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${autoRefresh ? 'translate-x-5' : 'translate-x-0'}`} />
          </span>
          Auto-refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <MetricCard label="Total Actions" value={totalActions} icon={<Bot className="w-4 h-4" />} />
        <MetricCard label="Automated" value={automatedActions} change={`${automationRate}%`} changeType="positive" icon={<CheckCircle className="w-4 h-4" />} />
        <MetricCard label="High Impact" value={highImpactActions} changeType={highImpactActions > 0 ? 'warning' : 'positive'} icon={<AlertTriangle className="w-4 h-4" />} />
        <MetricCard label="Active Agents" value={Object.keys(agentStats).length} icon={<Zap className="w-4 h-4" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Agent Status Cards */}
        <div className="lg:col-span-1 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-md shadow-violet-500/20">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <h4 className="font-semibold text-gray-900">Agent Status</h4>
          </div>
          <div className="space-y-2">
            {Object.entries(AGENT_CONFIG).map(([key, config]) => {
              const stat = agentStats[key] || { count: 0, automated: 0, highImpact: 0 };
              const Icon = config.icon;
              const colors = COLOR_MAP[config.color] || COLOR_MAP.blue;
              return (
                <div key={key} className={`bg-gradient-to-br ${colors.gradient} border ${colors.border} rounded-xl p-3 hover:shadow-md transition-all duration-200`}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-8 h-8 rounded-xl ${colors.iconBg} flex items-center justify-center shadow-sm`}>
                      <Icon className={`w-4 h-4 ${colors.text}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{config.label}</p>
                      <p className="text-xs text-gray-500 truncate">{config.description}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center">
                      <p className="font-bold text-gray-900">{stat.count}</p>
                      <p className="text-gray-500">Actions</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-blue-600">{stat.automated}</p>
                      <p className="text-gray-500">Auto</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-red-600">{stat.highImpact}</p>
                      <p className="text-gray-500">High</p>
                    </div>
                  </div>
                  <ProgressBar value={stat.count > 0 ? (stat.automated / stat.count) * 100 : 0} showLabel={false} color="blue" className="mt-2" />
                </div>
              );
            })}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="lg:col-span-2 space-y-2 max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-md shadow-blue-500/20">
              <Radio className="w-4 h-4 text-white" />
            </div>
            <h4 className="font-semibold text-gray-900">Recent Activity</h4>
            <span className="ml-auto flex items-center gap-1.5 text-xs text-gray-500">
              <span className="relative flex h-2 w-2">
                <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              Live
            </span>
          </div>
          <div className="space-y-2 stagger-children">
            {filteredActivities.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No activity matches filters</div>
            ) : (
              filteredActivities.map((activity, idx) => {
                const config = AGENT_CONFIG[activity.agentType];
                const Icon = config.icon;
                const colors = COLOR_MAP[config.color] || COLOR_MAP.blue;
                const timeAgo = Math.round((Date.now() - new Date(activity.timestamp).getTime()) / 60000);
                const impactStyle = IMPACT_STYLES[activity.impact] || IMPACT_STYLES.low;

                return (
                  <div key={idx} className={`${impactStyle} rounded-xl p-4 hover:shadow-md transition-all duration-200`}>
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-xl ${colors.iconBg} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                        <Icon className={`w-5 h-5 ${colors.text}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-gray-900">{config.label}</p>
                          <span className="text-xs text-gray-500">{timeAgo}m ago</span>
                        </div>
                        <p className="text-sm text-gray-700 mt-1">{activity.action}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {activity.target}
                          </span>
                          <Badge variant={activity.impact === 'high' ? 'danger' : activity.impact === 'medium' ? 'warning' : 'info'} className="text-xs">
                            {activity.impact} impact
                          </Badge>
                          <Badge variant={activity.automated ? 'success' : 'default'} className="text-xs">
                            {activity.automated ? 'Automated' : 'Manual'}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">{activity.details}</p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
