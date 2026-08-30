"use client";

import { useState } from 'react';
import { LayoutDashboard, Truck, Zap, Target, Cpu, Wrench, MapPin, DollarSign, RotateCcw, Globe, Bot, Sunrise, ChevronLeft, ChevronRight, Menu, X, Bell, Settings, User } from 'lucide-react';
import { AICommandCenter } from './modules/AICommandCenter';
import { LiveFleetIntelligence } from './modules/LiveFleetIntelligence';
import { HubCommandCenter } from './modules/HubCommandCenter';
import { VehicleDigitalTwin } from './modules/VehicleDigitalTwin';
import { PredictiveMaintenanceEngine } from './modules/PredictiveMaintenanceEngine';
import { DemandForecastMap } from './modules/DemandForecastMap';
import { AIPLCopilot } from './modules/AIPLCopilot';
import { ScenarioSimulator } from './modules/ScenarioSimulator';
import { ExpansionOracle } from './modules/ExpansionOracle';
import { AIAgentActivityCenter } from './modules/AIAgentActivityCenter';
import { AICEOBriefing } from './modules/AICEOBriefing';

const MODULES = [
  { id: 'command-center', label: 'AI Command Center', icon: LayoutDashboard },
  { id: 'fleet-intel', label: 'Live Fleet Intelligence', icon: Truck },
  { id: 'hub-command', label: 'Hub Command Center', icon: Target },
  { id: 'vehicle-twin', label: 'Vehicle Digital Twin', icon: Cpu },
  { id: 'predictive-maint', label: 'Predictive Maintenance', icon: Wrench },
  { id: 'demand-forecast', label: 'Demand Forecast Map', icon: MapPin },
  { id: 'pl-copilot', label: 'AI P&L Copilot', icon: DollarSign },
  { id: 'scenario-sim', label: 'Scenario Simulator', icon: RotateCcw },
  { id: 'expansion-oracle', label: 'Expansion Oracle', icon: Globe },
  { id: 'agent-activity', label: 'AI Agent Activity', icon: Bot },
  { id: 'ceo-briefing', label: 'Executive Dashboard', icon: Sunrise },
] as const;

type ModuleId = typeof MODULES[number]['id'];

const moduleComponents: Record<ModuleId, React.ComponentType<{ className?: string }>> = {
  'command-center': AICommandCenter,
  'fleet-intel': LiveFleetIntelligence,
  'hub-command': HubCommandCenter,
  'vehicle-twin': VehicleDigitalTwin,
  'predictive-maint': PredictiveMaintenanceEngine,
  'demand-forecast': DemandForecastMap,
  'pl-copilot': AIPLCopilot,
  'scenario-sim': ScenarioSimulator,
  'expansion-oracle': ExpansionOracle,
  'agent-activity': AIAgentActivityCenter,
  'ceo-briefing': AICEOBriefing,
};

export function Dashboard() {
  const [activeModule, setActiveModule] = useState<ModuleId>('command-center');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const ModuleComponent = moduleComponents[activeModule];
  const activeModuleInfo = MODULES.find(m => m.id === activeModule);

  const handleModuleSelect = (id: ModuleId) => {
    setActiveModule(id);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <aside
        className="fixed inset-y-0 left-0 z-40 bg-white border-r border-gray-200 transition-all duration-300 flex-col hidden lg:flex"
        style={{ width: sidebarOpen ? 288 : 80 }}
      >
        <div className="h-16 px-4 flex items-center justify-between border-b border-gray-100 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            {sidebarOpen && <span className="font-bold text-lg text-white">Zypp Nexus AI</span>}
          </div>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1.5 rounded-lg hover:bg-white/10 text-white/70 hover:text-white">
            {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {MODULES.map(m => {
            const active = activeModule === m.id;
            const Icon = m.icon;
            return (
              <button
                key={m.id}
                onClick={() => handleModuleSelect(m.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${active ? 'bg-blue-50 text-blue-700' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'}`}
              >
                <Icon className={`w-[18px] h-[18px] flex-shrink-0 ${active ? 'text-blue-600' : ''}`} />
                {sidebarOpen && <span className="font-medium truncate">{m.label}</span>}
              </button>
            );
          })}
        </nav>
        <div className="p-4 border-t border-gray-100">
          {sidebarOpen ? (
            <div>
              <p className="text-xs font-semibold text-gray-700">Delhi NCR Hub Network</p>
              <p className="text-[11px] text-gray-400">5 Hubs | ~750 Vehicles | ~600 Riders</p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[11px] font-medium text-emerald-600">Live Data Mode</span>
              </div>
            </div>
          ) : (
            <p className="text-center text-[10px] text-gray-400 font-medium">Zypp Nexus AI</p>
          )}
        </div>
      </aside>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Mobile Sidebar */}
      {mobileMenuOpen && (
        <aside className="fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-200 flex flex-col shadow-2xl lg:hidden">
          <div className="h-16 px-4 flex items-center justify-between border-b border-gray-100 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg text-white">Zypp Nexus AI</span>
            </div>
            <button onClick={() => setMobileMenuOpen(false)} className="p-1.5 rounded-lg hover:bg-white/10 text-white/70">
              <X className="w-5 h-5" />
            </button>
          </div>
          <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
            {MODULES.map(m => {
              const active = activeModule === m.id;
              const Icon = m.icon;
              return (
                <button
                  key={m.id}
                  onClick={() => handleModuleSelect(m.id)}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm ${active ? 'bg-blue-50 text-blue-700' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  <Icon className={`w-5 h-5 ${active ? 'text-blue-600' : ''}`} />
                  <span className="font-medium">{m.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>
      )}

      {/* Main Content — pure CSS margin, no JS needed */}
      <main className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-[288px]' : 'lg:ml-20'}`}>
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between h-14 px-4 sm:px-6">
            <div className="flex items-center gap-3">
              <button onClick={() => setMobileMenuOpen(true)} className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-gray-100">
                <Menu className="w-5 h-5 text-gray-600" />
              </button>
              <h1 className="text-base sm:text-lg font-bold text-gray-900 truncate">{activeModuleInfo?.label}</h1>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
              </button>
              <button className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hidden sm:block">
                <Settings className="w-5 h-5" />
              </button>
              <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-gray-200">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-semibold text-gray-900">Zypp Electric</p>
                  <p className="text-[11px] text-gray-400">Fleet Operations</p>
                </div>
              </div>
            </div>
          </div>
        </header>
        <div className="p-3 sm:p-4 md:p-6">
          <ModuleComponent />
        </div>
      </main>
    </div>
  );
}
