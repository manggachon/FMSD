import { useEffect, useState } from 'react';
import api from '../../services/api';
import { Trip } from '../../types';

const STATUS_BADGE: Record<string, string> = {
  SCHEDULED: 'badge-info',
  IN_PROGRESS: 'badge-warning',
  COMPLETED: 'badge-success',
  CANCELLED: 'badge-neutral',
};

const STATUS_LABEL: Record<string, string> = {
  SCHEDULED: 'กำหนดการ',
  IN_PROGRESS: 'กำลังเดินทาง',
  COMPLETED: 'เสร็จสิ้น',
  CANCELLED: 'ยกเลิก',
};

export default function TripsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/trips').then((res) => setTrips(res.data.data)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">การเดินทาง</h2>
        <button className="btn-primary">+ สร้างการเดินทาง</button>
      </div>

      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">กำลังโหลด...</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">ต้นทาง → ปลายทาง</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">ยานพาหนะ</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">ผู้ขับขี่</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">ออกเดินทาง</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">ระยะทาง (กม.)</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {trips.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-400">ไม่พบข้อมูล</td>
                </tr>
              ) : (
                trips.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{t.origin}</p>
                      <p className="text-sm text-gray-500">→ {t.destination}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {t.vehicle.brand} {t.vehicle.model}
                      <br /><span className="text-xs">{t.vehicle.licensePlate}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{t.driver.name}</td>
                    <td className="px-6 py-4 text-gray-600 text-sm">
                      {new Date(t.scheduledStart).toLocaleString('th-TH')}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{t.distance ? t.distance.toFixed(1) : '-'}</td>
                    <td className="px-6 py-4">
                      <span className={STATUS_BADGE[t.status]}>{STATUS_LABEL[t.status]}</span>
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
