// AI Scoring Functions for Zypp Nexus AI
// These are architecturally real - replace mock data with real API calls
// All formulas documented for transparency and tuning

import type { Vehicle, Hub, DemandForecast, CityExpansionScore } from '@/types';

/**
 * VEHICLE HEALTH SCORE
 * Weighted composite: Battery Condition (30%) + Distance Traveled (25%) + 
 * Repair History (25%) + Usage Anomalies (20%)
 * Range: 0-100 (higher = healthier)
 */
export function calculateVehicleHealthScore(vehicle: Vehicle): number {
  // Battery Condition (30%) - based on current battery % and capacity degradation
  const batteryHealth = vehicle.currentBattery; // Simplified - real impl would track degradation
  const batteryScore = Math.min(100, batteryHealth * 1.2); // Slight boost for higher charge
  
  // Distance Traveled (25%) - inverse relationship, normalized to 50k km expected life
  const distanceScore = Math.max(0, 100 - (vehicle.totalDistance / 50000) * 100);
  
  // Repair History (25%) - exponential penalty for repairs
  const repairScore = Math.max(0, 100 - vehicle.repairCount * 15);
  
  // Usage Anomalies (20%) - simulated based on status patterns
  // Real impl: detect unusual vibration, temperature, regen braking patterns
  const anomalyScore = vehicle.status === 'broken_down' ? 0 : 
                       vehicle.status === 'maintenance' ? 40 : 
                       vehicle.status === 'charging' ? 85 : 95;
  
  const weightedScore = 
    batteryScore * 0.30 +
    distanceScore * 0.25 +
    repairScore * 0.25 +
    anomalyScore * 0.20;
  
  return Math.round(Math.max(0, Math.min(100, weightedScore)));
}

/**
 * PREDICTED FAILURE RISK
 * Based on health score thresholds and specific failure modes
 */
export function getPredictedFailureRisk(healthScore: number): 'low' | 'medium' | 'high' | 'critical' {
  if (healthScore >= 80) return 'low';
  if (healthScore >= 60) return 'medium';
  if (healthScore >= 40) return 'high';
  return 'critical';
}

/**
 * HUB AUTONOMY SCORE
 * % of operational decisions AI resolves without human escalation
 * Factors: Alert auto-resolution rate, Routing optimization acceptance, 
 * Charging scheduling compliance, Rider assignment accuracy
 */
export function calculateHubAutonomyScore(hub: Hub): number {
  // Simulated based on hub maturity and AI agent performance
  // Real impl: track actual escalation vs auto-resolution counts
  const baseAutonomy = 65; // Baseline for mature hub
  const fleetFactor = Math.min(10, hub.fleetSize / 20); // Larger fleets = more automation value
  const riderFactor = Math.min(8, hub.riderCount / 15);
  const alertFactor = hub.alerts.filter(a => a.acknowledged).length > 0 ? -5 : 0; // Unacknowledged alerts reduce autonomy
  
  return Math.round(Math.max(40, Math.min(95, baseAutonomy + fleetFactor + riderFactor + alertFactor)));
}

/**
 * DEMAND PREDICTION
 * Time-series forecast with daily/weekly patterns
 * Simulated with realistic patterns - replace with Prophet/LSTM model
 */
