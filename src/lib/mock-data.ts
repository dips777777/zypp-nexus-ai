// Mock Data Layer for Zypp Nexus AI
// Delhi NCR Hub - Modeled Estimates (Replace with real API data)
// Grounding: ~150 scooters, ~120 riders per hub

import type { Hub, Vehicle, Rider, Alert, Financials, AgentActivity, ScenarioParams, ScenarioProjection, CEONarrative } from '@/types';
import { calculateVehicleHealthScore, getPredictedFailureRisk, calculateHubAutonomyScore, generateDemandForecast, calculateCityExpansionScores, generateRecommendations, runScenario } from '@/lib/ai-scoring';

export type { ScenarioParams, ScenarioProjection, CEONarrative };

// Delhi NCR Hub coordinates (approximate centers)
const HUB_LOCATIONS = [
  { id: 'hub_1', name: 'Gurgaon Cyber City Hub', city: 'Gurgaon', coords: [28.4595, 77.0266] as [number, number] },
  { id: 'hub_2', name: 'Noida Sector 62 Hub', city: 'Noida', coords: [28.6139, 77.3617] as [number, number] },
  { id: 'hub_3', name: 'Delhi Connaught Place Hub', city: 'Delhi', coords: [28.6315, 77.2167] as [number, number] },
  { id: 'hub_4', name: 'Dwarka Sector 21 Hub', city: 'Delhi', coords: [28.5921, 77.0460] as [number, number] },
  { id: 'hub_5', name: 'Faridabad Industrial Hub', city: 'Faridabad', coords: [28.4089, 77.3178] as [number, number] },
];

const VEHICLE_MODELS = ['Hero Electric NYX', 'Ather 450X', 'Ola S1 Pro', 'TVS iQube', 'Bajaj Chetak'];
const RIDER_NAMES = [
  'Rajesh Kumar', 'Amit Singh', 'Sanjay Yadav', 'Vikash Sharma', 'Deepak Gupta',
  'Mohan Lal', 'Ravi Kumar', 'Sunil Verma', 'Anil Sharma', 'Pankaj Tiwari',
  'Rohit Singh', 'Sandeep Yadav', 'Manoj Kumar', 'Dinesh Sharma', 'Ajay Gupta',
  'Naveen Singh', 'Parveen Kumar', 'Sachin Yadav', 'Rahul Sharma', 'Vivek Gupta',
];

function randomDate(daysBack: number): string {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysBack));
  return date.toISOString();
}

function randomCoord(center: [number, number], radiusKm: number): [number, number] {
  const lat = center[0] + (Math.random() - 0.5) * (radiusKm / 111);
  const lng = center[1] + (Math.random() - 0.5) * (radiusKm / (111 * Math.cos(center[0] * Math.PI / 180)));
  return [lat, lng];
}

// Generate vehicles for a hub
function generateVehicles(hubId: string, hubCenter: [number, number], count: number): Vehicle[] {
  const vehicles: Vehicle[] = [];
  const statuses: Vehicle['status'][] = ['available', 'in_use', 'charging', 'maintenance', 'broken_down'];
  const statusWeights = [0.45, 0.30, 0.15, 0.07, 0.03];
  
  for (let i = 0; i < count; i++) {
    const model = VEHICLE_MODELS[Math.floor(Math.random() * VEHICLE_MODELS.length)];
    const totalDistance = Math.floor(Math.random() * 45000) + 2000;
    const repairCount = Math.floor(Math.random() * 5);
    const currentBattery = Math.floor(Math.random() * 100);
    const status = statuses[Math.floor(Math.random() * statusWeights.length)];
    
    const vehicle: Vehicle = {
      id: `veh_${hubId}_${String(i + 1).padStart(3, '0')}`,
      hubId,
      registrationNumber: `HR${String(26 + Math.floor(Math.random() * 10))}${String(Math.floor(Math.random() * 9000) + 1000)}`,
      model,
      batteryCapacity: model.includes('Ather') || model.includes('Ola') ? 3.7 : 2.5,
      currentBattery: status === 'charging' ? Math.floor(Math.random() * 40) + 10 : currentBattery,
      totalDistance,
      status,
      location: randomCoord(hubCenter, 8),
      lastServiceDate: randomDate(180),
      repairCount,
      healthScore: 0, // Will be calculated
      predictedFailureRisk: 'low',
      assignedRiderId: undefined,
    };
    
    vehicle.healthScore = calculateVehicleHealthScore(vehicle);
    vehicle.predictedFailureRisk = getPredictedFailureRisk(vehicle.healthScore, vehicle);
    
    vehicles.push(vehicle);
  }
  return vehicles;
}

