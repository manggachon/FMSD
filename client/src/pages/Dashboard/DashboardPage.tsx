import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../../services/api';
import { VehicleStats } from '../../types';

const STATUS_COLORS: Record<string, string> = {
  AVAILABLE: '#22c55e',
  IN_USE: '#3b82f6',
  MAINTENANCE: '#f59e0b',
  INACTIVE: '#6b7280',
};

const STATUS_LABELS: Record<string, string> = {
  AVAILABLE: 'พร้อมใช้งาน',
  IN_USE: 'กำลังใช้งาน',
  MAINTENANCE: 'ซ่อมบำรุง',
  INACTIVE: 'ไม่ได้ใช้งาน',
};

interface FleetSummary {
  vehicles: Array<{ status: string; _count: { id: number } }>;
  drivers: Array<{ status: string; _count: { id: number } }>;
  activeTrips: number;
  pendingMaintenance: number;
}

export default function DashboardPage() {
  const [vehicleStats, setVehicleStats] = useState<VehicleStats | null>(null);
  const [fleetSummary, setFleetSummary] = useState<FleetSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/vehicles/stats'),
      api.get('/reports/fleet-summary'),
    ]).then(([statsRes, summaryRes]) => {
      setVehicleStats(statsRes.data.data);
      setFleetSummary(summaryRes.data.data);
    }).finally(() => setLoading(false));
  }, []);

  const pieData = vehicleStats
    ? [
        { name: STATUS_LABELS.AVAILABLE, value: vehicleStats.available, color: STATUS_COLORS.AVAILABLE },
        { name: STATUS_LABELS.IN_USE, value: vehicleStats.inUse, color: STATUS_COLORS.IN_USE },
        { name: STATUS_LABELS.MAINTENANCE, value: vehicleStats.maintenance, color: STATUS_COLORS.MAINTENANCE },
        { name: STATUS_LABELS.INACTIVE, value: vehicleStats.inactive, color: STATUS_COLORS.INACTIVE },
      ]
    : [];

  const driverBarData = fleetSummary?.drivers.map((d) => ({
    name: d.status,
    จำนวน: d._count.id,
  })) ?? [];

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-gray-500">กำลังโหลด...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">แดชบอร์ด</h2>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="ยานพาหนะทั้งหมด" value={vehicleStats?.total ?? 0} icon="🚗" color="blue" />
        <KpiCard title="พร้อมใช้งาน" value={vehicleStats?.available ?? 0} icon="✅" color="green" />
        <KpiCard title="กำลังเดินทาง" value={fleetSummary?.activeTrips ?? 0} icon="🗺️" color="orange" />
        <KpiCard title="รอซ่อมบำรุง" value={fleetSummary?.pendingMaintenance ?? 0} icon="🔧" color="red" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vehicle Status Pie */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">สถานะยานพาหนะ</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                {pieData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Driver Status Bar */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">สถานะผู้ขับขี่</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={driverBarData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="จำนวน" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ title, value, icon, color }: { title: string; value: number; icon: string; color: string }) {
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600',
    red: 'bg-red-50 text-red-600',
  };
  return (
    <div className="card flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${colorMap[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}