export function generateDemandForecast(hubId: string, hoursAhead: number): DemandForecast[] {
  const forecasts: DemandForecast[] = [];
  const now = new Date();
  
  // Delhi NCR delivery zones with base demand
  const zones = [
    { id: 'zone_1', name: 'Connaught Place', coords: [28.6315, 77.2167] as [number, number], baseDemand: 45 },
    { id: 'zone_2', name: 'Cyber City Gurgaon', coords: [28.4595, 77.0266] as [number, number], baseDemand: 62 },
    { id: 'zone_3', name: 'Noida Sector 62', coords: [28.6139, 77.3617] as [number, number], baseDemand: 38 },
    { id: 'zone_4', name: 'Dwarka', coords: [28.5921, 77.0460] as [number, number], baseDemand: 28 },
    { id: 'zone_5', name: 'Nehru Place', coords: [28.5487, 77.2516] as [number, number], baseDemand: 35 },
    { id: 'zone_6', name: 'Saket', coords: [28.5245, 77.2066] as [number, number], baseDemand: 32 },
    { id: 'zone_7', name: 'Rohini', coords: [28.7041, 77.1025] as [number, number], baseDemand: 25 },
    { id: 'zone_8', name: 'Janakpuri', coords: [28.6224, 77.0811] as [number, number], baseDemand: 22 },
  ];
  
  for (let h = 0; h < hoursAhead; h++) {
    const slotTime = new Date(now.getTime() + h * 3600000);
    const hour = slotTime.getHours();
    const dayOfWeek = slotTime.getDay(); // 0 = Sunday
    
    // Time-of-day multipliers
    let timeMultiplier = 0.3; // Baseline night
    if (hour >= 11 && hour <= 14) timeMultiplier = 1.8; // Lunch rush
    else if (hour >= 18 && hour <= 21) timeMultiplier = 2.0; // Dinner rush
    else if (hour >= 9 && hour <= 11) timeMultiplier = 1.2; // Morning
    else if (hour >= 14 && hour <= 17) timeMultiplier = 1.0; // Afternoon
    else if (hour >= 21 || hour <= 6) timeMultiplier = 0.2; // Night
    
    // Weekend adjustment
    const weekendMultiplier = (dayOfWeek === 0 || dayOfWeek === 6) ? 1.15 : 1.0;
    
    // Weather factor (simulated)
    const weatherFactor = 1.0; // Real: integrate weather API
    
    for (const zone of zones) {
      const predicted = Math.round(
        zone.baseDemand * timeMultiplier * weekendMultiplier * weatherFactor * 
        (0.9 + Math.random() * 0.2) // Noise
      );
      
      const factors = [];
      if (hour >= 11 && hour <= 14) factors.push('lunch_rush');
      if (hour >= 18 && hour <= 21) factors.push('dinner_rush');
      if (dayOfWeek === 0 || dayOfWeek === 6) factors.push('weekend');
      if (zone.name.includes('Cyber City') || zone.name.includes('Sector 62')) factors.push('office_density');
      
      forecasts.push({
        areaId: zone.id,
        areaName: zone.name,
        coordinates: zone.coords,
        predictedOrders: Math.max(0, predicted),
        confidence: 0.75 + Math.random() * 0.2, // 75-95%
        timeSlot: slotTime.toISOString(),
        factors,
      });
    }
  }
  
  return forecasts;
}

/**
 * CITY EXPANSION SCORE
 * Multi-factor evaluation for new hub viability
 */