// Generate riders for a hub
function generateRiders(hubId: string, vehicles: Vehicle[], count: number): Rider[] {
  const riders: Rider[] = [];
  const statuses: Rider['status'][] = ['online', 'offline', 'on_delivery', 'break'];
  const statusWeights = [0.55, 0.20, 0.20, 0.05];
  const availableVehicles = vehicles.filter(v => v.status === 'available');
  
  for (let i = 0; i < count; i++) {
    const status = statuses[Math.floor(Math.random() * statusWeights.length)];
    const assignedVehicle = status === 'on_delivery' && availableVehicles.length > 0
      ? availableVehicles.splice(Math.floor(Math.random() * availableVehicles.length), 1)[0]
      : undefined;
    
    if (assignedVehicle) {
      assignedVehicle.assignedRiderId = `rider_${hubId}_${String(i + 1).padStart(3, '0')}`;
      assignedVehicle.status = 'in_use';
    }
    
    riders.push({
      id: `rider_${hubId}_${String(i + 1).padStart(3, '0')}`,
      hubId,
      name: RIDER_NAMES[Math.floor(Math.random() * RIDER_NAMES.length)] + ` ${String(i + 1).padStart(2, '0')}`,
      phone: `+91-9${String(Math.floor(Math.random() * 900000000) + 100000000)}`,
      status,
      currentVehicleId: assignedVehicle?.id,
      todayDeliveries: status === 'online' || status === 'on_delivery' ? Math.floor(Math.random() * 10) : 0,
      todayEarnings: 0,
      rating: 3.5 + Math.random() * 1.5,
      shiftStart: '09:00',
      shiftEnd: '21:00',
    });
  }
  
  // Calculate earnings
  riders.forEach(r => {
    r.todayEarnings = r.todayDeliveries * 35 + (r.status !== 'offline' ? 600 : 0); // Base + per delivery
  });
  
  return riders;
}

// Generate alerts for a hub
function generateAlerts(hubId: string, vehicles: Vehicle[], riders: Rider[]): Alert[] {
  const alerts: Alert[] = [];
  const alertTypes: Alert['type'][] = ['battery_low', 'vehicle_breakdown', 'rider_offline', 'maintenance_due', 'high_demand', 'charging_station_full', 'weather', 'traffic'];
  const severities: Alert['severity'][] = ['info', 'warning', 'critical'];
  
  // Battery low alerts
  vehicles.filter(v => v.currentBattery < 20 && v.status !== 'charging').slice(0, 3).forEach(v => {
    alerts.push({
      id: `alert_${Date.now()}_${Math.random()}`,
      hubId,
      vehicleId: v.id,
      type: 'battery_low',
      severity: v.currentBattery < 10 ? 'critical' : 'warning',
      message: `Vehicle ${v.registrationNumber} at ${v.currentBattery}% battery`,
      timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString(),
      acknowledged: false,
      suggestedAction: v.currentBattery < 10 ? 'Dispatch swap van immediately' : 'Schedule charging within 30 min',
    });
  });
  
  // Maintenance due
  vehicles.filter(v => v.totalDistance > 40000 && v.status !== 'maintenance').slice(0, 2).forEach(v => {
    alerts.push({
      id: `alert_${Date.now()}_${Math.random()}`,
      hubId,
      vehicleId: v.id,
      type: 'maintenance_due',
      severity: 'warning',
      message: `Vehicle ${v.registrationNumber} at ${v.totalDistance}km - service due`,
      timestamp: new Date(Date.now() - Math.random() * 7200000).toISOString(),
      acknowledged: false,
      suggestedAction: 'Schedule preventive maintenance this week',
    });
  });
  
  // High demand alert
  if (Math.random() > 0.5) {
    alerts.push({
      id: `alert_${Date.now()}_${Math.random()}`,
      hubId,
      type: 'high_demand',
      severity: 'info',
      message: 'Demand forecast shows 40% increase in Cyber City zone 18:00-21:00',
      timestamp: new Date().toISOString(),
      acknowledged: false,
      suggestedAction: 'Pre-position 15 vehicles to Cyber City zone by 17:30',
    });
  }
  
  // Rider offline
  riders.filter(r => r.status === 'offline' && Math.random() > 0.7).slice(0, 2).forEach(r => {
    alerts.push({
      id: `alert_${Date.now()}_${Math.random()}`,
      hubId,
      riderId: r.id,
      type: 'rider_offline',
      severity: 'warning',
      message: `Rider ${r.name} offline during peak hours`,
      timestamp: new Date(Date.now() - Math.random() * 1800000).toISOString(),
      acknowledged: false,
      suggestedAction: 'Contact rider or reassign vehicle',
    });
  });
  
  return alerts;
}

