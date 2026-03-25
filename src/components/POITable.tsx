import { POI } from '@/services/poiService';

interface POITableProps {
  pois: POI[];
  loading: boolean;
  onEdit: (poi: POI) => void;
  onDelete: (poi: POI) => void;
}

export const POITable = ({ pois, loading, onEdit, onDelete }: POITableProps) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (pois.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-gray-600">Không có POI nào</p>
          <p className="text-sm text-gray-500">Nhấn "+ Thêm POI" để tạo mới</p>
        </div>
      </div>
    );
  }

  return (
    <table className="w-full">
      <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
        <tr>
          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Tên</th>
          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Loại</th>
          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Tọa độ</th>
          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Audio</th>
          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Hành động</th>
        </tr>
      </thead>
      <tbody>
        {pois.map((poi) => (
          <tr key={poi.poi_id} className="border-b border-gray-200 hover:bg-gray-50">
            <td className="px-4 py-3 text-sm font-medium text-gray-900">{poi.name}</td>
            <td className="px-4 py-3 text-sm">
              <span className={`badge ${poi.type === 'major' ? 'badge-info' : 'badge-success'}`}>
                {poi.type === 'major' ? 'Chính' : 'Phụ'}
              </span>
            </td>
            <td className="px-4 py-3 text-sm text-gray-600">
              ({poi.latitude.toFixed(4)}, {poi.longitude.toFixed(4)})
            </td>
            <td className="px-4 py-3 text-sm">
              <span className={`badge badge-${
                poi.audio_status === 'completed' ? 'success' :
                poi.audio_status === 'processing' ? 'warning' :
                poi.audio_status === 'failed' ? 'danger' : 'info'
              }`}>
                {poi.audio_status === 'completed' ? '✓ Hoàn tất' :
                 poi.audio_status === 'processing' ? '⟳ Đang xử lý' :
                 poi.audio_status === 'failed' ? '✗ Lỗi' : '○ Chờ'}
              </span>
            </td>
            <td className="px-4 py-3 text-sm space-x-2">
              <button
                className="btn btn-outline px-3 py-1 text-xs"
                onClick={() => onEdit(poi)}
              >
                Sửa
              </button>
              <button
                className="btn px-3 py-1 text-xs bg-red-100 text-red-700 hover:bg-red-200"
                onClick={() => onDelete(poi)}
              >
                Xóa
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
