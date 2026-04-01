/**
 * Audio Manager - Quản lý TTS và hàng chờ audio
 * Hỗ trợ Web Speech API TTS đa ngôn ngữ
 */
class AudioManager {
    constructor() {
        this.queue = [];
        this.currentItem = null;
        this.isPlaying = false;
        this.isPaused = false;
        this.utterance = null;
        this.playedPoiIds = new Set();
        this.cooldownMap = new Map();
        this.cooldownDuration = 30000;
        this.currentLanguage = 'vi';
        this.onStateChange = null;
        this.onProgressUpdate = null;
        this.startTime = null;
        this.voiceCache = {}; // Cache voice đã chọn cho mỗi ngôn ngữ
        this.voicesReady = false;

        this.langMap = {
            'vi': 'vi-VN',
            'en': 'en-US',
            'ja': 'ja-JP',
            'zh': 'zh-CN'
        };

        // Khởi tạo Speech Synthesis
        this.synth = window.speechSynthesis;
        
        if (this.synth) {
            // Dừng mọi audio cũ khi khởi tạo
            this.synth.cancel();
            
            this.synth.onvoiceschanged = () => {
                this._loadVoices();
            };
            this._loadVoices();
            
            // Retry load voices vì Chrome cần thời gian load online voices
            setTimeout(() => this._loadVoices(), 500);
            setTimeout(() => this._loadVoices(), 2000);
        }
    }

    /** Trả về snapshot trạng thái hiện tại — dùng để re-sync UI */
    getState() {
        return {
            isPlaying: this.isPlaying,
            isPaused: this.isPaused,
            currentItem: this.currentItem
        };
    }

    _loadVoices() {
        const newVoices = this.synth.getVoices();
        if (newVoices.length === 0) return;
        
        // Chỉ update nếu có voices mới
        if (newVoices.length !== (this.voices || []).length) {
            this.voices = newVoices;
            this.voiceCache = {}; // Clear cache khi voices thay đổi
            this.voicesReady = true;
            
            console.log(`🔊 ${this.voices.length} voices loaded`);
            
            // Log tất cả Vietnamese voices
            const viVoices = this.voices.filter(v => v.lang.startsWith('vi'));
            if (viVoices.length > 0) {
                console.log('🇻🇳 Vietnamese voices:');
                viVoices.forEach((v, i) => {
                    const type = v.localService ? 'LOCAL' : 'ONLINE';
                    console.log(`  ${i+1}. "${v.name}" [${v.lang}] (${type})`);
                });
            } else {
                console.warn('⚠️ Không tìm thấy giọng tiếng Việt!');
            }
        }
    }

    /**
     * Tìm voice chất lượng tốt nhất cho ngôn ngữ
     * Cache kết quả để không cần tìm lại mỗi lần phát
     */
    _getVoice(lang) {
        // Trả về cache nếu đã có
        if (this.voiceCache[lang]) {
            return this.voiceCache[lang];
        }
        
        const langCode = this.langMap[lang] || 'vi-VN';
        const voices = this.voices || [];
        if (voices.length === 0) return null;
        
        // Tìm candidates - mở rộng matching
        let candidates = voices.filter(v => v.lang === langCode);
        
        // Fallback: tìm theo prefix (vi -> vi-VN, vi-VI, etc.)
        if (candidates.length === 0) {
            const prefix = lang.substring(0, 2).toLowerCase();
            candidates = voices.filter(v => v.lang.toLowerCase().startsWith(prefix));
        }
        
        // Fallback 2: tìm theo tên voice có chứa ngôn ngữ
        if (candidates.length === 0) {
            const langNames = {
                'vi': ['vietnam', 'tiếng việt', 'vietnamese'],
                'en': ['english'],
                'ja': ['japan', '日本語', 'japanese'],
                'zh': ['chinese', '中文', 'mandarin']
            };
            const names = langNames[lang] || [];
            candidates = voices.filter(v => {
                const vname = v.name.toLowerCase();
                return names.some(n => vname.includes(n));
            });
        }
        
        if (candidates.length === 0) return null; // KHÔNG cache null để retry được
        
        // Chấm điểm
        const scored = candidates.map(v => {
            let score = 0;
            const name = v.name.toLowerCase();
            
            if (!v.localService) score += 100;
            if (name.includes('google')) score += 80;
            if (name.includes('microsoft') && !v.localService) score += 60;
            if (name.includes('neural')) score += 50;
            if (name.includes('online')) score += 40;
            if (name.includes('premium')) score += 45;
            if (name.includes('natural')) score += 45;
            if (name.includes('wavenet')) score += 40;
            if (name.includes('female') || name.includes('nữ')) score += 15;
            if (name.includes('hoaimy') || name.includes('anhan')) score += 10;
            if (name.includes('edge')) score += 20;
            if (name.includes('espeak')) score -= 50;
            if (name.includes('mbrola')) score -= 40;
            
            return { voice: v, score, name: v.name, local: v.localService };
        });
        
        scored.sort((a, b) => b.score - a.score);
        
        const best = scored[0];
        console.log(`🎤 Selected ${lang} voice: "${best.name}" [${best.voice.lang}] (score: ${best.score}, ${best.local ? 'local' : 'online'})`);
        if (scored.length > 1) {
            console.log(`   Alternatives: ${scored.slice(1, 3).map(s => `"${s.name}" (${s.score})`).join(', ')}`);
        }
        
        // Cache kết quả (chỉ cache khi tìm được)
        this.voiceCache[lang] = best.voice;
        return best.voice;
    }

