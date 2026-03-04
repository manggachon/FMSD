import { useEffect, useState } from 'react';
import api from '../../services/api';
import { Driver } from '../../types';

const STATUS_BADGE: Record<string, string> = {
  ACTIVE: 'badge-success',
  INACTIVE: 'badge-neutral',
  ON_LEAVE: 'badge-warning',
  SUSPENDED: 'badge-danger',
};

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: 'ปฏิบัติงาน',
  INACTIVE: 'ไม่ได้ปฏิบัติงาน',
  ON_LEAVE: 'ลาพักงาน',
  SUSPENDED: 'ถูกระงับ',
};

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/drivers').then((res) => setDrivers(res.data.data)).finally(() => setLoading(false));
  }, []);

  const filtered = drivers.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.employeeId.toLowerCase().includes(search.toLowerCase())
  );

  const isLicenseExpiringSoon = (expiry: string) => {
    const days = (new Date(expiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return days <= 90;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">ผู้ขับขี่ทั้งหมด</h2>
        <button className="btn-primary">+ เพิ่มผู้ขับขี่</button>
      </div>

      <div className="card p-4">
        <input
          type="text"
          placeholder="ค้นหาชื่อ, รหัสพนักงาน..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field max-w-sm"
        />
      </div>

      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">กำลังโหลด...</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">รหัสพนักงาน</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">ชื่อ</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">โทรศัพท์</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">ใบขับขี่</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">วันหมดอายุ</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">สถานะ</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">ยานพาหนะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-400">ไม่พบข้อมูล</td>
                </tr>
              ) : (
                filtered.map((d) => (
                  <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{d.employeeId}</td>
                    <td className="px-6 py-4 text-gray-900">{d.name}</td>
                    <td className="px-6 py-4 text-gray-600">{d.phone}</td>
                    <td className="px-6 py-4 text-gray-600">ประเภท {d.licenseType} ({d.licenseNumber})</td>
                    <td className="px-6 py-4">
                      <span className={isLicenseExpiringSoon(d.licenseExpiry) ? 'text-red-600 font-medium' : 'text-gray-600'}>
                        {new Date(d.licenseExpiry).toLocaleDateString('th-TH')}
                        {isLicenseExpiringSoon(d.licenseExpiry) && ' ⚠️'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={STATUS_BADGE[d.status]}>{STATUS_LABEL[d.status]}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {d.currentVehicle ? `${d.currentVehicle.brand} ${d.currentVehicle.model} (${d.currentVehicle.licensePlate})` : '-'}
                    </td>
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