export function calculateCityExpansionScores(): CityExpansionScore[] {
  const candidateCities = [
    {
      city: 'Mumbai',
      state: 'Maharashtra',
      coords: [19.0760, 72.8777] as [number, number],
      demand: 92,
      competition: 85, // High competition
      infrastructure: 78,
      regulatory: 70,
      fleetEst: 300,
      revenueEst: 4500000,
      setupCost: 8500000,
    },
    {
      city: 'Bangalore',
      state: 'Karnataka',
      coords: [12.9716, 77.5946] as [number, number],
      demand: 88,
      competition: 70,
      infrastructure: 82,
      regulatory: 75,
      fleetEst: 250,
      revenueEst: 3800000,
      setupCost: 7200000,
    },
    {
      city: 'Hyderabad',
      state: 'Telangana',
      coords: [17.3850, 78.4867] as [number, number],
      demand: 75,
      competition: 45,
      infrastructure: 70,
      regulatory: 80,
      fleetEst: 200,
      revenueEst: 2800000,
      setupCost: 5800000,
    },
    {
      city: 'Pune',
      state: 'Maharashtra',
      coords: [18.5204, 73.8567] as [number, number],
      demand: 70,
      competition: 50,
      infrastructure: 72,
      regulatory: 78,
      fleetEst: 180,
      revenueEst: 2400000,
      setupCost: 5200000,
    },
    {
      city: 'Chennai',
      state: 'Tamil Nadu',
      coords: [13.0827, 80.2707] as [number, number],
      demand: 68,
      competition: 55,
      infrastructure: 75,
      regulatory: 72,
      fleetEst: 180,
      revenueEst: 2300000,
      setupCost: 5000000,
    },
    {
      city: 'Kolkata',
      state: 'West Bengal',
      coords: [22.5726, 88.3639] as [number, number],
      demand: 65,
      competition: 40,
      infrastructure: 65,
      regulatory: 68,
      fleetEst: 160,
      revenueEst: 2100000,
      setupCost: 4800000,
    },
    {
      city: 'Ahmedabad',
      state: 'Gujarat',
      coords: [23.0225, 72.5714] as [number, number],
      demand: 60,
      competition: 35,
      infrastructure: 68,
      regulatory: 82,
      fleetEst: 150,
      revenueEst: 1900000,
      setupCost: 4200000,
    },
    {
      city: 'Jaipur',
      state: 'Rajasthan',
      coords: [26.9124, 75.7873] as [number, number],
      demand: 55,
      competition: 30,
      infrastructure: 60,
      regulatory: 75,
      fleetEst: 130,
      revenueEst: 1600000,
      setupCost: 3800000,
    },
  ];
  
  return candidateCities.map(c => {
    // Weighted: Demand 35%, Competition 20% (inverse), Infrastructure 25%, Regulatory 20%
    const overall = Math.round(
      c.demand * 0.35 +
      (100 - c.competition) * 0.20 +
      c.infrastructure * 0.25 +
      c.regulatory * 0.20
    );
    
    const paybackMonths = Math.round(c.setupCost / (c.revenueEst * 0.18)); // 18% net margin assumption
    
    const keyFactors: string[] = [];
    if (c.demand > 80) keyFactors.push('High delivery density');
    if (c.competition < 50) keyFactors.push('Low competitive saturation');
    if (c.infrastructure > 75) keyFactors.push('Strong charging infrastructure');
    if (c.regulatory > 75) keyFactors.push('Favorable EV policy');
    if (paybackMonths < 18) keyFactors.push('Fast payback period');
    
    return {
      city: c.city,
      state: c.state,
      coordinates: c.coords,
      demandScore: c.demand,
      competitionScore: c.competition,
      infrastructureScore: c.infrastructure,
      regulatoryScore: c.regulatory,
      overallScore: overall,
      estimatedFleetSize: c.fleetEst,
      estimatedMonthlyRevenue: c.revenueEst,
      estimatedSetupCost: c.setupCost,
      paybackMonths,
      keyFactors,
    };
  }).sort((a, b) => b.overallScore - a.overallScore);
}

/**
 * RECOMMENDATION ENGINE
 * Top 3 actions for Hub CEO ranked by P&L impact
 */
export function generateRecommendations(hubs: Hub[], vehicles: Vehicle[]): Array<{
  action: string;
  impact: string;
  timeframe: 'immediate' | 'today' | 'this_week';
  category: 'maintenance' | 'operations' | 'finance' | 'expansion';
  estimatedImpact: number; // INR
}> {
  const recommendations = [];
  
  // 1. Maintenance: Vehicles at critical risk
  const criticalVehicles = vehicles.filter(v => v.predictedFailureRisk === 'critical');
  if (criticalVehicles.length > 0) {
    const costPerBreakdown = 3500; // Towing + repair + lost revenue
    recommendations.push({
      action: `Pull ${criticalVehicles.length} critical-risk vehicles for preventive maintenance`,
      impact: `Prevent ~₹${(criticalVehicles.length * costPerBreakdown).toLocaleString()} in breakdown costs`,
      timeframe: 'immediate' as const,
      category: 'maintenance' as const,
      estimatedImpact: criticalVehicles.length * costPerBreakdown,
    });
  }
  
  // 2. Operations: Low autonomy hubs
  const lowAutonomyHubs = hubs.filter(h => h.autonomyScore < 70);
  if (lowAutonomyHubs.length > 0) {
    recommendations.push({
      action: `Deploy AI agent overrides for ${lowAutonomyHubs.length} hubs with autonomy < 70%`,
      impact: `Reduce manual interventions by ~${lowAutonomyHubs.length * 3}/day, save ₹${lowAutonomyHubs.length * 4500}/month`,
      timeframe: 'today' as const,
      category: 'operations' as const,
      estimatedImpact: lowAutonomyHubs.length * 4500,
    });
  }
  
  // 3. Finance: Charging optimization
  const chargingVehicles = vehicles.filter(v => v.status === 'charging').length;
  const totalVehicles = vehicles.length;
  if (chargingVehicles / totalVehicles > 0.35) {
    recommendations.push({
      action: 'Optimize charging schedule - shift 20% to off-peak hours (10PM-6AM)',
      impact: 'Reduce charging costs by ~₹18,000/month at current rates',
      timeframe: 'this_week' as const,
      category: 'finance' as const,
      estimatedImpact: 18000,
    });
  }
  
  // 4. Rider utilization
  const avgUtilization = hubs.reduce((sum, h) => sum + (h.todayDeliveries / Math.max(1, h.riderCount)), 0) / hubs.length;
  if (avgUtilization < 8) {
    recommendations.push({
      action: 'Rebalance rider shifts to match demand forecast peaks (11-14h, 18-21h)',
      impact: `Increase deliveries by ~${Math.round((8 - avgUtilization) * hubs[0]?.riderCount || 0)}/day, +₹${Math.round((8 - avgUtilization) * 35 * (hubs[0]?.riderCount || 0))}/day`,
      timeframe: 'today' as const,
      category: 'operations' as const,
      estimatedImpact: Math.round((8 - avgUtilization) * 35 * (hubs[0]?.riderCount || 0)),
    });
  }
  
  return recommendations
    .sort((a, b) => b.estimatedImpact - a.estimatedImpact)
    .slice(0, 3);
}

