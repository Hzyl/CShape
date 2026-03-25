import { useState, useEffect } from 'react';
import { POI, poiService } from '@/services/poiService';
import { POITable } from '@/components/POITable';
import { POIMap } from '@/components/POIMap';
import { POIForm } from '@/components/POIForm';
import { showToast } from '@/components/Toast';
import Layout from '@/components/Layout';

export default function POIManagementPage() {
  const [pois, setPOIs] = useState<POI[]>([]);
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedPOI, setSelectedPOI] = useState<POI | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'major' | 'minor'>('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const LIMIT = 20;

  useEffect(() => {
    loadPOIs();
  }, [page, searchTerm, typeFilter]);

  const loadPOIs = async () => {
    setLoading(true);
    try {
      const filters = {
        search: searchTerm || undefined,
        type: typeFilter === 'all' ? undefined : typeFilter,
      };
      const result = await poiService.getPOIs(page, LIMIT, filters);
      setPOIs(result.data);
      setTotal(result.total);
    } catch (error) {
      showToast('Lỗi khi tải danh sách POI', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPOI = () => {
    setSelectedPOI(null);
    setFormOpen(true);
  };

  const handleEditPOI = (poi: POI) => {
    setSelectedPOI(poi);
    setFormOpen(true);
  };

  const handleSavePOI = async (poi: any) => {
    try {
      if (selectedPOI) {
        await poiService.updatePOI(selectedPOI.poi_id, poi);
        showToast('Cập nhật POI thành công!', 'success');
      } else {
        await poiService.createPOI(poi);
        showToast('Tạo POI thành công!', 'success');
      }
      setFormOpen(false);
      setSelectedPOI(null);
      loadPOIs();
    } catch (error) {
      showToast((error as any).message || 'Lỗi khi lưu POI', 'error');
    }
  };

  const handleDeletePOI = async (poi: POI) => {
    if (window.confirm(`Bạn chắc chắn muốn xóa "${poi.name}"?`)) {
      try {
        await poiService.deletePOI(poi.poi_id);
        showToast('Xóa POI thành công!', 'success');
        loadPOIs();
      } catch (error) {
        showToast('Lỗi khi xóa POI', 'error');
      }
    }
  };

  return (
    <Layout title="Quản lý POI">
      <div className="flex gap-6 h-[calc(100vh-100px)]">
        {/* Left: POI List & Form */}
        <div className="w-1/2 flex flex-col overflow-hidden">
          {/* Controls */}
          <div className="bg-white p-4 border-b border-gray-200 space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                className="form-input flex-1"
                placeholder="Tìm kiếm POI..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
              />
              <select
                className="form-select w-32"
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value as any);
                  setPage(1);
                }}
              >
                <option value="all">Tất cả loại</option>
                <option value="major">Chính</option>
                <option value="minor">Phụ</option>
              </select>
              <button className="btn btn-primary" onClick={handleAddPOI}>
                + Thêm POI
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-y-auto bg-white">
            <POITable
              pois={pois}
              loading={loading}
              onEdit={handleEditPOI}
              onDelete={handleDeletePOI}
            />
          </div>

          {/* Pagination */}
          {!loading && (
            <div className="bg-white p-4 border-t border-gray-200 flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Showing {(page - 1) * LIMIT + 1} to {Math.min(page * LIMIT, total)} of {total}
              </div>
              <div className="space-x-2">
                <button
                  className="btn btn-outline"
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                >
                  Trước
                </button>
                <button
                  className="btn btn-outline"
                  disabled={page * LIMIT >= total}
                  onClick={() => setPage(p => p + 1)}
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right: Map & Form Modal */}
        <div className="w-1/2 flex flex-col overflow-hidden">
          <POIMap
            pois={pois}
            selectedPOI={selectedPOI}
            onLocationSelect={(lat, lng) => {
              // Update form with clicked location
              console.log('Map clicked:', lat, lng);
            }}
          />
        </div>
      </div>

      {/* POI Form Modal */}
      {formOpen && (
        <POIForm
          poi={selectedPOI}
          onSave={handleSavePOI}
          onCancel={() => {
            setFormOpen(false);
            setSelectedPOI(null);
          }}
        />
      )}
    </Layout>
  );
}
