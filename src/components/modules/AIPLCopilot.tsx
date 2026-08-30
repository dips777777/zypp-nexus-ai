"use client";

import { useState, useEffect, useCallback } from 'react';
import { DollarSign, CreditCard, Wallet, Calculator, Lightbulb, Target, BarChart2 } from 'lucide-react';
import { Card, MetricCard, Table } from '@/components/ui/Card';
import { api } from '@/lib/mock-data';
import type { Financials, Hub } from '@/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

export function AIPLCopilot() {
  const [hubs, setHubs] = useState<Hub[]>([]);
  const [financials, setFinancials] = useState<Record<string, Financials>>({});
  const [selectedHub, setSelectedHub] = useState<string>('hub_1');
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
  const [loading, setLoading] = useState(true);
  const [aiInsights, setAiInsights] = useState<string[]>([]);

  const generateInsights = useCallback((hubsData: Hub[], finData: Record<string, Financials>) => {
    const insights: string[] = [];
    const selectedFin = finData[selectedHub];
    const selectedHubData = hubsData.find(h => h.id === selectedHub);
    
    if (!selectedFin || !selectedHubData) return;
    
    const marginPercent = selectedFin.marginPercent;
    const revenuePerDelivery = selectedFin.revenue.total / Math.max(1, selectedHubData.todayDeliveries);
    const costPerVehicle = selectedFin.costs.total / Math.max(1, selectedHubData.fleetSize);
    
    if (marginPercent < 15) {
      insights.push(`⚠️ Margin at ${marginPercent.toFixed(1)}% is below 15% target. Primary driver: rider payouts (${(selectedFin.costs.riderPayouts / selectedFin.costs.total * 100).toFixed(0)}% of costs). Consider optimizing rider utilization or renegotiating per-delivery rates.`);
    } else {
      insights.push(`✅ Healthy margin of ${marginPercent.toFixed(1)}%. Revenue per delivery: ₹${revenuePerDelivery.toFixed(0)}. Cost per vehicle: ₹${costPerVehicle.toFixed(0)}/month.`);
    }
    
    const chargingPct = selectedFin.costs.charging / selectedFin.costs.total * 100;
    if (chargingPct > 25) {
      insights.push(`💡 Charging costs are ${chargingPct.toFixed(0)}% of total costs. Shifting 30% to off-peak (10PM-6AM) could save ~₹${Math.round(selectedFin.costs.charging * 0.3 * 0.4)}/month.`);
    }
    
    const maintenancePct = selectedFin.costs.maintenance / selectedFin.costs.total * 100;
    if (maintenancePct > 12) {
      insights.push(`� Maintenance at ${maintenancePct.toFixed(0)}% of costs. Predictive maintenance could reduce this by 20-30% by catching issues before breakdowns.`);
    }
    
    const utilization = selectedHubData.todayDeliveries / selectedHubData.riderCount;
    if (utilization < 7) {
      insights.push(`📉 Rider utilization at ${utilization.toFixed(1)} deliveries/day (target: 8+). Rebalancing shifts to match demand peaks (11-14h, 18-21h) could add ${Math.round((8 - utilization) * selectedHubData.riderCount)} deliveries/day = +₹${Math.round((8 - utilization) * selectedHubData.riderCount * 35 * 26)}/month.`);
    }
    
    setAiInsights(insights);
  }, [selectedHub]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const hubsData = await api.getHubs();
        setHubs(hubsData);
        
        const finData: Record<string, Financials> = {};
        for (const hub of hubsData) {
          finData[hub.id] = await api.getFinancials(hub.id, period);
        }
        setFinancials(finData);
        generateInsights(hubsData, finData);
      } catch (error) {
        console.error('Failed to fetch financial data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [period, generateInsights]);

  const hubFin = financials[selectedHub];
  const hubData = hubs.find(h => h.id === selectedHub);

  if (loading || !hubFin) {
    return (
      <Card title="AI P&L Copilot" subtitle="Loading financial data...">
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-20 rounded-xl animate-pulse bg-gray-100" />
          ))}
        </div>
      </Card>
    );
  }

  const revenueData = [
    { name: 'Delivery Fees', value: hubFin.revenue.deliveryFees },
    { name: 'Per-KM Revenue', value: hubFin.revenue.perKmRevenue },
    { name: 'Subscriptions', value: hubFin.revenue.subscriptionRevenue },
  ];

  const costData = [
    { name: 'Charging', value: hubFin.costs.charging },
    { name: 'Battery Swapping', value: hubFin.costs.batterySwapping },
    { name: 'Maintenance', value: hubFin.costs.maintenance },
    { name: 'Rider Payouts', value: hubFin.costs.riderPayouts },
    { name: 'Insurance', value: hubFin.costs.insurance },
    { name: 'Overhead', value: hubFin.costs.overhead },
  ];

  const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <Card title="AI P&L Copilot" subtitle={`${hubData?.name} • ${period.charAt(0).toUpperCase() + period.slice(1)} View`} className="h-full">
      <div className="flex flex-wrap gap-4 items-center mb-4">
        <select value={selectedHub} onChange={e => setSelectedHub(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-xl bg-white text-sm w-full sm:min-w-[200px]">
          {hubs.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
        </select>
        <div className="flex gap-2">
          {(['daily', 'weekly', 'monthly'] as const).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 text-sm rounded-xl shadow-sm transition-all ${period === p ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md hover:shadow-lg' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <MetricCard label="Total Revenue" value={`₹${(hubFin.revenue.total / 100000).toFixed(1)}L`} icon={<DollarSign className="w-4 h-4" />} />
        <MetricCard label="Total Costs" value={`₹${(hubFin.costs.total / 100000).toFixed(1)}L`} icon={<CreditCard className="w-4 h-4" />} />
        <MetricCard label="Net Margin" value={`₹${(hubFin.margin / 100000).toFixed(1)}L`} change={`${hubFin.marginPercent.toFixed(1)}%`} changeType={hubFin.marginPercent >= 15 ? 'positive' : 'warning'} icon={<Wallet className="w-4 h-4" />} />
        <MetricCard label="Margin Target" value="15%" change={hubFin.marginPercent >= 15 ? 'Achieved' : `${(15 - hubFin.marginPercent).toFixed(1)}% to go`} changeType={hubFin.marginPercent >= 15 ? 'positive' : 'warning'} icon={<Target className="w-4 h-4" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white border border-gray-200/60 rounded-xl p-4 shadow-sm animate-fade-in">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-emerald-100">
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </div>
            <h4 className="font-semibold text-gray-900">Revenue Breakdown</h4>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={revenueData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                labelLine={false}
              >
                {revenueData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: any, name: any) => [`₹${(Number(value) / 100000).toFixed(1)}L`, name]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border border-gray-200/60 rounded-xl p-4 shadow-sm animate-fade-in">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-red-100">
              <CreditCard className="w-4 h-4 text-red-600" />
            </div>
            <h4 className="font-semibold text-gray-900">Cost Breakdown</h4>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={costData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                labelLine={false}
              >
                {costData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: any, name: any) => [`₹${(Number(value) / 100000).toFixed(1)}L`, name]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-blue-100">
              <Lightbulb className="w-4 h-4 text-blue-600" />
            </div>
            <h4 className="font-semibold text-gray-900">AI Financial Insights</h4>
          </div>
          <div className="space-y-3 stagger-children">
            {aiInsights.map((insight, idx) => (
              <div key={idx} className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border border-blue-200/40 rounded-xl p-4 animate-fade-in">
                <div className="flex gap-3">
                  <div className="p-1.5 rounded-lg bg-blue-100 shrink-0 h-fit">
                    <Lightbulb className="w-3.5 h-3.5 text-blue-600" />
                  </div>
                  <p className="text-sm text-gray-700">{insight}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-gray-200/60 rounded-xl p-4 shadow-sm animate-fade-in">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-violet-100">
              <BarChart2 className="w-4 h-4 text-violet-600" />
            </div>
            <h4 className="font-semibold text-gray-900">Cost Structure Analysis</h4>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={costData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis type="number" tickFormatter={v => `₹${(v/100000).toFixed(1)}L`} tick={{ fontSize: 10 }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={140} />
              <Tooltip formatter={(value: any, name: any) => [`₹${(Number(value) / 100000).toFixed(1)}L`, name]} />
              <Bar dataKey="value" fill="#ef4444" radius={[0, 4, 4, 0]}>
                {costData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-xl bg-amber-100">
            <Calculator className="w-4 h-4 text-amber-600" />
          </div>
          <h4 className="font-semibold text-gray-900">Detailed Financials</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Revenue</h5>
            <div className="overflow-x-auto">
              <Table
                columns={[
                  { key: 'name', header: 'Item', className: 'text-xs font-semibold text-gray-500 uppercase tracking-wider' },
                  { key: 'value', header: 'Amount', className: 'text-right text-xs font-semibold text-gray-500 uppercase tracking-wider', render: (v: any) => <span className="text-emerald-600 font-medium">₹{(v/100000).toFixed(1)}L</span> },
                   { key: 'pct', header: '% of Total', className: 'text-right text-xs font-semibold text-gray-500 uppercase tracking-wider', render: (v: any) => `${(v / hubFin.revenue.total * 100).toFixed(1)}%` },
                ]}
                data={revenueData.map(d => ({ name: d.name, value: d.value, pct: d.value })) as any}
                className="text-sm"
              />
            </div>
          </div>
          <div>
            <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Costs</h5>
            <div className="overflow-x-auto">
              <Table
                columns={[
                  { key: 'name', header: 'Item', className: 'text-xs font-semibold text-gray-500 uppercase tracking-wider' },
                  { key: 'value', header: 'Amount', className: 'text-right text-xs font-semibold text-gray-500 uppercase tracking-wider', render: (v: any) => <span className="text-red-600 font-medium">₹{(v/100000).toFixed(1)}L</span> },
                   { key: 'pct', header: '% of Total', className: 'text-right text-xs font-semibold text-gray-500 uppercase tracking-wider', render: (v: any) => `${(v / hubFin.costs.total * 100).toFixed(1)}%` },
                ]}
                data={costData.map(d => ({ name: d.name, value: d.value, pct: d.value })) as any}
                className="text-sm"
              />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