/**
 * SCENARIO SIMULATION
 * Projects outcomes based on controllable parameters
 */
export function runScenario(params: {
  riderCount: number;
  maintenanceBudget: number;
  autonomyLevel: number;
  chargingStations: number;
  vehicleUtilizationTarget: number;
}): {
  monthlyRevenue: number;
  monthlyCosts: number;
  monthlyMargin: number;
  marginPercent: number;
  vehicleUptime: number;
  riderUtilization: number;
  breakdownsPerMonth: number;
  co2Saved: number;
} {
  const {
    riderCount,
    maintenanceBudget,
    autonomyLevel,
    vehicleUtilizationTarget,
  } = params;
  
  // Baseline (current state)
  const BASE_FLEET = 150;
  const BASE_REVENUE_PER_DELIVERY = 55;
  const BASE_DELIVERIES_PER_RIDER_DAY = 7.5;
  const WORKING_DAYS = 26;
  
  // Revenue model
  const deliveriesPerMonth = riderCount * BASE_DELIVERIES_PER_RIDER_DAY * WORKING_DAYS * (vehicleUtilizationTarget / 100);
  const monthlyRevenue = deliveriesPerMonth * BASE_REVENUE_PER_DELIVERY;
  
  // Cost model
  const chargingCost = BASE_FLEET * 45 * 8 * 30 * 0.6; // 60% home charging, 40% swap
  const swappingCost = BASE_FLEET * 1.2 * 45 * 30; // 1.2 swaps/vehicle/day
  const maintenanceCost = maintenanceBudget;
  const riderPayouts = riderCount * (18000 + deliveriesPerMonth / riderCount * 35);
  const insurance = BASE_FLEET * 800;
  const overhead = 350000 + (autonomyLevel / 100) * 150000; // Higher autonomy = more tech cost
  
  const monthlyCosts = chargingCost + swappingCost + maintenanceCost + riderPayouts + insurance + overhead;
  const monthlyMargin = monthlyRevenue - monthlyCosts;
  const marginPercent = (monthlyMargin / monthlyRevenue) * 100;
  
  // Operational metrics
  const vehicleUptime = Math.min(98, 75 + (maintenanceBudget / 300000) * 15 + (autonomyLevel / 100) * 8);
  const riderUtilization = Math.min(95, vehicleUtilizationTarget);
  const breakdownsPerMonth = Math.max(2, BASE_FLEET * 0.08 * (1 - maintenanceBudget / 500000) * (1 - autonomyLevel / 150));
  const co2Saved = deliveriesPerMonth * 2.3; // ~2.3kg CO2 per delivery vs ICE
  
  return {
    monthlyRevenue: Math.round(monthlyRevenue),
    monthlyCosts: Math.round(monthlyCosts),
    monthlyMargin: Math.round(monthlyMargin),
    marginPercent: Math.round(marginPercent * 10) / 10,
    vehicleUptime: Math.round(vehicleUptime * 10) / 10,
    riderUtilization: Math.round(riderUtilization * 10) / 10,
    breakdownsPerMonth: Math.round(breakdownsPerMonth * 10) / 10,
    co2Saved: Math.round(co2Saved),
  };
}