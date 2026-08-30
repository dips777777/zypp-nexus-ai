"use client";

import { useState, useEffect, useMemo } from 'react';
import { MapPin, TrendingUp, Target, Building2, Shield, Zap, DollarSign, ArrowRight, BarChart2, Globe, Truck } from 'lucide-react';
import { Card, Badge, MetricCard, ProgressBar, Table } from '@/components/ui/Card';
import { api, mockCityExpansionScores } from '@/lib/mock-data';
import type { CityExpansionScore } from '@/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LineChart, Line } from 'recharts';
import { ExpansionGlobe } from './ExpansionGlobe';

export function ExpansionOracle() {
  const [cities, setCities] = useState<CityExpansionScore[]>([]);
  const [selectedCity, setSelectedCity] = useState<CityExpansionScore | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'overallScore', direction: 'desc' });
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await api.getCityExpansionScores();
        setCities(data);
        setLastUpdated(new Date());
      } catch (error) {
        console.error('Failed to fetch expansion data:', error);
        setCities(mockCityExpansionScores);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const sortedCities = useMemo(() => {
    return [...cities].sort((a, b) => {
      const aVal = a[sortConfig.key as keyof CityExpansionScore] as number;
      const bVal = b[sortConfig.key as keyof CityExpansionScore] as number;
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [cities, sortConfig]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'success';
    if (score >= 65) return 'info';
    if (score >= 50) return 'warning';
    return 'danger';
  };

  if (loading) {
    return (
      <Card title="Expansion Oracle" subtitle="AI-powered city scoring for new hub locations">
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </Card>
    );
  }

  const topCity = sortedCities[0];
  const avgScore = Math.round(cities.reduce((sum, c) => sum + c.overallScore, 0) / cities.length);
  const readyCities = cities.filter(c => c.overallScore >= 70).length;

  return (
    <Card title="Expansion Oracle" subtitle={`AI city scoring • ${cities.length} cities analyzed • Last updated: ${lastUpdated.toLocaleDateString()}`} className="h-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <MetricCard label="Top Recommendation" value={topCity?.city || '-'} change={`${topCity?.overallScore || 0}/100 score`} changeType="positive" icon={<Target className="w-4 h-4" />} />
        <MetricCard label="Avg Score" value={`${avgScore}/100`} icon={<BarChart2 className="w-4 h-4" />} />
        <MetricCard label="Launch-Ready Cities" value={readyCities} change={`${cities.length - readyCities} need work`} changeType={readyCities > 0 ? 'positive' : 'neutral'} icon={<Zap className="w-4 h-4" />} />
        <MetricCard label="Total Addressable Fleet" value={cities.reduce((sum, c) => sum + c.estimatedFleetSize, 0).toLocaleString()} icon={<Truck className="w-4 h-4" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* City Cards */}
        <div className="lg:col-span-1 space-y-3 max-h-[70vh] overflow-y-auto pr-2">
          <h4 className="font-semibold text-gray-900 mb-3">Candidate Cities</h4>
          {sortedCities.map((city, idx) => (
            <button
              key={city.city}
              onClick={() => setSelectedCity(city)}
              className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-300 ${
                selectedCity?.city === city.city
                  ? 'bg-blue-50/80 border-blue-300 shadow-md shadow-blue-100'
                  : 'border-gray-200 hover:shadow-md transition-all duration-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-gray-900">{idx + 1}</span>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      city.overallScore > 80
                        ? 'bg-green-500'
                        : city.overallScore >= 60
                          ? 'bg-amber-500'
                          : 'bg-red-500'
                    }`} />
                    <div>
                      <p className="font-medium text-gray-900">{city.city}</p>
                      <p className="text-xs text-gray-500">{city.state}</p>
                    </div>
                  </div>
                </div>
                {selectedCity?.city === city.city ? (
                  <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl px-3 py-1.5 text-sm font-bold">
                    {city.overallScore}
                  </div>
                ) : (
                  <Badge variant={getScoreColor(city.overallScore)}>{city.overallScore}</Badge>
                )}
              </div>
              <div className="space-y-1 text-xs text-gray-600">
                <div className="flex justify-between"><span>Demand</span><span className="font-medium">{city.demandScore}</span></div>
                <div className="flex justify-between"><span>Competition</span><span className="font-medium">{city.competitionScore}</span></div>
                <div className="flex justify-between"><span>Infra</span><span className="font-medium">{city.infrastructureScore}</span></div>
                <div className="flex justify-between"><span>Regulatory</span><span className="font-medium">{city.regulatoryScore}</span></div>
              </div>
            </button>
          ))}
        </div>

        {/* Selected City Detail */}
        <div className="lg:col-span-2 space-y-6">
          {selectedCity ? (
            <CityDetailView city={selectedCity} onClose={() => setSelectedCity(null)} />
          ) : (
            <div className="bg-gray-50 rounded-2xl p-8 text-center">
              <Globe className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">Select a City</h4>
              <p className="text-gray-500">Click on a city from the left to view detailed expansion analysis</p>
            </div>
          )}
        </div>
      </div>

      {/* Full Table View */}
      <div className="mt-6 border-t border-gray-200 pt-4">
        <h4 className="font-semibold text-gray-900 mb-3">Complete City Analysis</h4>
        <div className="overflow-x-auto">
          <Table
            columns={[
              { key: 'city', header: 'City', render: (c: any) => (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="font-medium">{c.city}, {c.state}</span>
                </div>
              )},
              { key: 'overallScore', header: 'Overall', className: 'text-right', render: (c: any) => (
                <Badge variant={getScoreColor(c.overallScore)} className="text-lg px-3 py-1">{c.overallScore}</Badge>
              )},
              { key: 'demandScore', header: 'Demand', className: 'text-center', render: (c: any) => <ProgressBar value={c.demandScore} showLabel={true} color="blue" /> },
              { key: 'competitionScore', header: 'Competition', className: 'text-center', render: (c: any) => (
                <ProgressBar value={100 - c.competitionScore} showLabel={true} color={c.competitionScore < 50 ? 'green' : c.competitionScore < 70 ? 'yellow' : 'red'} />
              )},
              { key: 'infrastructureScore', header: 'Infrastructure', className: 'text-center', render: (c: any) => <ProgressBar value={c.infrastructureScore} showLabel={true} color="purple" /> },
              { key: 'regulatoryScore', header: 'Regulatory', className: 'text-center', render: (c: any) => <ProgressBar value={c.regulatoryScore} showLabel={true} color={c.regulatoryScore > 75 ? 'green' : 'yellow'} /> },
              { key: 'estimatedFleetSize', header: 'Est. Fleet', className: 'text-right' },
              { key: 'estimatedMonthlyRevenue', header: 'Est. Monthly Rev', className: 'text-right', render: (c: any) => `₹${(c.estimatedMonthlyRevenue/100000).toFixed(1)}L` },
              { key: 'paybackMonths', header: 'Payback', className: 'text-right', render: (c: any) => `${c.paybackMonths} months` },
              { key: 'keyFactors', header: 'Key Factors', render: (c: any) => (
                <div className="flex flex-wrap gap-1">
                  {c.keyFactors.map((f: any) => <Badge key={f} variant="info" className="text-xs">{f}</Badge>)}
                </div>
              )},
            ]}
            data={sortedCities as any}
            className="text-sm"
            onRowClick={setSelectedCity as any}
          />
        </div>
      </div>
    </Card>
  );
}

function CityDetailView({ city, onClose }: { city: CityExpansionScore; onClose: () => void }) {
  const getScoreColor = (score: number) => score >= 80 ? 'success' : score >= 65 ? 'info' : score >= 50 ? 'warning' : 'danger';

  return (
    <div className="bg-white border border-gray-200/60 rounded-2xl p-5 shadow-sm">
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-xl font-bold text-gray-900">{city.city}, {city.state}</h3>
            <span className={`text-3xl font-extrabold bg-gradient-to-r ${
              city.overallScore >= 80 ? 'from-green-500 to-emerald-600' :
              city.overallScore >= 65 ? 'from-blue-500 to-indigo-600' :
              city.overallScore >= 50 ? 'from-amber-500 to-orange-600' :
              'from-red-500 to-rose-600'
            } bg-clip-text text-transparent`}>
              {city.overallScore}
            </span>
          </div>
          <p className="text-gray-500">Overall Expansion Score</p>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <MetricCard label="Demand Score" value={city.demandScore} icon={<TrendingUp className="w-4 h-4" />} />
        <MetricCard label="Competition" value={city.competitionScore} change="Lower is better" changeType={city.competitionScore < 50 ? 'positive' : 'warning'} icon={<Building2 className="w-4 h-4" />} />
        <MetricCard label="Infrastructure" value={city.infrastructureScore} icon={<Zap className="w-4 h-4" />} />
        <MetricCard label="Regulatory" value={city.regulatoryScore} icon={<Shield className="w-4 h-4" />} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-50 rounded-xl p-4">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white">
              <DollarSign className="w-4 h-4" />
            </div>
            Financial Projection
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between"><span>Est. Fleet Size</span><span className="font-medium">{city.estimatedFleetSize} vehicles</span></div>
            <div className="flex justify-between"><span>Est. Monthly Revenue</span><span className="font-medium text-green-600">₹{(city.estimatedMonthlyRevenue/100000).toFixed(1)}L</span></div>
            <div className="flex justify-between"><span>Est. Setup Cost</span><span className="font-medium">₹{(city.estimatedSetupCost/100000).toFixed(1)}L</span></div>
            <div className="flex justify-between border-t border-gray-200 pt-3"><span>Payback Period</span><span className="font-medium text-blue-600">{city.paybackMonths} months</span></div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-4">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white">
              <Target className="w-4 h-4" />
            </div>
            Key Strengths
          </h4>
          <div className="flex flex-wrap gap-2">
            {city.keyFactors.map(factor => (
              <Badge key={factor} variant="success">{factor}</Badge>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white">
              <Globe className="w-4 h-4" />
            </div>
            Global View
          </h4>
          <div className="rounded-2xl overflow-hidden border border-gray-200/60 shadow-sm">
            <ExpansionGlobe 
              cities={[city]} 
              selectedCity={city} 
              onSelectCity={() => {}} 
            />
          </div>
        </div>
        <div>
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white">
              <BarChart2 className="w-4 h-4" />
            </div>
            Score Breakdown
          </h4>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={[
              { name: 'Demand', score: city.demandScore, color: '#3b82f6' },
              { name: 'Competition\n(Inverted)', score: 100 - city.competitionScore, color: '#22c55e' },
              { name: 'Infrastructure', score: city.infrastructureScore, color: '#8b5cf6' },
              { name: 'Regulatory', score: city.regulatoryScore, color: '#f59e0b' },
            ]} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis type="number" tick={{ fontSize: 10 }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={120} />
              <Tooltip formatter={(value: any, name: any) => [value, name]} />
              <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                {[
                  { name: 'Demand', score: city.demandScore, color: '#3b82f6' },
                  { name: 'Competition', score: 100 - city.competitionScore, color: '#22c55e' },
                  { name: 'Infrastructure', score: city.infrastructureScore, color: '#8b5cf6' },
                  { name: 'Regulatory', score: city.regulatoryScore, color: '#f59e0b' },
                ].map((_, index) => (
                  <Cell key={`cell-${index}`} fill={['#3b82f6', '#22c55e', '#8b5cf6', '#f59e0b'][index]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div>
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white">
              <Shield className="w-4 h-4" />
            </div>
            Radar View
          </h4>
          <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-4">
            <div className="space-y-4">
              {[
                { label: 'Delivery Demand', score: city.demandScore, color: '#3b82f6' },
                { label: 'Low Competition', score: 100 - city.competitionScore, color: '#22c55e' },
                { label: 'Charging Infra', score: city.infrastructureScore, color: '#8b5cf6' },
                { label: 'EV Policy', score: city.regulatoryScore, color: '#f59e0b' },
              ].map(item => (
                <div key={item.label} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">{item.label}</span>
                    <span className="font-medium">{item.score}</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500"
                      style={{ width: `${item.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200 flex flex-wrap gap-3">
        <button className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-sm hover:shadow-md transition-all flex items-center gap-2">
          <ArrowRight className="w-4 h-4" />
          Initiate Feasibility Study
        </button>
        <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition-all">
          Export Report
        </button>
        <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition-all">
          Compare with Current Hubs
        </button>
      </div>
    </div>
  );
}
