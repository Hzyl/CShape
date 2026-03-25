import { useState } from 'react';
import Layout from '@/components/Layout';
import { poiService, POI } from '@/services/poiService';
import { showToast } from '@/components/Toast';

interface Tour {
  tour_id: string;
  name: string;
  description: string;
  pois: Array<{ poi_id: string; poi_name: string; order_index: number }>;
}

export default function TourManagementPage() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [allPOIs, setAllPOIs] = useState<POI[]>([]);
  const [tourForm, setTourForm] = useState({
    name: '',
    description: '',
    selectedPOIs: [] as { poi_id: string; poi_name: string; order_index: number }[],
  });
  const [searchPOI, setSearchPOI] = useState('');

  const handleOpenForm = async () => {
    setFormOpen(true);
    setLoading(true);
    try {
      const result = await poiService.getPOIs(1, 100);
      setAllPOIs(result.data);
    } catch (error) {
      showToast('Lỗi khi tải danh sách POI', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPOIToTour = (poi: POI) => {
    if (tourForm.selectedPOIs.find((p) => p.poi_id === poi.poi_id)) {
      showToast('POI này đã có trong tour', 'warning');
      return;
    }
    setTourForm({
      ...tourForm,
      selectedPOIs: [
        ...tourForm.selectedPOIs,
        {
          poi_id: poi.poi_id,
          poi_name: poi.name,
          order_index: tourForm.selectedPOIs.length,
        },
      ],
    });
  };

  const handleRemovePOIFromTour = (poiId: string) => {
    const updated = tourForm.selectedPOIs
      .filter((p) => p.poi_id !== poiId)
      .map((p, idx) => ({ ...p, order_index: idx }));
    setTourForm({ ...tourForm, selectedPOIs: updated });
  };

  const handleMovePOI = (index: number, direction: 'up' | 'down') => {
    const newList = [...tourForm.selectedPOIs];
    if (direction === 'up' && index > 0) {
      [newList[index], newList[index - 1]] = [newList[index - 1], newList[index]];
    } else if (direction === 'down' && index < newList.length - 1) {
      [newList[index], newList[index + 1]] = [newList[index + 1], newList[index]];
    }
    // Update order indices
    newList.forEach((p, idx) => (p.order_index = idx));
    setTourForm({ ...tourForm, selectedPOIs: newList });
  };

  const handleSaveTour = () => {
    if (!tourForm.name.trim()) {
      showToast('Tên tour không được trống', 'error');
      return;
    }
    if (tourForm.selectedPOIs.length === 0) {
      showToast('Tour phải có ít nhất 1 POI', 'error');
      return;
    }

    const newTour: Tour = {
      tour_id: 'tour-' + Date.now(),
      name: tourForm.name,
      description: tourForm.description,
      pois: tourForm.selectedPOIs,
    };

    setTours([...tours, newTour]);
    showToast('Tạo tour thành công!', 'success');

    // Reset form
    setTourForm({ name: '', description: '', selectedPOIs: [] });
    setFormOpen(false);
  };

  const filteredPOIs = allPOIs.filter((poi) =>
    poi.name.toLowerCase().includes(searchPOI.toLowerCase())
  );

  return (
    <Layout title="Quản lý Tour">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">
            Tours ({tours.length})
          </h3>
          <button
            className="btn btn-primary"
            onClick={handleOpenForm}
          >
            + Tạo Tour mới
          </button>
        </div>

        {/* Tours List */}
        {tours.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-600">Chưa có tour nào</p>
            <p className="text-sm text-gray-500">Nhấn "+ Tạo Tour mới" để bắt đầu</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {tours.map((tour) => (
              <div key={tour.tour_id} className="card">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">{tour.name}</h4>
                    <p className="text-sm text-gray-600">{tour.description}</p>
                  </div>
                  <span className="badge badge-info">{tour.pois.length} POI</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {tour.pois.map((poi, idx) => (
                    <span
                      key={poi.poi_id}
                      className="badge badge-success"
                    >
                      {idx + 1}. {poi.poi_name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tour Form Modal */}
        {formOpen && (
          <>
            <div className="modal-backdrop" onClick={() => setFormOpen(false)} />
            <div className="modal-content">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">Tạo Tour mới</h2>
              </div>

              <div className="p-6 gap-6 flex overflow-hidden" style={{ height: 'calc(90vh - 140px)' }}>
                {/* Left: Tour Info + POI List */}
                <div className="w-1/2 flex flex-col gap-4 overflow-y-auto">
                  <div className="form-group">
                    <label className="form-label">Tên Tour *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={tourForm.name}
                      onChange={(e) => setTourForm({ ...tourForm, name: e.target.value })}
                      placeholder="VD: Tour Ẩm thực Vĩnh Khánh"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Mô tả</label>
                    <textarea
                      className="form-textarea"
                      rows={3}
                      value={tourForm.description}
                      onChange={(e) => setTourForm({ ...tourForm, description: e.target.value })}
                      placeholder="Mô tả tour..."
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Tìm POI để thêm vào tour</label>
                    <input
                      type="text"
                      className="form-input"
                      value={searchPOI}
                      onChange={(e) => setSearchPOI(e.target.value)}
                      placeholder="Tìm kiếm..."
                    />
                  </div>

                  <div className="border border-gray-200 rounded overflow-y-auto flex-1">
                    {loading ? (
                      <div className="p-4 text-center text-gray-500">Đang tải...</div>
                    ) : filteredPOIs.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">Không tìm thấy POI</div>
                    ) : (
                      filteredPOIs.map((poi) => (
                        <div
                          key={poi.poi_id}
                          className="p-3 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 flex justify-between items-center"
                        >
                          <div>
                            <p className="font-medium text-gray-900">{poi.name}</p>
                            <p className="text-xs text-gray-500">{poi.type === 'major' ? 'Chính' : 'Phụ'}</p>
                          </div>
                          <button
                            className="btn btn-primary px-2 py-1 text-sm"
                            onClick={() => handleAddPOIToTour(poi)}
                            disabled={tourForm.selectedPOIs.some((p) => p.poi_id === poi.poi_id)}
                          >
                            +
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Right: Selected POIs in Order */}
                <div className="w-1/2 flex flex-col gap-4 overflow-hidden">
                  <div>
                    <label className="form-label">POI đã chọn ({tourForm.selectedPOIs.length})</label>
                    <p className="text-sm text-gray-600">Kéo để sắp xếp thứ tự</p>
                  </div>

                  <div className="border border-gray-200 rounded overflow-y-auto flex-1">
                    {tourForm.selectedPOIs.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">Chưa chọn POI nào</div>
                    ) : (
                      tourForm.selectedPOIs.map((poi, idx) => (
                        <div
                          key={poi.poi_id}
                          className="p-3 border-b border-gray-200 last:border-b-0 bg-blue-50 hover:bg-blue-100"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">
                                {idx + 1}. {poi.poi_name}
                              </p>
                            </div>
                            <div className="flex gap-1">
                              <button
                                className="btn btn-outline px-2 py-1 text-xs"
                                disabled={idx === 0}
                                onClick={() => handleMovePOI(idx, 'up')}
                              >
                                ↑
                              </button>
                              <button
                                className="btn btn-outline px-2 py-1 text-xs"
                                disabled={idx === tourForm.selectedPOIs.length - 1}
                                onClick={() => handleMovePOI(idx, 'down')}
                              >
                                ↓
                              </button>
                              <button
                                className="btn px-2 py-1 text-xs bg-red-100 text-red-700"
                                onClick={() => handleRemovePOIFromTour(poi.poi_id)}
                              >
                                ×
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-gray-200 flex justify-end gap-2">
                <button
                  className="btn btn-outline"
                  onClick={() => setFormOpen(false)}
                >
                  Hủy
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleSaveTour}
                >
                  Tạo Tour
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
