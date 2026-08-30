"use client";

import { useState, useEffect } from 'react';
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
  { id: 'command-center', label: 'AI Command Center', icon: LayoutDashboard, description: 'Network overview, hubs, alerts' },
  { id: 'fleet-intel', label: 'Live Fleet Intelligence', icon: Truck, description: 'Real-time vehicle status grid' },
  { id: 'hub-command', label: 'Hub Command Center', icon: Target, description: 'Per-hub autonomy scores' },
  { id: 'vehicle-twin', label: 'Vehicle Digital Twin', icon: Cpu, description: 'Per-vehicle health profiles' },
  { id: 'predictive-maint', label: 'Predictive Maintenance', icon: Wrench, description: 'AI failure predictions' },
  { id: 'demand-forecast', label: 'Demand Forecast Map', icon: MapPin, description: 'Delivery demand heatmap' },
  { id: 'pl-copilot', label: 'AI P&L Copilot', icon: DollarSign, description: 'Financials with AI insights' },
  { id: 'scenario-sim', label: 'Scenario Simulator', icon: RotateCcw, description: 'Interactive what-if analysis' },
  { id: 'expansion-oracle', label: 'Expansion Oracle', icon: Globe, description: 'New city scoring' },
  { id: 'agent-activity', label: 'AI Agent Activity', icon: Bot, description: 'Live agent action log' },
  { id: 'ceo-briefing', label: 'Executive Dashboard', icon: Sunrise, description: 'Fleet performance & strategic overview' },
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
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const ModuleComponent = moduleComponents[activeModule];
  const activeModuleInfo = MODULES.find(m => m.id === activeModule);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - desktop only */}
      {!isMobile && (
        <aside className={`${sidebarOpen ? 'w-72' : 'w-20'} fixed inset-y-0 left-0 z-40 bg-white border-r border-gray-200/60 transition-all duration-300 flex flex-col`}>
        {/* Brand Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-700/50 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg shadow-blue-900/30">
              <Zap className="w-5 h-5 text-white" />
            </div>
            {sidebarOpen && (
              <span className="font-bold text-lg text-white tracking-tight">Zypp Nexus AI</span>
            )}
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors"
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto" role="navigation" aria-label="Main navigation">
          {MODULES.map(module => {
            const isActive = activeModule === module.id;
            const Icon = module.icon;
            return (
              <button
                key={module.id}
                onClick={() => { setActiveModule(module.id); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 shadow-sm shadow-blue-100 dark:shadow-blue-900/20'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
                title={sidebarOpen ? undefined : module.label}
              >
                <Icon className={`w-[18px] h-[18px] flex-shrink-0 ${isActive ? 'text-blue-600 dark:text-blue-400' : ''}`} />
                {sidebarOpen && (
                  <div className="flex-1 text-left min-w-0">
                    <p className={`font-medium truncate ${isActive ? '' : ''}`}>{module.label}</p>
                    <p className="text-[11px] truncate opacity-60">{module.description}</p>
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-700/50 bg-white dark:bg-gray-800/95">
          {sidebarOpen ? (
            <div className="space-y-1">
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">Delhi NCR Hub Network</p>
              <p className="text-[11px] text-gray-400 dark:text-gray-500">5 Hubs | ~750 Vehicles | ~600 Riders</p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">Live Data Mode</span>
              </div>
            </div>
          ) : (
            <div className="text-center text-[10px] text-gray-400 dark:text-gray-500 font-medium">Zypp Nexus AI</div>
          )}
        </div>
      </aside>
      )}

      {/* Mobile Menu Button */}
      <button
        className="lg:hidden fixed top-3 left-3 z-50 p-2 bg-white rounded-xl shadow-lg border border-gray-200/60"
        onClick={() => setMobileMenuOpen(true)}
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
      </button>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Main Content */}
      <main className={`${sidebarOpen ? 'lg:ml-72' : 'lg:ml-20'} flex-1 min-h-screen`}>
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-gray-200/40">
          <div className="flex items-center justify-between h-14 sm:h-16 pl-12 sm:pl-6 pr-4 sm:pr-6">
            <div className="flex items-center gap-3 min-w-0">
              <h1 className="text-base sm:text-xl font-bold text-gray-900 tracking-tight truncate">
                {activeModuleInfo?.label}
              </h1>
              {sidebarOpen && activeModuleInfo && (
                <span className="text-sm text-gray-400 dark:text-gray-500 hidden md:block font-medium">{activeModuleInfo.description}</span>
              )}
            </div>
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              <button className="p-2 sm:p-2.5 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 relative transition-colors">
                <Bell className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                <span className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
              </button>
              <button className="p-2 sm:p-2.5 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors hidden sm:block">
                <Settings className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
              </button>
              <div className="hidden sm:flex items-center gap-3 pl-3 ml-1 border-l border-gray-200/60">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm shadow-blue-500/20">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="text-left hidden md:block">
                  <p className="text-sm font-semibold text-gray-900">Zypp Electric</p>
                  <p className="text-[11px] text-gray-400 font-medium">Fleet Operations</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Module Content */}
        <div className="p-3 sm:p-4 md:p-6">
          <ModuleComponent className="h-auto md:h-[calc(100vh-120px)]" />
        </div>
      </main>

      {/* Mobile Sidebar */}
      {mobileMenuOpen && (
        <aside className="lg:hidden fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-200/60 flex flex-col shadow-2xl">
          <div className="h-16 px-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-700/50 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg text-white">Zypp Nexus AI</span>
            </div>
            <button onClick={() => setMobileMenuOpen(false)} className="p-1.5 rounded-lg hover:bg-white/10 text-white/70 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
          <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
            {MODULES.map(module => {
              const isActive = activeModule === module.id;
              const Icon = module.icon;
              return (
                <button
                  key={module.id}
                  onClick={() => { setActiveModule(module.id); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                      : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <Icon className={`w-[18px] h-[18px] ${isActive ? 'text-blue-600 dark:text-blue-400' : ''}`} />
                  <span className="font-medium">{module.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>
      )}
    </div>
  );
}
