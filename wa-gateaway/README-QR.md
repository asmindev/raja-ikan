# WhatsApp QR Code Integration

## 🎯 Fitur yang Sudah Dibuat

### Backend (wa-gateway)

#### 1. **WhatsApp Service** (`src/services/WhatsAppService.ts`)

-   ✅ Inisialisasi koneksi WhatsApp menggunakan Baileys
-   ✅ Generate QR code otomatis saat koneksi baru
-   ✅ Callback untuk QR code dan status koneksi
-   ✅ Method `restart()` untuk generate QR code baru
-   ✅ Method `logout()` untuk logout dari WhatsApp

#### 2. **WebSocket Service** (`src/services/WebSocketService.ts`)

-   ✅ Emit QR code ke semua client yang terkoneksi
-   ✅ Emit status koneksi (connected/disconnected/connecting)
-   ✅ Emit event WhatsApp connected/disconnected
-   ✅ Support untuk message events

#### 3. **API Endpoints** (`src/app.ts`)

-   ✅ `GET /status` - Cek status koneksi WhatsApp
-   ✅ `GET /api/qr` - Ambil QR code yang sudah ada
-   ✅ `POST /api/qr/generate` - Generate QR code baru (restart koneksi)
-   ✅ `POST /api/send` - Kirim pesan WhatsApp
-   ✅ `POST /api/logout` - Logout dari WhatsApp

### Frontend (React)

#### 1. **WebSocket Hook** (`use-whatsapp-socket.ts`)

-   ✅ Koneksi Socket.IO ke gateway
-   ✅ Listen event `qr:generated` untuk QR code baru
-   ✅ Listen event `connection:status` untuk status koneksi
-   ✅ Listen event `whatsapp:connected` dan `whatsapp:disconnected`
-   ✅ Method `requestQRCode()` - Generate QR code baru
-   ✅ Method `requestStatus()` - Refresh status koneksi

#### 2. **QR Code Display Component** (`qr-code-display.tsx`)

-   ✅ Tampilkan QR code dengan instruksi scan
-   ✅ Badge status koneksi (Connected/Disconnected/Connecting)
-   ✅ Info user yang terkoneksi (nama & ID)
-   ✅ Button "Generate QR" / "Refresh QR"
-   ✅ Button "Refresh" untuk refresh status
-   ✅ Auto disable button saat sudah connected

## 🚀 Cara Penggunaan

### 1. Jalankan WA Gateway

```bash
cd wa-gateaway
bun dev
```

Server akan berjalan di `http://localhost:3000`

### 2. Akses Dashboard React

Buka halaman `/admin/messages` di aplikasi Laravel Anda.

### 3. Generate QR Code

-   Klik button **"Generate QR"** untuk membuat QR code baru
-   QR code akan muncul secara otomatis via WebSocket
-   Scan dengan WhatsApp di HP Anda

### 4. Fitur Button

#### Button "Generate QR" / "Refresh QR"

-   **Fungsi**: Generate QR code baru dengan restart koneksi
-   **Endpoint**: `POST /api/qr/generate`
-   **Kapan aktif**: Saat disconnected dan socket terkoneksi
-   **Kapan disabled**: Saat sudah connected atau socket terputus

#### Button "Refresh"

-   **Fungsi**: Refresh status koneksi dari server
-   **Endpoint**: `GET /status`
-   **Kapan aktif**: Saat socket terkoneksi
-   **Kapan disabled**: Saat socket terputus

## 📡 WebSocket Events

### Events dari Server ke Client

| Event                   | Payload                                                                                  | Deskripsi                    |
| ----------------------- | ---------------------------------------------------------------------------------------- | ---------------------------- |
| `qr:generated`          | `{ qrCode: string, timestamp: string }`                                                  | QR code baru ter-generate    |
| `connection:status`     | `{ status: 'connected'\|'disconnected'\|'connecting', user?: {...}, timestamp: string }` | Update status koneksi        |
| `whatsapp:connected`    | `{ user: { id: string, name: string } }`                                                 | WhatsApp berhasil terkoneksi |
| `whatsapp:disconnected` | `{}`                                                                                     | WhatsApp terputus            |
| `message:received`      | `{ from: string, text: string, message: any, timestamp: string }`                        | Pesan masuk                  |
| `message:sent`          | `{ to: string, message: string, success: boolean, error?: string, timestamp: string }`   | Konfirmasi pesan terkirim    |

## 🔄 Flow Diagram

### Generate QR Code Flow

```
User clicks "Generate QR"
    ↓
Frontend: requestQRCode()
    ↓
POST /api/qr/generate
    ↓
Backend: waService.restart()
    ↓
Baileys generates new QR
    ↓
Emit via WebSocket: qr:generated
    ↓
Frontend: Display QR code
```

### Scan QR Code Flow

```
User scans QR with WhatsApp
    ↓
Baileys: connection.update (status: 'open')
    ↓
Backend: Emit whatsapp:connected + connection:status
    ↓
Frontend: Hide QR, show connected status
```

## 🛠️ Troubleshooting

### QR Code tidak muncul

1. Cek apakah wa-gateway sudah running (`bun dev`)
2. Cek console browser untuk error Socket.IO
3. Pastikan port 3000 tidak diblok firewall
4. Cek log di terminal wa-gateway

### Button disabled terus

1. Cek apakah Socket.IO terkoneksi (lihat badge "Gateway")
2. Refresh halaman
3. Restart wa-gateway service

### Sudah scan tapi tidak connect

1. Cek apakah session folder sudah ada: `wa-gateaway/sesi`
2. Hapus folder session dan restart: `rm -rf sesi && bun dev`
3. Cek log error di terminal wa-gateway

## 📝 Notes

-   QR code akan expire setelah beberapa detik, klik "Refresh QR" untuk generate baru
-   Saat sudah connected, button "Generate QR" akan otomatis disabled
-   Session WhatsApp disimpan di folder `sesi/` dan akan auto-reconnect saat restart
-   Untuk logout dan generate QR baru, gunakan endpoint `POST /api/logout` dulu
