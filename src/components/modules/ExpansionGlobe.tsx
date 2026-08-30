"use client";

import { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Html, Text } from '@react-three/drei';
import type { CityExpansionScore } from '@/types';

interface GlobeProps {
  cities: CityExpansionScore[];
  selectedCity?: CityExpansionScore | null;
  onSelectCity: (city: CityExpansionScore) => void;
}

function GlobeScene({ cities, selectedCity, onSelectCity }: GlobeProps) {
  const cityMeshes = useMemo(() => cities.map(city => {
    const [lat, lng] = city.coordinates;
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    const radius = 100;
    
    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.sin(theta);
    
    return { city, position: [x, y, z] as [number, number, number] };
  }), [cities]);

  return (
    <>
      {/* Earth sphere */}
      <mesh>
        <sphereGeometry args={[100, 64, 64]} />
        <meshStandardMaterial 
          color="#1a1a2e"
          roughness={0.8}
          metalness={0.2}
        />
      </mesh>
      
      {/* Atmosphere glow */}
      <mesh>
        <sphereGeometry args={[105, 32, 32]} />
        <meshBasicMaterial 
          color="#3b82f6"
          transparent
          opacity={0.15}
          side={2}
        />
      </mesh>
      
      {/* City markers */}
      {cityMeshes.map(({ city, position }) => (
        <CityMarker
          key={city.city}
          city={city}
          position={position}
          isSelected={selectedCity?.city === city.city}
          onClick={() => onSelectCity(city)}
        />
      ))}
      
      {/* Ambient light */}
      <ambientLight color="#ffffff" intensity={0.6} />
      {/* Directional light (sun) */}
      <directionalLight position={[200, 200, 200]} color="#ffffff" intensity={1} />
      <directionalLight position={[-200, -200, -200]} color="#3b82f6" intensity={0.3} />
    </>
  );
}

function CityMarker({ 
  city, 
  position, 
  isSelected, 
  onClick 
}: { 
  city: CityExpansionScore; 
  position: [number, number, number]; 
  isSelected: boolean;
  onClick: () => void;
}) {
  const score = city.overallScore;
  const color = score >= 80 ? '#22c55e' : score >= 65 ? '#3b82f6' : score >= 50 ? '#f59e0b' : '#ef4444';
  
  // Calculate label offset based on position (always outward from sphere center)
  const radius = Math.sqrt(position[0]**2 + position[1]**2 + position[2]**2);
  const labelOffset = 18; // distance from sphere surface
  const labelPos = [
    position[0] / radius * (radius + labelOffset),
    position[1] / radius * (radius + labelOffset),
    position[2] / radius * (radius + labelOffset)
  ] as [number, number, number];
  
  return (
    <group position={position}>
      {/* Clickable sphere marker */}
      <mesh 
        onClick={onClick} 
        onPointerOver={(e) => e.stopPropagation()}
        rotation={[-position[0], -position[1], -position[2]].map(v => v / 100) as [number, number, number]}
      >
        <sphereGeometry args={[isSelected ? 6 : 4, 16, 16]} />
        <meshStandardMaterial 
          color={color}
          emissive={color}
          emissiveIntensity={isSelected ? 0.8 : 0.4}
          transparent
          opacity={0.9}
        />
      </mesh>
      
      {/* Pulse ring for selected */}
      {isSelected && (
        <mesh rotation={[-position[0], -position[1], -position[2]].map(v => v / 100) as [number, number, number]}>
          <ringGeometry args={[7, 10, 32]} />
          <meshBasicMaterial 
            color={color}
            transparent
            opacity={0.3}
            side={2}
          />
        </mesh>
      )}
      
      {/* City label - positioned outward from sphere, occlusion-aware */}
      <Html 
        position={labelPos}
        occlude={true}
        style={{ 
          pointerEvents: 'none',
          transform: 'translate(-50%, -50%)',
          fontSize: isSelected ? '14px' : '11px',
          fontWeight: isSelected ? 'bold' : 'normal',
          color: '#fff',
          textShadow: '0 0 6px #000, 0 0 12px #000',
          whiteSpace: 'nowrap',
          background: 'rgba(0,0,0,0.4)',
          padding: '2px 8px',
          borderRadius: '4px',
          backdropFilter: 'blur(2px)',
          WebkitBackdropFilter: 'blur(2px)',
        }}
      >
        <div>{city.city} ({city.overallScore})</div>
      </Html>
    </group>
  );
}

export function ExpansionGlobe({ 
  cities, 
  selectedCity, 
  onSelectCity 
}: GlobeProps) {
  return (
    <div style={{ width: '100%', height: '100%', minHeight: 400 }}>
      <Canvas 
        camera={{ position: [0, 0, 300], fov: 30 }}
        style={{ width: '100%', height: '100%' }}
      >
        <OrbitControls 
          enablePan={false}
          enableZoom={true}
          minDistance={150}
          maxDistance={500}
          autoRotate={!selectedCity}
          autoRotateSpeed={0.5}
        />
        <GlobeScene cities={cities} selectedCity={selectedCity} onSelectCity={onSelectCity} />
      </Canvas>
    </div>
  );
}