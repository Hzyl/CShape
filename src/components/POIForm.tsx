import { useState, useEffect } from 'react';
import { POI } from '@/services/poiService';

interface POIFormProps {
  poi?: POI | null;
  onSave: (poi: any) => void;
  onCancel: () => void;
}

export const POIForm = ({ poi, onSave, onCancel }: POIFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'major' as 'major' | 'minor',
    category: '',
    latitude: '',
    longitude: '',
    trigger_radius: '30',
    priority: '1',
    description_vi: '',
    description_en: '',
    description_jp: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (poi) {
      setFormData({
        name: poi.name,
        type: poi.type,
        category: poi.category || '',
        latitude: poi.latitude.toString(),
        longitude: poi.longitude.toString(),
        trigger_radius: poi.trigger_radius.toString(),
        priority: poi.priority.toString(),
        description_vi: poi.description_vi,
        description_en: poi.description_en || '',
        description_jp: poi.description_jp || '',
      });
    }
  }, [poi]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Tên không được trống';
    if (!formData.latitude) newErrors.latitude = 'Latitude không được trống';
    if (!formData.longitude) newErrors.longitude = 'Longitude không được trống';
    if (!formData.description_vi.trim()) newErrors.description_vi = 'Mô tả tiếng Việt không được trống';

    const lat = parseFloat(formData.latitude);
    const lng = parseFloat(formData.longitude);
    if (isNaN(lat) || lat < -90 || lat > 90) newErrors.latitude = 'Latitude không hợp lệ';
    if (isNaN(lng) || lng < -180 || lng > 180) newErrors.longitude = 'Longitude không hợp lệ';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    onSave({
      name: formData.name,
      type: formData.type,
      category: formData.category || undefined,
      latitude: parseFloat(formData.latitude),
      longitude: parseFloat(formData.longitude),
      trigger_radius: parseInt(formData.trigger_radius),
      priority: parseInt(formData.priority),
      description_vi: formData.description_vi,
      description_en: formData.description_en || undefined,
      description_jp: formData.description_jp || undefined,
    });
  };

  return (
    <>
      <div className="modal-backdrop" onClick={onCancel} />
      <div className="modal-content">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {poi ? 'Sửa POI' : 'Thêm POI mới'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Name */}
          <div className="form-group">
            <label className="form-label">Tên POI *</label>
            <input
              type="text"
              className="form-input"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
          </div>

          {/* Type & Category */}
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Loại *</label>
              <select
                className="form-select"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              >
                <option value="major">Chính (Major)</option>
                <option value="minor">Phụ (Minor)</option>
              </select>
            </div>
            {formData.type === 'minor' && (
              <div className="form-group">
                <label className="form-label">Danh mục</label>
                <select
                  className="form-select"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="">-- Chọn --</option>
                  <option value="wc">WC</option>
                  <option value="ban_ve">Bán vé</option>
                  <option value="gui_xe">Gửi xe</option>
                  <option value="ben_thuyen">Bến thuyền</option>
                </select>
              </div>
            )}
          </div>

          {/* Coordinates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Latitude *</label>
              <input
                type="number"
                step="0.0001"
                className="form-input"
                placeholder="10.7769"
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
              />
              {errors.latitude && <p className="text-red-500 text-sm">{errors.latitude}</p>}
            </div>
            <div className="form-group">
              <label className="form-label">Longitude *</label>
              <input
                type="number"
                step="0.0001"
                className="form-input"
                placeholder="106.6956"
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
              />
              {errors.longitude && <p className="text-red-500 text-sm">{errors.longitude}</p>}
            </div>
          </div>

          {/* Radius & Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Bán kính (m) *</label>
              <input
                type="number"
                min="1"
                className="form-input"
                value={formData.trigger_radius}
                onChange={(e) => setFormData({ ...formData, trigger_radius: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Độ ưu tiên (1-10) *</label>
              <input
                type="number"
                min="1"
                max="10"
                className="form-input"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              />
            </div>
          </div>

          {/* Descriptions */}
          <div className="form-group">
            <label className="form-label">Mô tả Tiếng Việt *</label>
            <textarea
              className="form-textarea"
              rows={4}
              value={formData.description_vi}
              onChange={(e) => setFormData({ ...formData, description_vi: e.target.value })}
            />
            {errors.description_vi && <p className="text-red-500 text-sm">{errors.description_vi}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Mô tả Tiếng Anh</label>
            <textarea
              className="form-textarea"
              rows={3}
              value={formData.description_en}
              onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Mô tả Tiếng Nhật</label>
            <textarea
              className="form-textarea"
              rows={3}
              value={formData.description_jp}
              onChange={(e) => setFormData({ ...formData, description_jp: e.target.value })}
            />
          </div>
        </form>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-end gap-2">
          <button className="btn btn-outline" onClick={onCancel}>
            Hủy
          </button>
          <button className="btn btn-primary" onClick={handleSubmit}>
            {poi ? 'Cập nhật' : 'Tạo POI'}
          </button>
        </div>
      </div>
    </>
  );
};
