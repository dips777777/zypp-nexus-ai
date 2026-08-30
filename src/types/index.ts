// Core types for Zypp Nexus AI - EV Fleet Operating System
// Grounding: Delhi NCR hub, ~150 scooters, ~120 riders per hub
// All figures are modeled estimates - replace with real API data

export interface Hub {
  id: string;
  name: string;
  city: string;
  coordinates: [number, number]; // [lat, lng]
  fleetSize: number;
  riderCount: number;
  status: 'active' | 'maintenance' | 'offline';
  autonomyScore: number; // 0-100, % of decisions AI handles without escalation
  todayDeliveries: number;
  todayRevenue: number;
  todayCosts: number;
  alerts: Alert[];
}

export interface Vehicle {
  id: string;
  hubId: string;
  registrationNumber: string;
  model: string;
  batteryCapacity: number; // kWh
  currentBattery: number; // percentage 0-100
  totalDistance: number; // km
  status: 'available' | 'in_use' | 'charging' | 'maintenance' | 'broken_down';
  location: [number, number]; // [lat, lng]
  lastServiceDate: string; // ISO date
  repairCount: number;
  healthScore: number; // 0-100, computed
  predictedFailureRisk: 'low' | 'medium' | 'high' | 'critical';
  assignedRiderId?: string;
}

export interface Rider {
  id: string;
  hubId: string;
  name: string;
  phone: string;
  status: 'online' | 'offline' | 'on_delivery' | 'break';
  currentVehicleId?: string;
  todayDeliveries: number;
  todayEarnings: number;
  rating: number;
  shiftStart: string;
  shiftEnd: string;
}

export interface Alert {
  id: string;
  hubId: string;
  vehicleId?: string;
  riderId?: string;
  type: 'battery_low' | 'vehicle_breakdown' | 'rider_offline' | 'maintenance_due' | 'high_demand' | 'charging_station_full' | 'weather' | 'traffic';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  timestamp: string;
  acknowledged: boolean;
  suggestedAction?: string;
}

export interface Financials {
  hubId: string;
  period: 'daily' | 'weekly' | 'monthly';
  revenue: {
    deliveryFees: number;
    perKmRevenue: number;
    subscriptionRevenue: number;
    total: number;
  };
  costs: {
    charging: number;
    batterySwapping: number;
    maintenance: number;
    riderPayouts: number;
    insurance: number;
    overhead: number;
    total: number;
  };
  margin: number;
  marginPercent: number;
}

export interface DemandForecast {
  areaId: string;
  areaName: string;
  coordinates: [number, number];
  predictedOrders: number;
  confidence: number; // 0-1
  timeSlot: string; // ISO datetime for start of slot
  factors: string[]; // e.g., ['lunch_rush', 'office_density', 'weather']
}

export interface CityExpansionScore {
  city: string;
  state: string;
  coordinates: [number, number];
  demandScore: number; // 0-100
  competitionScore: number; // 0-100 (lower = less competition)
  infrastructureScore: number; // 0-100
  regulatoryScore: number; // 0-100
  overallScore: number; // 0-100
  estimatedFleetSize: number;
  estimatedMonthlyRevenue: number;
  estimatedSetupCost: number;
  paybackMonths: number;
  keyFactors: string[];
}

export interface AgentActivity {
  id: string;
  agentType: 'fleet_optimizer' | 'maintenance_predictor' | 'demand_forecaster' | 'route_optimizer' | 'pricing_engine' | 'rider_matcher' | 'charging_scheduler' | 'expansion_scout';
  action: string;
  target: string; // hubId, vehicleId, city, etc.
  impact: 'low' | 'medium' | 'high';
  timestamp: string;
  details: string;
  automated: boolean;
}

export interface ScenarioParams {
  riderCount: number;
  maintenanceBudget: number; // monthly INR
  autonomyLevel: number; // 0-100
  chargingStations: number;
  vehicleUtilizationTarget: number; // 0-100
}

export interface ScenarioProjection {
  monthlyRevenue: number;
  monthlyCosts: number;
  monthlyMargin: number;
  marginPercent: number;
  vehicleUptime: number; // %
  riderUtilization: number; // %
  breakdownsPerMonth: number;
  co2Saved: number; // kg
}

export interface CEONarrative {
  date: string;
  summary: string;
  keyMetrics: {
    fleetUptime: number;
    activeRiders: number;
    deliveriesCompleted: number;
    revenue: number;
    margin: number;
    criticalAlerts: number;
  };
  topPriorities: Array<{
    action: string;
    impact: string;
    timeframe: string;
  }>;
  risks: string[];
  opportunities: string[];
}

// API Integration Points - Replace these with real API calls
export interface APIEndpoints {
  // Hub & Fleet
  getHubs: () => Promise<Hub[]>;
  getHub: (id: string) => Promise<Hub>;
  getVehicles: (hubId?: string) => Promise<Vehicle[]>;
  getVehicle: (id: string) => Promise<Vehicle>;
  getRiders: (hubId?: string) => Promise<Rider[]>;
  
  // Alerts & Operations
  getAlerts: (hubId?: string) => Promise<Alert[]>;
  acknowledgeAlert: (id: string) => Promise<void>;
  
  // Financials
  getFinancials: (hubId: string, period: 'daily' | 'weekly' | 'monthly') => Promise<Financials>;
  
  // Predictions
  getDemandForecast: (hubId: string, hoursAhead: number) => Promise<DemandForecast[]>;
  getVehicleHealthScore: (vehicleId: string) => Promise<number>;
  getHubAutonomyScore: (hubId: string) => Promise<number>;
  getCityExpansionScores: () => Promise<CityExpansionScore[]>;
  
  // AI Agents
  getAgentActivity: (hoursBack: number) => Promise<AgentActivity[]>;
  
  // Scenario Simulation
  runScenario: (params: ScenarioParams) => Promise<ScenarioProjection>;
  
  // CEO Briefing
  generateCEONarrative: () => Promise<CEONarrative>;
}

// Configuration - Update with real values when available
export const HUB_CONFIG = {
  city: 'Delhi NCR',
  defaultFleetSize: 150,
  defaultRiderCount: 120,
  knownCosts: {
    chargingPerKwh: 8, // INR
    swappingPerSwap: 45, // INR
    maintenancePerVehiclePerMonth: 1200, // INR
    riderPayoutPerDelivery: 35, // INR
    riderBaseSalary: 18000, // INR/month
  },
  revenueModel: {
    perDeliveryFee: 55, // INR
    perKmRate: 12, // INR
    subscriptionMonthly: 2500, // INR
  },
  targets: {
    reduceDowntimePercent: 25, // Target: reduce downtime by 25%
    growMarginPercent: 15, // Target: grow margin by 15%
  },
} as const;