// Generate all hubs with vehicles, riders, alerts
export function generateMockHubs(): Hub[] {
  return HUB_LOCATIONS.map((loc, idx) => {
    const fleetSize = 130 + Math.floor(Math.random() * 40); // 130-170
    const riderCount = 100 + Math.floor(Math.random() * 40); // 100-140
    const vehicles = generateVehicles(loc.id, loc.coords, fleetSize);
    const riders = generateRiders(loc.id, vehicles, riderCount);
    const alerts = generateAlerts(loc.id, vehicles, riders);
    
    const todayDeliveries = riders.reduce((sum, r) => sum + r.todayDeliveries, 0);
    const todayRevenue = todayDeliveries * 55;
    const todayCosts = fleetSize * 120 + riderCount * 600 + vehicles.filter(v => v.status === 'charging').length * 45;
    
    const hub: Hub = {
      id: loc.id,
      name: loc.name,
      city: loc.city,
      coordinates: loc.coords,
      fleetSize,
      riderCount,
      status: alerts.some(a => a.severity === 'critical') ? 'maintenance' : 'active',
      autonomyScore: 0, // Will be calculated
      todayDeliveries,
      todayRevenue,
      todayCosts,
      alerts,
    };
    
    hub.autonomyScore = calculateHubAutonomyScore(hub);
    return hub;
  });
}

// Generate financial data for a hub
export function generateMockFinancials(hubId: string, period: 'daily' | 'weekly' | 'monthly' = 'monthly'): Financials {
  const multiplier = period === 'daily' ? 1 : period === 'weekly' ? 7 : 30;
  const baseDeliveries = 850 * multiplier;
  
  return {
    hubId,
    period,
    revenue: {
      deliveryFees: baseDeliveries * 55,
      perKmRevenue: baseDeliveries * 4.2 * 12,
      subscriptionRevenue: 45 * 2500,
      total: 0,
    },
    costs: {
      charging: 150 * 45 * 8 * 30 * 0.4,
      batterySwapping: 150 * 1.2 * 45 * 30,
      maintenance: 150 * 1200,
      riderPayouts: 120 * (18000 + (baseDeliveries / 120) * 35),
      insurance: 150 * 800,
      overhead: 350000,
      total: 0,
    },
    margin: 0,
    marginPercent: 0,
  };
}

// Fix financial totals
function finalizeFinancials(f: Financials): Financials {
  f.revenue.total = f.revenue.deliveryFees + f.revenue.perKmRevenue + f.revenue.subscriptionRevenue;
  f.costs.total = f.costs.charging + f.costs.batterySwapping + f.costs.maintenance + f.costs.riderPayouts + f.costs.insurance + f.costs.overhead;
  f.margin = f.revenue.total - f.costs.total;
  f.marginPercent = (f.margin / f.revenue.total) * 100;
  return f;
}

export const mockFinancials = {
  hub_1: finalizeFinancials(generateMockFinancials('hub_1', 'monthly')),
  hub_2: finalizeFinancials(generateMockFinancials('hub_2', 'monthly')),
  hub_3: finalizeFinancials(generateMockFinancials('hub_3', 'monthly')),
  hub_4: finalizeFinancials(generateMockFinancials('hub_4', 'monthly')),
  hub_5: finalizeFinancials(generateMockFinancials('hub_5', 'monthly')),
};

// Generate demand forecast
export const mockDemandForecast = generateDemandForecast('hub_1', 24);

// Generate city expansion scores
export const mockCityExpansionScores = calculateCityExpansionScores();

