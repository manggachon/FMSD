import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface VehicleLocation {
  vehicleId: string;
  lat: number;
  lng: number;
  timestamp: number;
}

export default function TrackingPage() {
  const [locations, setLocations] = useState<Map<string, VehicleLocation>>(new Map());
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    socketRef.current = io('/', { path: '/socket.io' });

    socketRef.current.on('connect', () => {
      console.log('Connected to tracking server');
    });

    socketRef.current.on('vehicle:location:update', (data: VehicleLocation) => {
      setLocations((prev) => new Map(prev).set(data.vehicleId, { ...data, timestamp: Date.now() }));
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">ติดตาม GPS แบบ Real-time</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map placeholder */}
        <div className="lg:col-span-2 card" style={{ minHeight: '480px' }}>
          <div className="flex items-center justify-center h-full bg-gray-100 rounded-xl text-gray-400">
            <div className="text-center">
              <p className="text-4xl mb-3">🗺️</p>
              <p className="font-medium">แผนที่ GPS</p>
              <p className="text-sm mt-1">ต้องการ Leaflet.js + tile provider</p>
              <p className="text-xs mt-1 text-gray-400">เชื่อมต่อ Socket.io แล้ว</p>
            </div>
          </div>
        </div>

        {/* Live vehicles */}
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-4">ยานพาหนะที่กำลังเคลื่อนที่ ({locations.size})</h3>
          {locations.size === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">ยังไม่มีข้อมูลการติดตาม</p>
          ) : (
            <ul className="space-y-3">
              {Array.from(locations.values()).map((loc) => (
                <li key={loc.vehicleId} className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium text-sm">ยานพาหนะ: {loc.vehicleId}</p>
                  <p className="text-xs text-gray-500">
                    {loc.lat.toFixed(6)}, {loc.lng.toFixed(6)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
