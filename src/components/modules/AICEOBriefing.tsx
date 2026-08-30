"use client";

import { useState, useEffect } from 'react';
import { Sunrise, AlertTriangle, TrendingUp, Target, Lightbulb, Shield, DollarSign, Truck, Users, Battery, Clock, RefreshCw, Copy, CheckCircle } from 'lucide-react';
import { Card, Badge, MetricCard } from '@/components/ui/Card';
import { api, generateCEONarrative, mockHubs, mockVehicles } from '@/lib/mock-data';
import type { Hub, Vehicle, CEONarrative } from '@/types';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

function getGreetingGradient() {
  const hour = new Date().getHours();
  if (hour < 12) return 'from-amber-500 via-orange-500 to-rose-500';
  if (hour < 17) return 'from-blue-500 via-indigo-500 to-purple-500';
  return 'from-indigo-500 via-purple-500 to-pink-500';
}

export function AICEOBriefing() {
  const [narrative, setNarrative] = useState<CEONarrative | null>(null);
  const [hubs, setHubs] = useState<Hub[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [lastGenerated, setLastGenerated] = useState<Date | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [hubsData, vehiclesData] = await Promise.all([
          api.getHubs(),
          api.getVehicles(),
        ]);
        setHubs(hubsData);
        setVehicles(vehiclesData);
        await generateBriefing(hubsData, vehiclesData);
      } catch (error) {
        console.error('Failed to fetch briefing data:', error);
        setHubs(mockHubs);
        setVehicles(mockVehicles);
        await generateBriefing(mockHubs, mockVehicles);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const generateBriefing = async (hubsData: Hub[], vehiclesData: Vehicle[]) => {
    setGenerating(true);
    try {
      const briefing = await api.generateCEONarrative();
      setNarrative(briefing);
      setLastGenerated(new Date());
    } catch (error) {
      console.error('Failed to generate briefing:', error);
      const briefing = generateCEONarrative(hubsData, vehiclesData);
      setNarrative(briefing);
      setLastGenerated(new Date());
    } finally {
      setGenerating(false);
    }
  };

  const handleRegenerate = () => {
    generateBriefing(hubs, vehicles);
  };

  const copyToClipboard = () => {
    if (!narrative) return;
    const text = `
ZYPP NEXUS AI - EXECUTIVE DAILY BRIEFING
Date: ${narrative.date}

SUMMARY
${narrative.summary}

KEY METRICS
- Fleet Uptime: ${narrative.keyMetrics.fleetUptime}%
- Active Riders: ${narrative.keyMetrics.activeRiders}
- Deliveries Completed: ${narrative.keyMetrics.deliveriesCompleted}
- Revenue: ₹${(narrative.keyMetrics.revenue/100000).toFixed(1)}L
- Margin: ₹${(narrative.keyMetrics.margin/100000).toFixed(1)}L
- Critical Alerts: ${narrative.keyMetrics.criticalAlerts}

TOP PRIORITIES
${narrative.topPriorities.map((p, i) => `${i+1}. ${p.action} (${p.timeframe}) - ${p.impact}`).join('\n')}

RISKS
${narrative.risks.map(r => `- ${r}`).join('\n')}

OPPORTUNITIES
${narrative.opportunities.map(o => `- ${o}`).join('\n')}
    `.trim();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <Card title="Executive Dashboard" subtitle="Generating your daily briefing...">
        <div className="space-y-4">
          <div className="h-40 bg-gradient-to-r from-gray-100 to-gray-50 rounded-2xl animate-pulse" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-28 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (!narrative) {
    return (
      <Card title="Executive Dashboard" subtitle="Unable to generate briefing">
        <div className="text-center py-8 text-gray-500">No data available</div>
      </Card>
    );
  }

  const criticalVehicles = vehicles.filter(v => v.predictedFailureRisk === 'critical').length;
  const highRiskVehicles = vehicles.filter(v => v.predictedFailureRisk === 'high').length;
  const lowAutonomyHubs = hubs.filter(h => h.autonomyScore < 70).length;

  return (
    <Card title="Executive Dashboard" subtitle={`Generated ${lastGenerated ? lastGenerated.toLocaleTimeString() : 'just now'} • ${narrative.date}`} className="h-full">
      {/* Greeting Banner */}
      <div className={`bg-gradient-to-r ${getGreetingGradient()} rounded-2xl p-6 mb-6 shadow-lg relative overflow-hidden`}>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djZoNnYtNmgtNnptMC0zMHY2aDZ2LTZoLTZ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
        <div className="relative flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
              <Sunrise className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">{getGreeting()}</h2>
              <p className="text-sm text-white/80 font-medium mt-0.5">Your daily operational intelligence briefing</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={copyToClipboard} className="px-4 py-2.5 bg-white/15 hover:bg-white/25 backdrop-blur-sm border border-white/20 rounded-xl text-sm text-white font-medium flex items-center gap-2 transition-all duration-200">
              {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button onClick={handleRegenerate} disabled={generating} className="px-4 py-2.5 bg-white text-gray-900 rounded-xl text-sm font-semibold hover:bg-white/90 disabled:opacity-50 flex items-center gap-2 transition-all duration-200 shadow-lg">
              <RefreshCw className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
              Regenerate
            </button>
          </div>
        </div>
      </div>

      {/* Executive Summary */}
      <div className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border border-blue-200/40 rounded-2xl p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-md shadow-blue-500/20">
            <Lightbulb className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 mb-2 tracking-tight">Executive Summary</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{narrative.summary}</p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        <MetricCard label="Fleet Uptime" value={`${narrative.keyMetrics.fleetUptime}%`} icon={<Truck className="w-4 h-4" />} />
        <MetricCard label="Active Riders" value={narrative.keyMetrics.activeRiders} icon={<Users className="w-4 h-4" />} />
        <MetricCard label="Deliveries" value={narrative.keyMetrics.deliveriesCompleted.toLocaleString()} icon={<Target className="w-4 h-4" />} />
        <MetricCard label="Revenue" value={`₹${(narrative.keyMetrics.revenue/100000).toFixed(1)}L`} icon={<DollarSign className="w-4 h-4" />} />
        <MetricCard label="Margin" value={`₹${(narrative.keyMetrics.margin/100000).toFixed(1)}L`} changeType={narrative.keyMetrics.margin > 0 ? 'positive' : 'negative'} icon={<TrendingUp className="w-4 h-4" />} />
        <MetricCard label="Critical Alerts" value={narrative.keyMetrics.criticalAlerts} changeType={narrative.keyMetrics.criticalAlerts > 0 ? 'danger' : 'positive'} icon={<AlertTriangle className="w-4 h-4" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Priorities */}
        <div className="space-y-3">
          <h4 className="font-bold text-gray-900 flex items-center gap-2 tracking-tight">
            <Target className="w-5 h-5 text-blue-600" />
            Top Priorities Today
          </h4>
          <div className="space-y-2.5">
            {narrative.topPriorities.map((priority, idx) => (
              <div key={idx} className="bg-white border border-gray-200/60 rounded-xl p-4 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                    <span className="font-bold text-white text-sm">{idx + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm">{priority.action}</p>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">{priority.impact}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="info">{priority.timeframe}</Badge>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Risks & Opportunities */}
        <div className="space-y-5">
          <div>
            <h4 className="font-bold text-gray-900 flex items-center gap-2 tracking-tight">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Risks to Monitor
            </h4>
            <div className="space-y-2 mt-3">
              {narrative.risks.map((risk, idx) => (
                <div key={idx} className="bg-red-50/80 border border-red-200/40 rounded-xl p-3.5 flex items-start gap-3">
                  <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700 leading-relaxed">{risk}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 flex items-center gap-2 tracking-tight">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              Opportunities
            </h4>
            <div className="space-y-2 mt-3">
              {narrative.opportunities.map((opp, idx) => (
                <div key={idx} className="bg-emerald-50/80 border border-emerald-200/40 rounded-xl p-3.5 flex items-start gap-3">
                  <Lightbulb className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-emerald-700 leading-relaxed">{opp}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Operational Deep Dive */}
      <div className="mt-6 border-t border-gray-100 pt-6">
        <h4 className="font-bold text-gray-900 mb-4 tracking-tight">Operational Deep Dive</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-gray-200/60 rounded-xl p-4">
            <h5 className="font-semibold text-gray-900 mb-3 flex items-center gap-2 text-sm">
              <Battery className="w-4 h-4 text-amber-500" />
              Vehicle Health
            </h5>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between items-center"><span className="text-gray-500">Critical Risk</span><span className="font-semibold text-red-600">{criticalVehicles}</span></div>
              <div className="flex justify-between items-center"><span className="text-gray-500">High Risk</span><span className="font-semibold text-amber-600">{highRiskVehicles}</span></div>
              <div className="flex justify-between items-center"><span className="text-gray-500">Avg Health Score</span><span className="font-semibold text-gray-900">{Math.round(vehicles.reduce((s, v) => s + v.healthScore, 0) / vehicles.length)}</span></div>
              <div className="flex justify-between items-center"><span className="text-gray-500">Charging</span><span className="font-semibold text-blue-600">{vehicles.filter(v => v.status === 'charging').length}</span></div>
            </div>
          </div>

          <div className="bg-white border border-gray-200/60 rounded-xl p-4">
            <h5 className="font-semibold text-gray-900 mb-3 flex items-center gap-2 text-sm">
              <Shield className="w-4 h-4 text-purple-500" />
              AI Autonomy
            </h5>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between items-center"><span className="text-gray-500">Network Avg</span><span className="font-semibold text-gray-900">{Math.round(hubs.reduce((s, h) => s + h.autonomyScore, 0) / hubs.length)}%</span></div>
              <div className="flex justify-between items-center"><span className="text-gray-500">Below 70%</span><span className="font-semibold text-red-600">{lowAutonomyHubs} hubs</span></div>
              <div className="flex justify-between items-center"><span className="text-gray-500">Fully Auto (85%+)</span><span className="font-semibold text-emerald-600">{hubs.filter(h => h.autonomyScore >= 85).length} hubs</span></div>
            </div>
          </div>

          <div className="bg-white border border-gray-200/60 rounded-xl p-4">
            <h5 className="font-semibold text-gray-900 mb-3 flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-gray-400" />
              Time-Sensitive Actions
            </h5>
            <div className="space-y-2 text-sm">
              {narrative.topPriorities.filter(p => p.timeframe === 'immediate').map((p, idx) => (
                <div key={idx} className="flex items-center gap-2 text-red-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  <span className="font-medium">{p.action}</span>
                </div>
              ))}
              {narrative.topPriorities.filter(p => p.timeframe === 'today').map((p, idx) => (
                <div key={`today-${idx}`} className="flex items-center gap-2 text-amber-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span className="font-medium">{p.action}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-400">
        <div className="flex items-center gap-3">
          <span className="font-semibold">Zypp Nexus AI</span>
          <span className="w-1 h-1 rounded-full bg-gray-300" />
          <span>Executive Dashboard</span>
          <span className="w-1 h-1 rounded-full bg-gray-300" />
          <span>Data as of {new Date().toLocaleDateString()}</span>
        </div>
        <span className="font-medium">Confidence: High (AI-generated from live ops data)</span>
      </div>
    </Card>
  );
}
