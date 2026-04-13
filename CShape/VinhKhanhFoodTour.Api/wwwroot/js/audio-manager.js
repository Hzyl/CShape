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
            'vi': 'vi-VN', 'en': 'en-US', 'ja': 'ja-JP', 'zh': 'zh-CN',
            'ko': 'ko-KR', 'th': 'th-TH', 'fr': 'fr-FR', 'es': 'es-ES',
            'de': 'de-DE', 'ru': 'ru-RU', 'pt': 'pt-BR', 'it': 'it-IT',
            'id': 'id-ID', 'hi': 'hi-IN', 'ar': 'ar-SA', 'ms': 'ms-MY',
            'tl': 'tl-PH', 'nl': 'nl-NL', 'sv': 'sv-SE', 'pl': 'pl-PL'
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
     * Phát TTS - thử Web Speech API trước, fallback sang Google Translate TTS
     */
    _speak(text, lang) {
        // Cancel bất kỳ audio nào đang phát
        this._stopGoogleAudio();
        if (this.synth) this.synth.cancel();

        // Kiểm tra có voice cho ngôn ngữ này không
        const freshVoices = (this.synth && this.synth.getVoices()) || [];
        if (freshVoices.length > 0) this.voices = freshVoices;

        const voice = this._getVoice(lang);
        const langPrefix = lang.substring(0, 2).toLowerCase();
        const hasVoice = voice || (this.voices || []).some(v => v.lang.toLowerCase().startsWith(langPrefix));

        // Nếu có voice → dùng Web Speech API
        if (hasVoice && this.synth) {
            console.log('🔈 Dùng Web Speech API');
            this._speakWithWebSpeech(text, lang, voice);
        } else {
            // Fallback → Google Translate TTS (hoạt động mọi thiết bị)
            console.log('🔈 Fallback sang Google Translate TTS');
            this._speakWithGoogleTTS(text, lang);
        }
    }

    /**
     * Phát bằng Web Speech API (chất lượng cao, cần có voice cài đặt)
     */
    _speakWithWebSpeech(text, lang, voice) {
        this.utterance = new SpeechSynthesisUtterance(text);
        const langCode = this.langMap[lang] || 'vi-VN';
        this.utterance.lang = langCode;
        this.utterance.volume = 1;

        if (voice) {
            this.utterance.voice = voice;
            const name = voice.name.toLowerCase();
            const isGoogle = name.includes('google');
            const isMicrosoftNeural = name.includes('microsoft') && (name.includes('neural') || !voice.localService);

            if (isGoogle) {
                this.utterance.rate = (lang === 'vi') ? 0.85 : 0.9;
            } else if (isMicrosoftNeural || !voice.localService) {
                this.utterance.rate = (lang === 'vi') ? 0.9 : 0.95;
            } else {
                this.utterance.rate = (lang === 'vi') ? 0.75 : 0.8;
            }
            this.utterance.pitch = 1.0;
            console.log(`🎤 Voice: "${voice.name}" [${voice.lang}] rate=${this.utterance.rate}`);
        } else {
            this.utterance.rate = 0.85;
            this.utterance.pitch = 1.0;
        }

        // Timeout: nếu sau 3 giây không có âm thanh → chuyển sang Google TTS
        let speechStarted = false;
        const fallbackTimer = setTimeout(() => {
            if (!speechStarted) {
                console.warn('⚠️ Web Speech không phát được, chuyển sang Google TTS...');
                this.synth.cancel();
                this._speakWithGoogleTTS(text, lang);
            }
        }, 3000);

        this.utterance.onstart = () => {
            speechStarted = true;
            clearTimeout(fallbackTimer);
        };

        this.utterance.onend = () => {
            clearTimeout(fallbackTimer);
            if (this.currentItem) {
                this.playedPoiIds.add(this.currentItem.poiId);
                this.cooldownMap.set(this.currentItem.poiId, Date.now());
                this._trackListen(this.currentItem.poiId);
            }
            this._playNext();
        };

        this.utterance.onerror = (e) => {
            clearTimeout(fallbackTimer);
            if (e.error === 'canceled') {
                return; // Bỏ qua vì đã xử lý ở hàm stop()
            }
            console.warn('❌ Web Speech lỗi:', e.error, '→ thử Google TTS...');
            this._speakWithGoogleTTS(text, lang);
        };

        this._startChromeFix();
        this.synth.speak(this.utterance);
    }

    /**
     * Phát bằng Google Translate TTS (fallback, hoạt động mọi thiết bị)
     * Chia text thành đoạn ngắn < 200 ký tự và phát tuần tự
     */
    _speakWithGoogleTTS(text, lang) {
        const langCode = this.langMap[lang] || 'vi-VN';
        const tl = langCode.split('-')[0]; // vi-VN → vi

        // Chia text thành các đoạn ngắn (~190 ký tự, cắt theo câu)
        const chunks = this._splitTextForGoogleTTS(text, 190);
        console.log(`🔊 Google TTS: ${chunks.length} đoạn, ngôn ngữ: ${tl}`);

        this._googleChunks = chunks;
        this._googleChunkIndex = 0;
        this._googleLang = tl;

        this._playNextGoogleChunk();
    }

    _playNextGoogleChunk() {
        if (this._googleChunkIndex >= this._googleChunks.length) {
            // Phát xong tất cả đoạn
            this._googleAudio = null;
            if (this.currentItem) {
                this.playedPoiIds.add(this.currentItem.poiId);
                this.cooldownMap.set(this.currentItem.poiId, Date.now());
                this._trackListen(this.currentItem.poiId);
            }
            this._playNext();
            return;
        }

        const chunk = this._googleChunks[this._googleChunkIndex];
        const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${this._googleLang}&client=tw-ob&q=${encodeURIComponent(chunk)}`;

        const audio = new Audio(url);
        this._googleAudio = audio;
        audio.volume = 1.0;

        audio.onended = () => {
            this._googleChunkIndex++;
            this._playNextGoogleChunk();
        };

        audio.onerror = (e) => {
            console.error('❌ Google TTS chunk error:', e);
            this._googleChunkIndex++;
            this._playNextGoogleChunk();
        };

        audio.play().catch(err => {
            console.error('❌ Google TTS play failed:', err);
            this._playNext();
        });
    }

    _stopGoogleAudio() {
        if (this._googleAudio) {
            this._googleAudio.pause();
            this._googleAudio.onended = null;
            this._googleAudio.onerror = null;
            this._googleAudio.src = '';
            this._googleAudio = null;
        }
        this._googleChunks = [];
        this._googleChunkIndex = 0;
    }

    /**
     * Chia text thành đoạn ngắn cho Google TTS (giới hạn ~200 ký tự)
     */
    _splitTextForGoogleTTS(text, maxLen) {
        if (text.length <= maxLen) return [text];

        const chunks = [];
        // Cắt theo dấu câu
        const sentences = text.split(/(?<=[.!?。！？;；,，])\s*/);
        let current = '';

        for (const sentence of sentences) {
            if ((current + ' ' + sentence).trim().length <= maxLen) {
                current = (current + ' ' + sentence).trim();
            } else {
                if (current) chunks.push(current);
                // Nếu câu đơn dài hơn maxLen → cắt cứng
                if (sentence.length > maxLen) {
                    for (let i = 0; i < sentence.length; i += maxLen) {
                        chunks.push(sentence.substring(i, i + maxLen));
                    }
                    current = '';
                } else {
                    current = sentence;
                }
            }
        }
        if (current) chunks.push(current);
        return chunks;
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
        // Ghi lại analytics ngay trước khi dừng
        if (this.currentItem && this.isPlaying) {
            this._trackListen(this.currentItem.poiId);
        }

        this._stopChromeFix();
        this._stopGoogleAudio();
        
        if (this.synth) {
            if (this.utterance) {
                this.utterance.onend = null;
                this.utterance.onerror = null;
            }
            this.synth.cancel();
        }
        this.isPlaying = false;
        this.isPaused = false;
        // Don't clear currentItem until next play, or clear it, but _trackListen used it
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
        // Chống gửi trùng lặp event cho cùng 1 POI trong vòng 2 giây
        if (this._lastTrackedPoi === poiId && (Date.now() - (this._lastTrackedTime || 0) < 2000)) {
            return;
        }
        this._lastTrackedPoi = poiId;
        this._lastTrackedTime = Date.now();

        // Chỉ tính thời gian nếu lớn hơn 1 giây, tránh click lộn
        const duration = this.startTime ? (Date.now() - this.startTime) / 1000 : 0;
        if (duration < 1 && !this.isPlaying) return; // Bỏ qua nếu bấm phát rồi dừng ngay

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