    /**
     * Thêm vào hàng chờ
     * @param {string} poiId - ID của POI
     * @param {string} text - Nội dung TTS
     * @param {string} title - Tên hiển thị
     * @param {number} priority - Ưu tiên (1 = cao nhất)
     * @param {boolean} isUrgent - Thông báo khẩn
     */
    enqueue(poiId, text, title, priority = 5, isUrgent = false) {
        // Kiểm tra cooldown
        if (this.cooldownMap.has(poiId)) {
            const lastPlayed = this.cooldownMap.get(poiId);
            if (Date.now() - lastPlayed < this.cooldownDuration) {
                console.log(`⏱️ POI ${poiId} đang trong cooldown`);
                return false;
            }
        }

        // Kiểm tra trùng lặp trong queue
        if (this.queue.some(item => item.poiId === poiId) || 
            (this.currentItem && this.currentItem.poiId === poiId)) {
            console.log(`🔄 POI ${poiId} đã có trong hàng chờ`);
            return false;
        }

        const item = { poiId, text, title, priority, isUrgent, addedAt: Date.now() };

        if (isUrgent) {
            // Thông báo khẩn: dừng hiện tại và phát ngay
            this.stop();
            this.queue.unshift(item);
        } else {
            // Thêm vào queue theo priority
            const insertIndex = this.queue.findIndex(q => q.priority > priority);
            if (insertIndex === -1) {
                this.queue.push(item);
            } else {
                this.queue.splice(insertIndex, 0, item);
            }
        }

        // Tự động phát nếu không đang phát
        if (!this.isPlaying) {
            this._playNext();
        }

        return true;
    }

    /**
     * Phát trực tiếp một POI (từ nút bấm)
     */
    playDirect(poiId, text, title) {
        this.stop();
        this.cooldownMap.delete(poiId); // Bỏ cooldown khi phát thủ công
        this.queue = [];
        this.enqueue(poiId, text, title, 1);
    }

    /**
     * Phát item tiếp theo trong queue
     */
    _playNext() {
        if (this.queue.length === 0) {
            this.isPlaying = false;
            this.currentItem = null;
            this._notifyStateChange();
            return;
        }

        this.currentItem = this.queue.shift();
        this.isPlaying = true;
        this.isPaused = false;
        this.startTime = Date.now();

        this._speak(this.currentItem.text, this.currentLanguage);
        this._notifyStateChange();
    }

