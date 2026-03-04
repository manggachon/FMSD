import { useEffect, useState } from 'react';
import api from '../../services/api';
import { MaintenanceRecord } from '../../types';

const STATUS_BADGE: Record<string, string> = {
  SCHEDULED: 'badge-info',
  IN_PROGRESS: 'badge-warning',
  COMPLETED: 'badge-success',
  CANCELLED: 'badge-neutral',
};

const TYPE_LABEL: Record<string, string> = {
  ROUTINE: 'บำรุงตามระยะ',
  REPAIR: 'ซ่อมแซม',
  INSPECTION: 'ตรวจสอบ',
  EMERGENCY: 'ฉุกเฉิน',
};

export default function MaintenancePage() {
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [upcoming, setUpcoming] = useState<MaintenanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/maintenance'),
      api.get('/maintenance/upcoming'),
    ]).then(([allRes, upcomingRes]) => {
      setRecords(allRes.data.data);
      setUpcoming(upcomingRes.data.data);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">การซ่อมบำรุง</h2>
        <button className="btn-primary">+ สร้างรายการซ่อมบำรุง</button>
      </div>

      {/* Upcoming Alert */}
      {upcoming.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">⚠️ กำหนดซ่อมบำรุงใน 30 วัน ({upcoming.length} รายการ)</h3>
          <div className="space-y-1">
            {upcoming.slice(0, 3).map((r) => (
              <p key={r.id} className="text-sm text-yellow-700">
                • {r.vehicle.licensePlate} — {r.description} ({new Date(r.scheduledDate).toLocaleDateString('th-TH')})
              </p>
            ))}
            {upcoming.length > 3 && <p className="text-sm text-yellow-600">...และอีก {upcoming.length - 3} รายการ</p>}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">กำลังโหลด...</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">ยานพาหนะ</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">ประเภท</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">รายละเอียด</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">วันที่กำหนด</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">ค่าใช้จ่าย (บาท)</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {records.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-400">ไม่พบข้อมูล</td>
                </tr>
              ) : (
                records.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-gray-900">
                      {r.vehicle.brand} {r.vehicle.model}
                      <br /><span className="text-xs text-gray-500">{r.vehicle.licensePlate}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{TYPE_LABEL[r.type]}</td>
                    <td className="px-6 py-4 text-gray-600 max-w-xs truncate">{r.description}</td>
                    <td className="px-6 py-4 text-gray-600 text-sm">
                      {new Date(r.scheduledDate).toLocaleDateString('th-TH')}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {r.actualCost ? r.actualCost.toLocaleString() : (r.estimatedCost ? `~${r.estimatedCost.toLocaleString()}` : '-')}
                    </td>
                    <td className="px-6 py-4">
                      <span className={STATUS_BADGE[r.status]}>{r.status}</span>
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
