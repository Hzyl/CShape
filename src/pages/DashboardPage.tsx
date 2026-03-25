import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { showToast } from '@/components/Toast';

interface DashboardData {
  total_plays: number;
  unique_sessions: number;
  avg_duration: number;
  top_poi_name: string;
}

interface TopPOI {
  poi_id: string;
  name: string;
  play_count: number;
}

const mockDashboardData: DashboardData = {
  total_plays: 1250,
  unique_sessions: 342,
  avg_duration: 145,
  top_poi_name: 'Quán Ốc Oanh',
};

const mockTopPOIs: TopPOI[] = [
  { poi_id: 'poi-001', name: 'Quán Ốc Oanh', play_count: 450 },
  { poi_id: 'poi-002', name: 'Bún Bò Huế Quốc Tuấn', play_count: 380 },
  { poi_id: 'poi-003', name: 'Trạm xe buýt Xóm Chiếu', play_count: 220 },
];

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [topPOIs, setTopPOIs] = useState<TopPOI[]>([]);
  const [period, setPeriod] = useState('7d');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, [period]);

  const loadData = async () => {
    setLoading(true);
    // Simulate network call
    await new Promise((resolve) => setTimeout(resolve, 500));
    setData(mockDashboardData);
    setTopPOIs(mockTopPOIs);
    setLoading(false);
  };

  return (
    <Layout title="Analytics Dashboard">
      <div className="space-y-6">
        {/* Time Filter */}
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Thống kê</h3>
          <select
            className="form-select w-48"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          >
            <option value="today">Hôm nay</option>
            <option value="7d">7 ngày qua</option>
            <option value="30d">30 ngày qua</option>
            <option value="custom">Tùy chỉnh</option>
          </select>
        </div>

        {/* KPI Cards */}
        {loading ? (
          <div className="grid grid-cols-4 gap-4">
            {[1,2,3,4].map((i) => (
              <div key={i} className="card h-32 bg-gray-200 animate-pulse" />
            ))}
          </div>
        ) : data ? (
          <div className="grid grid-cols-4 gap-4">
            <KPICard
              title="Tổng lượt phát"
              value={data.total_plays.toString()}
              icon="🎵"
            />
            <KPICard
              title="Người dùng hoạt động"
              value={data.unique_sessions.toString()}
              icon="👥"
            />
            <KPICard
              title="Thời gian nghe (giây)"
              value={data.avg_duration.toString()}
              icon="⏱️"
            />
            <KPICard
              title="POI hàng đầu"
              value={data.top_poi_name}
              icon="⭐"
            />
          </div>
        ) : null}

        {/* Top POIs Table */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top 10 POI được nghe nhiều nhất</h3>
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Xếp hạng</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Tên POI</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Lượt phát</th>
              </tr>
            </thead>
            <tbody>
              {topPOIs.map((poi, idx) => (
                <tr key={poi.poi_id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">#{idx + 1}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{poi.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{poi.play_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Placeholder for Heatmap */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Heatmap di chuyển người dùng</h3>
          <div className="h-96 bg-gray-100 rounded flex items-center justify-center text-gray-500">
            <div className="text-center">
              <p>🗺️ Heatmap Placeholder</p>
              <p className="text-sm text-gray-400">Cần cấu hình Google Maps API</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

interface KPICardProps {
  title: string;
  value: string;
  icon: string;
}

function KPICard({ title, value, icon }: KPICardProps) {
  return (
    <div className="card bg-white">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <span className="text-3xl">{icon}</span>
      </div>
    </div>
  );
}