    /**
     * Phát TTS - tự động điều chỉnh tham số theo chất lượng voice
     */
    _speak(text, lang) {
        if (!this.synth) {
            console.error('❌ Trình duyệt không hỗ trợ Speech Synthesis');
            this._playNext();
            return;
        }

        // Cancel bất kỳ utterance nào đang phát
        this.synth.cancel();

        // Force reload voices mỗi lần phát để đảm bảo có voices mới nhất
        const freshVoices = this.synth.getVoices();
        if (freshVoices.length > 0) {
            this.voices = freshVoices;
        }

        this.utterance = new SpeechSynthesisUtterance(text);
        const langCode = this.langMap[lang] || 'vi-VN';
        this.utterance.lang = langCode;
        this.utterance.volume = 1;

        // Tìm voice tốt nhất
        let voice = this._getVoice(lang);
        
        // Nếu không tìm thấy, thử mở rộng tìm kiếm
        if (!voice && this.voices && this.voices.length > 0) {
            console.warn(`⚠️ Không tìm thấy voice cho "${lang}", đang tìm kiếm mở rộng...`);
            
            // Thử tìm bất kỳ voice nào có lang chứa mã ngôn ngữ
            const langPrefix = lang.substring(0, 2);
            voice = this.voices.find(v => v.lang.toLowerCase().includes(langPrefix));
            
            if (voice) {
                console.log(`✅ Tìm thấy voice mở rộng: "${voice.name}" [${voice.lang}]`);
            } else {
                // Log tất cả voices để debug
                console.warn('📋 Tất cả voices có sẵn:');
                this.voices.forEach((v, i) => {
                    console.log(`  ${i+1}. "${v.name}" [${v.lang}] ${v.localService ? 'local' : 'online'}`);
                });
            }
        }

        if (voice) {
            this.utterance.voice = voice;
            
            const name = voice.name.toLowerCase();
            const isGoogle = name.includes('google');
            const isMicrosoftNeural = name.includes('microsoft') && (name.includes('neural') || name.includes('online') || !voice.localService);
            
            if (isGoogle) {
                this.utterance.rate = (lang === 'vi') ? 0.85 : 0.9;
                this.utterance.pitch = 1.0;
            } else if (isMicrosoftNeural || !voice.localService) {
                this.utterance.rate = (lang === 'vi') ? 0.9 : 0.95;
                this.utterance.pitch = 1.0;
            } else {
                this.utterance.rate = (lang === 'vi') ? 0.75 : 0.8;
                this.utterance.pitch = 1.05;
            }
            
            console.log(`🔈 Playing [${lang}] with voice: "${voice.name}" [${voice.lang}] rate=${this.utterance.rate}`);
            
            // Kiểm tra voice có đúng ngôn ngữ không
            const voiceLang = voice.lang.toLowerCase().substring(0, 2);
            const requestedLang = lang.substring(0, 2).toLowerCase();
            if (voiceLang !== requestedLang) {
                console.warn(`⚠️ Voice "${voice.name}" [${voice.lang}] không khớp ngôn ngữ ${lang}!`);
                this.voiceCache = {};
                // Vẫn phát nhưng dùng utterance.lang thay vì voice sai
                this.utterance.voice = null;
                this._showVoiceInstallGuide(lang);
            }
        } else {
            // Không có voice - vẫn phát bằng utterance.lang (browser sẽ cố tìm voice phù hợp)
            this.utterance.rate = 0.85;
            this.utterance.pitch = 1.0;
            console.warn(`⚠️ Không tìm thấy voice cho ${lang}, dùng utterance.lang="${langCode}" fallback.`);
            this._showVoiceInstallGuide(lang);
        }

        this.utterance.onend = () => {
            if (this.currentItem) {
                this.playedPoiIds.add(this.currentItem.poiId);
                this.cooldownMap.set(this.currentItem.poiId, Date.now());
                this._trackListen(this.currentItem.poiId);
            }
            this._playNext();
        };

        this.utterance.onerror = (e) => {
            if (e.error !== 'canceled') {
                console.error('❌ TTS Error:', e.error);
            }
            this._playNext();
        };

        // Workaround: Chrome pause bug after 15s
        this._startChromeFix();

        this.synth.speak(this.utterance);
    }

