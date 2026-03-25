// MOCK API Service - Replace endpoints when real backend is ready
// API Base URL: /api/v1

export interface POI {
  poi_id: string;
  name: string;
  type: 'major' | 'minor';
  category?: string;
  latitude: number;
  longitude: number;
  trigger_radius: number;
  priority: number;
  description_vi: string;
  description_en?: string;
  description_jp?: string;
  image_urls?: string[];
  audio_status: 'pending' | 'processing' | 'completed' | 'failed';
  qr_code_hash: string;
  created_at?: string;
  updated_at?: string;
}

// Mock data
const mockPOIs: POI[] = [
  {
    poi_id: 'poi-001',
    name: 'Quán Ốc Oanh',
    type: 'major',
    latitude: 10.7769,
    longitude: 106.6956,
    trigger_radius: 40,
    priority: 1,
    description_vi: 'Quán ốc nổi tiếng trên phố Vĩnh Khánh. Ốc buộc tươi ngon, giá tốt.',
    description_en: 'Famous snail restaurant at Vinh Khanh Street.',
    description_jp: 'ベトナム料理の有名なレストラン。',
    image_urls: [],
    audio_status: 'completed',
    qr_code_hash: 'qr-001-abc123',
  },
  {
    poi_id: 'poi-002',
    name: 'Bún Bò Huế Quốc Tuấn',
    type: 'major',
    latitude: 10.7775,
    longitude: 106.6965,
    trigger_radius: 35,
    priority: 2,
    description_vi: 'Bún bò Huế nổi tiếng với nước dùng đặc biệt.',
    description_en: 'Huế beef noodle soup with special broth.',
    audio_status: 'processing',
    qr_code_hash: 'qr-002-def456',
  },
  {
    poi_id: 'poi-003',
    name: 'Trạm xe buýt Xóm Chiếu',
    type: 'minor',
    category: 'ben_thuyen',
    latitude: 10.7760,
    longitude: 106.6940,
    trigger_radius: 30,
    priority: 5,
    description_vi: 'Trạm xe buýt Xóm Chiếu. Có biển QR code để quét.',
    audio_status: 'completed',
    qr_code_hash: 'qr-003-ghi789',
  },
];

export const poiService = {
  async getPOIs(page = 1, limit = 20, filters?: any) {
    // GET /api/v1/poi/load-all
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    let filtered = [...mockPOIs];

    // Apply filters
    if (filters?.search) {
      filtered = filtered.filter((poi) =>
        poi.name.toLowerCase().includes(filters.search.toLowerCase())
      );
    }
    if (filters?.type) {
      filtered = filtered.filter((poi) => poi.type === filters.type);
    }

    // Paginate
    const start = (page - 1) * limit;
    const end = start + limit;
    const data = filtered.slice(start, end);

    return { data, total: filtered.length };
  },

  async getPOIById(id: string) {
    // GET /api/v1/poi/:id
    await new Promise((resolve) => setTimeout(resolve, 200));
    const poi = mockPOIs.find((p) => p.poi_id === id);
    if (!poi) throw new Error('POI not found');
    return { data: poi };
  },

  async createPOI(poi: Omit<POI, 'poi_id' | 'qr_code_hash' | 'audio_status'>) {
    // POST /api/v1/poi
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const newPOI: POI = {
      ...poi,
      poi_id: 'poi-' + Date.now(),
      qr_code_hash: 'qr-' + Math.random().toString(36).substr(2, 9),
      audio_status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    mockPOIs.push(newPOI);
    // Simulate background task: generate audio
    setTimeout(() => {
      const idx = mockPOIs.findIndex((p) => p.poi_id === newPOI.poi_id);
      if (idx !== -1) {
        mockPOIs[idx].audio_status = 'completed';
      }
    }, 2000);

    return { data: newPOI };
  },

  async updatePOI(id: string, updates: Partial<POI>) {
    // PUT /api/v1/poi/:id
    await new Promise((resolve) => setTimeout(resolve, 400));

    const idx = mockPOIs.findIndex((p) => p.poi_id === id);
    if (idx === -1) throw new Error('POI not found');

    mockPOIs[idx] = {
      ...mockPOIs[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };

    return { data: mockPOIs[idx] };
  },

  async deletePOI(id: string) {
    // DELETE /api/v1/poi/:id
    await new Promise((resolve) => setTimeout(resolve, 300));

    const idx = mockPOIs.findIndex((p) => p.poi_id === id);
    if (idx === -1) throw new Error('POI not found');

    const poi = mockPOIs[idx];
    mockPOIs.splice(idx, 1);

    return { data: { success: true, deleted: poi } };
  },

  async getNearby(lat: number, lng: number, radius: number = 1000, lang: string = 'vi') {
    // GET /api/v1/poi/nearby
    // Simple distance calculation
    const nearby = mockPOIs.filter((poi) => {
      const dx = poi.latitude - lat;
      const dy = poi.longitude - lng;
      const distance = Math.sqrt(dx * dx + dy * dy) * 111000; // rough km to meter conversion
      return distance <= radius;
    });

    return { data: nearby };
  },

  async getByQR(hash: string) {
    // GET /api/v1/poi/by-qr
    const poi = mockPOIs.find((p) => p.qr_code_hash === hash);
    if (!poi) throw new Error('QR code not found');
    return { data: poi };
  },
};
