import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../services/api';

interface FuelReport {
  _sum: { fuelUsed: number | null; distance: number | null };
  _avg: { fuelUsed: number | null };
  _count: { id: number };
}

interface CostReport {
  summary: { _sum: { actualCost: number | null; estimatedCost: number | null }; _count: { id: number } };
  byType: Array<{ type: string; _sum: { actualCost: number | null }; _count: { id: number } }>;
}

export default function ReportsPage() {
  const [fuelReport, setFuelReport] = useState<FuelReport | null>(null);
  const [costReport, setCostReport] = useState<CostReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/reports/fuel'),
      api.get('/reports/maintenance-cost'),
    ]).then(([fuelRes, costRes]) => {
      setFuelReport(fuelRes.data.data);
      setCostReport(costRes.data.data);
    }).finally(() => setLoading(false));
  }, []);

  const costByTypeData = costReport?.byType.map((item) => ({
    name: item.type,
    ค่าใช้จ่าย: item._sum.actualCost ?? 0,
    จำนวน: item._count.id,
  })) ?? [];

  if (loading) return <div className="p-8 text-center text-gray-500">กำลังโหลด...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">รายงานและวิเคราะห์</h2>

      {/* Summary KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card text-center">
          <p className="text-sm text-gray-500 mb-1">การเดินทางทั้งหมด</p>
          <p className="text-3xl font-bold text-primary-600">{fuelReport?._count.id ?? 0}</p>
          <p className="text-xs text-gray-400">เที่ยว</p>
        </div>
        <div className="card text-center">
          <p className="text-sm text-gray-500 mb-1">ระยะทางรวม</p>
          <p className="text-3xl font-bold text-green-600">
            {(fuelReport?._sum.distance ?? 0).toLocaleString()}
          </p>
          <p className="text-xs text-gray-400">กิโลเมตร</p>
        </div>
        <div className="card text-center">
          <p className="text-sm text-gray-500 mb-1">ค่าซ่อมบำรุงรวม</p>
          <p className="text-3xl font-bold text-orange-600">
            {(costReport?.summary._sum.actualCost ?? 0).toLocaleString()}
          </p>
          <p className="text-xs text-gray-400">บาท</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">ค่าซ่อมบำรุงตามประเภท</h3>
          {costByTypeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={costByTypeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`${Number(value).toLocaleString()} บาท`]} />
                <Bar dataKey="ค่าใช้จ่าย" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-400">ยังไม่มีข้อมูล</div>
          )}
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">สรุปข้อมูลเชื้อเพลิง</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <span className="text-sm text-blue-700">เชื้อเพลิงที่ใช้ทั้งหมด</span>
              <span className="font-bold text-blue-900">{(fuelReport?._sum.fuelUsed ?? 0).toFixed(1)} ลิตร</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <span className="text-sm text-green-700">เฉลี่ยต่อเที่ยว</span>
              <span className="font-bold text-green-900">{(fuelReport?._avg.fuelUsed ?? 0).toFixed(1)} ลิตร</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
              <span className="text-sm text-purple-700">ระยะทางรวม</span>
              <span className="font-bold text-purple-900">{(fuelReport?._sum.distance ?? 0).toFixed(1)} กม.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
