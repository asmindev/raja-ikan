# WhatsApp Service Architecture

## 📁 Struktur Folder

```
src/
├── whatsapp/                # WhatsApp service modules
│   ├── index.ts            # Main WhatsAppService orchestrator
│   ├── types.ts            # TypeScript interfaces & types
│   ├── ConnectionHandler.ts # Handle koneksi & lifecycle
│   ├── QRCodeHandler.ts    # Handle QR code generation
│   ├── MessageHandler.ts   # Handle send/receive messages
│   └── whatsapp.ts         # Re-export all modules
├── routes/                 # API routes
├── services/               # Other services (WebSocket, etc)
├── core/                   # Core utilities (Logger, etc)
└── config/                 # Configuration
```

## 🎯 Separation of Concerns

### 1. **types.ts** - Type Definitions

Berisi semua TypeScript interfaces dan types:

-   `WhatsAppStatus` - Status koneksi WhatsApp
-   `WhatsAppUser` - User information
-   `QRCodeCallback` - Callback type untuk QR code
-   `ConnectionUpdateCallback` - Callback type untuk connection update
-   `MessageReceivedCallback` - Callback type untuk message received

### 2. **ConnectionHandler.ts** - Connection Management

Tanggung jawab:

-   ✅ Initialize WhatsApp socket
-   ✅ Setup connection event handlers
-   ✅ Handle connection open/close
-   ✅ Handle auto-reconnect logic
-   ✅ Manage user info
-   ✅ Logout functionality

Methods:

-   `initializeSocket()` - Buat socket baru
-   `setupConnectionHandlers()` - Setup event listeners
-   `handleConnectionClose()` - Handle disconnection
-   `handleConnectionOpen()` - Handle connection success
-   `closeSocket()` - Close socket
-   `logout()` - Logout dari WhatsApp
-   `getStatus()` - Get connection status

### 3. **QRCodeHandler.ts** - QR Code Management

Tanggung jawab:

-   ✅ Generate QR code dari raw string
-   ✅ Convert ke base64 data URL
-   ✅ Store current QR code
-   ✅ Clear QR code saat connected
-   ✅ Emit QR code via callbacks

Methods:

-   `generateQRCode()` - Generate QR dari raw string
-   `clearQRCode()` - Clear QR code
-   `getCurrentQRCode()` - Get current QR
-   `hasQRCode()` - Check if QR exists

### 4. **MessageHandler.ts** - Message Management

Tanggung jawab:

-   ✅ Send text messages
-   ✅ Format phone numbers to JID
-   ✅ Setup message event listeners
-   ✅ Handle incoming messages

Methods:

-   `sendTextMessage()` - Kirim pesan text
-   `formatJID()` - Format nomor ke WhatsApp JID
-   `setupMessageHandlers()` - Setup message listeners

### 5. **index.ts** - Main Orchestrator

Tanggung jawab:

-   ✅ Orchestrate semua handlers
-   ✅ Provide unified API
-   ✅ Manage callbacks
-   ✅ Initialize & restart

Methods:

-   `initialize()` - Init semua handlers
-   `onQRCode()` - Set QR callback
-   `onConnectionUpdate()` - Set connection callback
-   `onMessageReceived()` - Set message callback
-   `getStatus()` - Get status lengkap
-   `getQRCode()` - Get current QR
-   `sendMessage()` - Send message
-   `logout()` - Logout
-   `restart()` - Restart connection

## 🔄 Flow Diagram

### Initialize Flow

```
WhatsAppService.initialize()
    ↓
ConnectionHandler.initializeSocket()
    ↓
ConnectionHandler.setupConnectionHandlers()
    ↓
MessageHandler.setupMessageHandlers()
    ↓
✅ Ready
```

### QR Code Generation Flow

```
Baileys emit QR
    ↓
ConnectionHandler catches QR event
    ↓
WhatsAppService.handleQRCode()
    ↓
QRCodeHandler.generateQRCode()
    ↓
Convert to base64
    ↓
Emit via callbacks
    ↓
WebSocket → Frontend
```

### Connection Flow

```
User scans QR
    ↓
Baileys emit connection: open
    ↓
ConnectionHandler.handleConnectionOpen()
    ↓
Extract user info
    ↓
QRCodeHandler.clearQRCode()
    ↓
Emit connection status
    ↓
WebSocket → Frontend
```

### Send Message Flow

```
Frontend sends message request
    ↓
API Route → WhatsAppService.sendMessage()
    ↓
MessageHandler.sendTextMessage()
    ↓
Format JID
    ↓
socket.sendMessage()
    ↓
✅ Message sent
```

## 📊 Keuntungan Struktur Baru

### 1. **Single Responsibility**

Setiap class hanya handle satu concern:

-   ConnectionHandler → Koneksi
-   QRCodeHandler → QR Code
-   MessageHandler → Messages

### 2. **Maintainability**

-   Mudah cari bug (tahu harus cek file mana)
-   Update fitur tidak affect yang lain
-   Code lebih readable dan organized

### 3. **Testability**

-   Bisa test setiap handler secara terpisah
-   Easy to mock dependencies
-   Clear boundaries

### 4. **Scalability**

-   Mudah tambah handler baru (e.g., MediaHandler, GroupHandler)
-   Extend functionality tanpa ubah existing code
-   Follow SOLID principles

### 5. **Reusability**

-   Handler bisa dipakai independent
-   Easy to compose
-   Flexible architecture

## 🔧 Usage Example

```typescript
// Import
import { WhatsAppService } from "./whatsapp";

// Initialize
const waService = new WhatsAppService();

// Setup callbacks
waService.onQRCode((qr) => {
    console.log("QR Code:", qr);
});

waService.onConnectionUpdate((status) => {
    console.log("Status:", status);
});

waService.onMessageReceived((message) => {
    console.log("Message:", message);
});

// Initialize connection
await waService.initialize();

// Send message
await waService.sendMessage("628123456789", "Hello!");

// Get status
const status = waService.getStatus();

// Restart (generate new QR)
await waService.restart();

// Logout
await waService.logout();
```

## 📝 Migration Notes

File lama `WhatsAppService.ts` sudah di-rename jadi `WhatsAppService.ts.old` sebagai backup. Semua functionality sama, hanya di-reorganize jadi modular structure.

## 🚀 Next Steps

Potential handlers untuk ditambahkan:

-   `MediaHandler` - Handle media messages (image, video, audio)
-   `GroupHandler` - Handle group operations
-   `StatusHandler` - Handle WhatsApp status/stories
-   `ContactHandler` - Handle contacts sync
-   `PresenceHandler` - Handle typing, online/offline status