// Generate agent activity
export function generateMockAgentActivity(): AgentActivity[] {
  const activities: AgentActivity[] = [];
  const agentTypes: AgentActivity['agentType'][] = [
    'fleet_optimizer', 'maintenance_predictor', 'demand_forecaster', 
    'route_optimizer', 'pricing_engine', 'rider_matcher', 
    'charging_scheduler', 'expansion_scout'
  ];
  
  const actions = {
    fleet_optimizer: ['Rebalanced 12 vehicles to high-demand zones', 'Optimized vehicle allocation for evening peak', 'Redistributed 8 idle vehicles from Dwarka to Cyber City'],
    maintenance_predictor: ['Flagged 3 vehicles for preventive maintenance', 'Predicted battery degradation on 5 Ather 450X units', 'Scheduled 12 service appointments for next week'],
    demand_forecaster: ['Updated 24hr forecast: 15% increase expected in Noida', 'Detected weekend demand surge pattern in Saket', 'Adjusted lunch rush prediction for Connaught Place'],
    route_optimizer: ['Optimized 47 delivery routes, saved 2.3 hrs total', 'Rerouted 8 riders around NH-48 traffic jam', 'Reduced avg delivery time by 4 min in Gurgaon'],
    pricing_engine: ['Adjusted surge pricing for Cyber City dinner rush', 'Applied volume discount for Swiggy bulk orders', 'Recommended dynamic pricing for weekend'],
    rider_matcher: ['Matched 156 orders to optimal riders', 'Assigned 23 high-value orders to top-rated riders', 'Balanced workload across 120 active riders'],
    charging_scheduler: ['Scheduled off-peak charging for 45 vehicles', 'Redirected 12 vehicles to underutilized swap station', 'Saved ₹3,200 in peak charging costs today'],
    expansion_scout: ['Evaluated Hyderabad for Q2 expansion', 'Analyzed charging infra readiness in Pune', 'Scored 8 candidate cities for next hub'],
  };
  
  for (let i = 0; i < 50; i++) {
    const agentType = agentTypes[Math.floor(Math.random() * agentTypes.length)];
    const actionList = actions[agentType];
    const action = actionList[Math.floor(Math.random() * actionList.length)];
    const hoursAgo = Math.random() * 24;
    
    activities.push({
      id: `agent_${Date.now()}_${i}`,
      agentType,
      action,
      target: ['hub_1', 'hub_2', 'hub_3', 'hub_4', 'hub_5', 'city_hyderabad', 'city_pune'][Math.floor(Math.random() * 7)],
      impact: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as AgentActivity['impact'],
      timestamp: new Date(Date.now() - hoursAgo * 3600000).toISOString(),
      details: `Automated decision executed with ${85 + Math.random() * 10}% confidence`,
      automated: Math.random() > 0.15,
    });
  }
  
  return activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export const mockAgentActivity = generateMockAgentActivity();

// Generate CEO Briefing Narrative
export function generateCEONarrative(hubs: Hub[], vehicles: Vehicle[]): {
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
  topPriorities: Array<{ action: string; impact: string; timeframe: string }>;
  risks: string[];
  opportunities: string[];
} {
  const totalFleet = hubs.reduce((sum, h) => sum + h.fleetSize, 0);
  const availableVehicles = vehicles.filter(v => v.status === 'available' || v.status === 'in_use').length;
  const fleetUptime = (availableVehicles / totalFleet) * 100;
  const activeRiders = hubs.reduce((sum, h) => sum + h.riderCount, 0);
  const deliveriesCompleted = hubs.reduce((sum, h) => sum + h.todayDeliveries, 0);
  const revenue = hubs.reduce((sum, h) => sum + h.todayRevenue, 0);
  const costs = hubs.reduce((sum, h) => sum + h.todayCosts, 0);
  const margin = revenue - costs;
  const criticalAlerts = hubs.reduce((sum, h) => sum + h.alerts.filter(a => a.severity === 'critical').length, 0);
  
  const recommendations = generateRecommendations(hubs, vehicles);
  
  return {
    date: new Date().toISOString().split('T')[0],
    summary: `Overnight fleet operated at ${fleetUptime.toFixed(1)}% uptime across ${hubs.length} Delhi NCR hubs. ${deliveriesCompleted} deliveries completed generating ₹${(revenue/100000).toFixed(1)}L revenue. ${criticalAlerts} critical alerts require attention.`,
    keyMetrics: {
      fleetUptime: Math.round(fleetUptime * 10) / 10,
      activeRiders,
      deliveriesCompleted,
      revenue,
      margin,
      criticalAlerts,
    },
    topPriorities: recommendations.map(r => ({
      action: r.action,
      impact: r.impact,
      timeframe: r.timeframe,
    })),
    risks: [
      `${vehicles.filter(v => v.predictedFailureRisk === 'critical').length} vehicles at critical failure risk`,
      `${hubs.filter(h => h.autonomyScore < 70).length} hubs below 70% autonomy threshold`,
      `Charging infrastructure at 78% capacity during peak`,
    ],
    opportunities: [
      'Evening demand surge predicted in Cyber City (+40%)',
      'Off-peak charging optimization can save ₹18K/month',
      'Hyderabad expansion score: 82/100 - ready for Q2 launch',
    ],
  };
}

// Scenario simulation defaults
export const defaultScenarioParams = {
  riderCount: 120,
  maintenanceBudget: 180000,
  autonomyLevel: 72,
  chargingStations: 8,
  vehicleUtilizationTarget: 75,
};

export const defaultScenarioProjection = runScenario(defaultScenarioParams);

// Export all mock data
export const mockHubs = generateMockHubs();
export const mockVehicles = mockHubs.flatMap(h => generateVehicles(h.id, h.coordinates, h.fleetSize));
export const mockRiders = mockHubs.flatMap(h => generateRiders(h.id, mockVehicles.filter(v => v.hubId === h.id), h.riderCount));

// API Integration Points - Clearly marked for replacement
// TODO: Replace with real API calls when backend is available
export const api = {
  // Hub & Fleet
  getHubs: async (): Promise<Hub[]> => mockHubs,
  getHub: async (id: string): Promise<Hub | undefined> => mockHubs.find(h => h.id === id),
  getVehicles: async (hubId?: string): Promise<Vehicle[]> => hubId 
    ? mockVehicles.filter(v => v.hubId === hubId) 
    : mockVehicles,
  getVehicle: async (id: string): Promise<Vehicle | undefined> => mockVehicles.find(v => v.id === id),
  getRiders: async (hubId?: string): Promise<Rider[]> => hubId
    ? mockRiders.filter(r => r.hubId === hubId)
    : mockRiders,
  
  // Alerts & Operations
  getAlerts: async (hubId?: string): Promise<Alert[]> => hubId
    ? mockHubs.find(h => h.id === hubId)?.alerts || []
    : mockHubs.flatMap(h => h.alerts),
  acknowledgeAlert: async (id: string): Promise<void> => {
    // Mock implementation
    console.log(`Alert ${id} acknowledged`);
  },
  
  // Financials
  getFinancials: async (hubId: string, period: 'daily' | 'weekly' | 'monthly'): Promise<Financials> => 
    finalizeFinancials(generateMockFinancials(hubId, period)),
  
  // Predictions
  getDemandForecast: async (hubId: string, hoursAhead: number): Promise<typeof mockDemandForecast> => 
    generateDemandForecast(hubId, hoursAhead),
  getVehicleHealthScore: async (vehicleId: string): Promise<number> => {
    const v = mockVehicles.find(v => v.id === vehicleId);
    return v ? calculateVehicleHealthScore(v) : 0;
  },
  getHubAutonomyScore: async (hubId: string): Promise<number> => {
    const h = mockHubs.find(h => h.id === hubId);
    return h ? calculateHubAutonomyScore(h) : 0;
  },
  getCityExpansionScores: async (): Promise<typeof mockCityExpansionScores> => mockCityExpansionScores,
  
  // AI Agents
  getAgentActivity: async (hoursBack: number): Promise<AgentActivity[]> => 
    mockAgentActivity.filter(a => new Date(a.timestamp) > new Date(Date.now() - hoursBack * 3600000)),
  
  // Scenario Simulation
  runScenario: async (params: typeof defaultScenarioParams): Promise<typeof defaultScenarioProjection> => 
    runScenario(params),
  
  // CEO Briefing
  generateCEONarrative: async (): Promise<ReturnType<typeof generateCEONarrative>> => 
    generateCEONarrative(mockHubs, mockVehicles),
};