    /**
     * Hiện hướng dẫn cài đặt giọng đọc
     */
    _showVoiceInstallGuide(lang) {
        // Chỉ hiện 1 lần
        if (this._guideShown) return;
        this._guideShown = true;
        
        const langName = { vi: 'Tiếng Việt', en: 'English', ja: '日本語', zh: '中文' }[lang] || lang;
        
        const guide = document.createElement('div');
        guide.className = 'voice-install-guide';
        guide.innerHTML = `
            <div class="voice-guide-header">
                <span class="material-icons-round">warning</span>
                <strong>Chưa cài giọng đọc ${langName}</strong>
                <button onclick="this.closest('.voice-install-guide').remove()" class="voice-guide-close">✕</button>
            </div>
            <div class="voice-guide-body">
                <p>Trình duyệt chưa có giọng đọc ${langName}. Để nghe thuyết minh:</p>
                <div class="voice-guide-steps">
                    <div class="voice-guide-step">
                        <span class="step-num">1</span>
                        <span>Mở <b>Microsoft Edge</b> (đã có sẵn giọng Neural tự nhiên)</span>
                    </div>
                    <div class="voice-guide-step">
                        <span class="step-num">2</span>
                        <span>Hoặc trong <b>Chrome</b>: Vào Settings → Languages → Thêm "${langName}"</span>
                    </div>
                    <div class="voice-guide-step">
                        <span class="step-num">3</span>
                        <span>Windows: Settings → Time & Language → Speech → Thêm giọng nói</span>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(guide);
    }

    /**
     * Chrome fix: Restart speech every 14s to prevent pause bug
     */
    _startChromeFix() {
        this._stopChromeFix();
        this._chromeFixInterval = setInterval(() => {
            if (this.synth.speaking && !this.synth.paused) {
                this.synth.pause();
                this.synth.resume();
            }
        }, 14000);
    }

    _stopChromeFix() {
        if (this._chromeFixInterval) {
            clearInterval(this._chromeFixInterval);
            this._chromeFixInterval = null;
        }
    }

    /**
     * Play/Pause toggle
     */
    togglePlayPause() {
        if (!this.synth) return;
        
        if (this.isPaused) {
            this.synth.resume();
            this.isPaused = false;
        } else if (this.isPlaying) {
            this.synth.pause();
            this.isPaused = true;
        }
        this._notifyStateChange();
    }

    /**
     * Dừng hoàn toàn
     */
    stop() {
        this._stopChromeFix();
        if (this.synth) {
            this.synth.cancel();
        }
        this.isPlaying = false;
        this.isPaused = false;
        this.currentItem = null;
        this.utterance = null;
        this._notifyStateChange();
    }

    /**
     * Bỏ qua, phát item tiếp theo
     */
    skip() {
        this._stopChromeFix();
        if (this.synth) {
            this.synth.cancel();
        }
        // onend sẽ tự gọi _playNext
    }

    /**
     * Set ngôn ngữ
     */
    setLanguage(lang) {
        this.currentLanguage = lang;
    }

    /**
     * Track analytics cho việc nghe
     */
    async _trackListen(poiId) {
        const duration = this.startTime ? (Date.now() - this.startTime) / 1000 : 0;
        try {
            await fetch('/api/analytics/event', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    eventType: 'poi_listen',
                    poiId: poiId,
                    sessionId: window.APP_SESSION_ID || 'unknown',
                    duration: duration,
                    language: this.currentLanguage
                })
            });
        } catch (e) {
            // Ignore analytics errors
        }
    }

    /**
     * Thông báo thay đổi trạng thái
     */
    _notifyStateChange() {
        if (this.onStateChange) {
            this.onStateChange({
                isPlaying: this.isPlaying,
                isPaused: this.isPaused,
                currentItem: this.currentItem,
                queueLength: this.queue.length
            });
        }
    }

    /**
     * Kiểm tra POI đã được phát chưa
     */
    hasPlayed(poiId) {
        return this.playedPoiIds.has(poiId);
    }

    /**
     * Reset trạng thái đã phát (cho session mới)
     */
    reset() {
        this.stop();
        this.queue = [];
        this.playedPoiIds.clear();
        this.cooldownMap.clear();
    }
}

// Export global
window.AudioManager = AudioManager;
