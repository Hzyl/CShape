import { useEffect, useRef } from 'react';
import { POI } from '@/services/poiService';

interface POIMapProps {
  pois: POI[];
  selectedPOI?: POI | null;
  onLocationSelect?: (lat: number, lng: number) => void;
  editable?: boolean;
}

export const POIMap = ({ pois, selectedPOI, onLocationSelect, editable = false }: POIMapProps) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    // Initialize map using Google Maps API
    if (!mapContainerRef.current) return;

    // For now, create a simple map placeholder
    // In production, load Google Maps SDK via @googlemaps/js-api-loader
    const container = mapContainerRef.current;
    container.style.backgroundColor = '#e0e0e0';
    container.style.display = 'flex';
    container.style.alignItems = 'center';
    container.style.justifyContent = 'center';
    container.style.fontSize = '14px';
    container.style.color = '#999';

    // Create placeholder
    container.innerHTML = `
      <div style="text-align: center;">
        <p style="margin: 20px;">Google Maps Placeholder</p>
        <p style="font-size: 12px; color: #aaa;">
          Cần cấu hình VITE_MAP_API_KEY<br/>
          Hiện đang dùng placeholder POC
        </p>
        <div style="margin-top: 20px; font-size: 12px; color: #aaa;">
          <p>📍 ${pois.length} POI được tải</p>
          ${selectedPOI ? `<p>Đã chọn: ${selectedPOI.name}</p>` : ''}
        </div>
      </div>
    `;
  }, [pois, selectedPOI]);

  return (
    <div
      ref={mapContainerRef}
      className="w-full h-full bg-gray-200 rounded-lg relative"
      style={{ minHeight: '400px' }}
    />
  );
};
