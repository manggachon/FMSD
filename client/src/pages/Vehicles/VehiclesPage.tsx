import { useEffect, useState } from 'react';
import api from '../../services/api';
import { Vehicle } from '../../types';

const STATUS_BADGE: Record<string, string> = {
  AVAILABLE: 'badge-success',
  IN_USE: 'badge-info',
  MAINTENANCE: 'badge-warning',
  INACTIVE: 'badge-neutral',
};

const STATUS_LABEL: Record<string, string> = {
  AVAILABLE: 'พร้อมใช้งาน',
  IN_USE: 'กำลังใช้งาน',
  MAINTENANCE: 'ซ่อมบำรุง',
  INACTIVE: 'ไม่ได้ใช้งาน',
};

const TYPE_LABEL: Record<string, string> = {
  CAR: 'รถยนต์', VAN: 'รถตู้', TRUCK: 'รถบรรทุก', MOTORCYCLE: 'รถจักรยานยนต์', BUS: 'รถบัส',
};

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/vehicles').then((res) => {
      setVehicles(res.data.data);
    }).finally(() => setLoading(false));
  }, []);

  const filtered = vehicles.filter((v) =>
    v.licensePlate.toLowerCase().includes(search.toLowerCase()) ||
    v.brand.toLowerCase().includes(search.toLowerCase()) ||
    v.model.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">ยานพาหนะทั้งหมด</h2>
        <button className="btn-primary">+ เพิ่มยานพาหนะ</button>
      </div>

      {/* Search */}
      <div className="card p-4">
        <input
          type="text"
          placeholder="ค้นหาทะเบียน, ยี่ห้อ, รุ่น..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field max-w-sm"
        />
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">กำลังโหลด...</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">ทะเบียน</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">ยี่ห้อ/รุ่น</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">ประเภท</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">ระยะทาง (กม.)</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">สถานะ</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">ผู้ขับขี่ปัจจุบัน</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-400">ไม่พบข้อมูล</td>
                </tr>
              ) : (
                filtered.map((v) => (
                  <tr key={v.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{v.licensePlate}</td>
                    <td className="px-6 py-4 text-gray-600">{v.brand} {v.model} ({v.year})</td>
                    <td className="px-6 py-4 text-gray-600">{TYPE_LABEL[v.vehicleType] || v.vehicleType}</td>
                    <td className="px-6 py-4 text-gray-600">{v.mileage.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={STATUS_BADGE[v.status]}>{STATUS_LABEL[v.status]}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{v.currentDriver?.name || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
