/**
 * QR Scanner - Quét mã QR để kích hoạt thuyết minh
 * Sử dụng html5-qrcode library
 */
class QRScannerManager {
    constructor() {
        this.scanner = null;
        this.isScanning = false;
        this.onQRDetected = null; // Callback khi quét thành công
    }

    /**
     * Bắt đầu quét QR
     */
    async start(containerId = 'qr-reader') {
        if (this.isScanning) return;

        try {
            this.scanner = new Html5Qrcode(containerId);
            
            await this.scanner.start(
                { facingMode: 'environment' }, // Camera sau
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                    aspectRatio: 1
                },
                (decodedText) => this._onScanSuccess(decodedText),
                (errorMessage) => { /* Ignore scan errors */ }
            );

            this.isScanning = true;
        } catch (err) {
            console.error('❌ Không thể khởi động camera:', err);
            alert('Không thể truy cập camera. Vui lòng kiểm tra quyền truy cập.');
        }
    }

    /**
     * Dừng quét
     */
    async stop() {
        if (this.scanner && this.isScanning) {
            try {
                await this.scanner.stop();
                this.scanner.clear();
            } catch (e) {
                // Ignore
            }
            this.isScanning = false;
        }
    }

    /**
     * Xử lý khi quét thành công
     */
    _onScanSuccess(decodedText) {
        console.log('✅ QR Detected:', decodedText);
        
        // Dừng scan
        this.stop();

        // Track analytics
        fetch('/api/analytics/event', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                eventType: 'qr_scan',
                sessionId: window.APP_SESSION_ID || 'unknown',
                poiId: decodedText
            })
        }).catch(() => {});

        // Callback
        if (this.onQRDetected) {
            this.onQRDetected(decodedText);
        }
    }
}

// Export global
window.QRScannerManager = QRScannerManager;
