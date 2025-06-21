'use client';
import dynamic from 'next/dynamic';

const MapView = dynamic(() => import('./MapView'), { ssr: false });

interface MapWrapperProps {
  sidebarOpen?: boolean;
}

export default function MapWrapper({ sidebarOpen = true }: MapWrapperProps) {
  return <MapView sidebarOpen={sidebarOpen} />;
}