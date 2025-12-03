# WhatsApp Gateway Service

🚀 **Modern, Production-Ready WhatsApp Gateway** built with Bun, Baileys, and Socket.IO

## ✨ Features

-   📱 **QR Code Authentication** - Easy WhatsApp Web integration
-   💬 **Send/Receive Messages** - Full message handling
-   🔄 **Real-time WebSocket** - Live connection updates
-   🔌 **RESTful API** - Simple HTTP endpoints
-   📊 **Advanced Logging** - File rotation & multiple levels
-   🏗️ **Clean Architecture** - Modular, testable, maintainable
-   🔐 **Session Management** - Automatic session persistence
-   🔁 **Auto-Reconnection** - Smart retry logic with exponential backoff
-   🎯 **Event-Driven** - Decoupled, extensible design
-   📦 **Production Ready** - Error handling, graceful shutdown

## 📋 Table of Contents

-   [Installation](#-installation)
-   [Quick Start](#-quick-start)
-   [API Documentation](#-api-documentation)
-   [WebSocket Events](#-websocket-events)
-   [Architecture](#-architecture)
-   [Configuration](#-configuration)
-   [Development](#-development)
-   [Production](#-production)

## 🚀 Installation

### Prerequisites

-   [Bun](https://bun.sh) >= 1.0.0
-   Node.js >= 18 (for Socket.IO compatibility)

### Install Dependencies

```bash
bun install
```

## ⚡ Quick Start

### 1. Start the Server

```bash
# Development mode
bun run dev

# Production mode
bun run start
```

### 2. Scan QR Code

Open your browser or use curl:

```bash
curl http://localhost:3000/api/qr
```

Or visit: `http://localhost:3000/api/qr`

Scan the QR code with your WhatsApp mobile app.

### 3. Send a Message

```bash
curl -X POST http://localhost:3000/api/send \
  -H "Content-Type: application/json" \
  -d '{
    "to": "6281234567890",
    "message": "Hello from WhatsApp Gateway!"
  }'
```

## 📡 API Documentation

### Endpoints

| Method | Endpoint    | Description                    |
| ------ | ----------- | ------------------------------ |
| `GET`  | `/api/qr`   | Get QR code for authentication |
| `POST` | `/api/send` | Send WhatsApp message          |
| `GET`  | `/status`   | Check connection status        |
| `GET`  | `/health`   | Health check                   |

### Detailed API

#### 1. Get QR Code

```http
GET /api/qr
```

**Response:**

```json
{
    "success": true,
    "qrCode": "data:image/png;base64,...",
    "message": "Scan this QR code with WhatsApp",
    "expiresIn": 60
}
```

#### 2. Send Message

```http
POST /api/send
Content-Type: application/json
```

**Request Body:**

```json
{
    "to": "6281234567890",
    "message": "Your message here"
}
```

**Response:**

```json
{
    "success": true,
    "message": "Message sent successfully",
    "to": "6281234567890"
}
```

#### 3. Check Status

```http
GET /status
```

**Response:**

```json
{
    "success": true,
    "status": {
        "connected": true,
        "connectionStatus": "connected",
        "hasQRCode": false,
        "user": {
            "id": "6281234567890",
            "name": "My WhatsApp"
        },
        "session": {
            "exists": true,
            "filesCount": 5,
            "size": 12345
        }
    }
}
```

## 🔌 WebSocket Events

Connect to: `ws://localhost:3000`

### Server → Client Events

| Event                   | Description               | Data                                                |
| ----------------------- | ------------------------- | --------------------------------------------------- |
| `qr:generated`          | New QR code generated     | `{ qrCode: string }`                                |
| `connection:status`     | Connection status changed | `{ status: string, user?: object }`                 |
| `connection:logged_out` | Device logged out         | `{ message: string }`                               |
| `message:received`      | Incoming message          | `{ from: string, text: string, type: string }`      |
| `message:sent`          | Message sent successfully | `{ to: string, message: string, success: boolean }` |
| `message:failed`        | Message failed to send    | `{ to: string, error: string }`                     |

### Example Usage

```javascript
import { io } from "socket.io-client";

const socket = io("http://localhost:3000");

socket.on("qr:generated", (data) => {
    console.log("QR Code:", data.qrCode);
});

socket.on("connection:status", (data) => {
    console.log("Status:", data.status);
});

socket.on("message:received", (data) => {
    console.log(`Message from ${data.from}: ${data.text}`);
});
```

## 🏗️ Architecture

```
src/
├── core/                 # Core utilities
│   ├── logger/          # Logging system
│   └── events/          # Event system
│
├── services/            # Business logic
│   ├── whatsapp/       # WhatsApp services
│   └── websocket/      # WebSocket services
│
├── api/                 # HTTP API
│   ├── routes/         # Route handlers
│   └── middleware/     # Middlewares
│
├── config/             # Configuration
├── app.ts              # App initialization
└── index.ts            # Entry point
```

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed documentation.

### Key Components

-   **WhatsAppClient**: Main client orchestrator
-   **QRCodeManager**: QR code generation & lifecycle
-   **ConnectionManager**: Connection state & reconnection
-   **MessageHandler**: Message processing
-   **SessionManager**: Session file management
-   **WebSocketServer**: Socket.IO wrapper
-   **WebSocketEventBridge**: Event bridge to clients

## ⚙️ Configuration

Create `.env` file:

```bash
PORT=3000
LOG_LEVEL=info
BACKEND_API_URL=http://localhost:8000/api/v1
```

### Environment Variables

| Variable          | Default                        | Description                             |
| ----------------- | ------------------------------ | --------------------------------------- |
| `PORT`            | `3000`                         | Server port                             |
| `LOG_LEVEL`       | `info`                         | Log level (debug/info/warn/error/fatal) |
| `BACKEND_API_URL` | `http://localhost:8000/api/v1` | Backend API endpoint                    |

## 🛠️ Development

```bash
# Install dependencies
bun install

# Start dev server with hot reload
bun run dev

# Check types
bun run type-check

# Format code
bun run format

# Lint code
bun run lint
```

### Project Structure

```
wa-gateway/
├── src/                 # Source code
├── sessions/            # WhatsApp sessions (auto-generated)
├── logs/                # Log files (auto-generated)
├── package.json
├── tsconfig.json
├── README.md
├── ARCHITECTURE.md      # Architecture documentation
└── QUICKSTART_NEW.md    # Quick start guide
```

## 🚀 Production

### Docker (Recommended)

```dockerfile
FROM oven/bun:1

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --production

COPY . .

EXPOSE 3000

CMD ["bun", "run", "start"]
```

### PM2

```bash
# Install PM2
npm install -g pm2

# Start with PM2
pm2 start bun --name wa-gateway -- run start

# Monitor
pm2 logs wa-gateway

# Restart
pm2 restart wa-gateway
```

### Environment

```bash
# Production .env
PORT=3000
LOG_LEVEL=error
BACKEND_API_URL=https://your-api.com/api/v1
```

## 📊 Logging

Logs are written to both console and file:

-   **Console**: Colored, formatted output with emojis
-   **File**: `logs/wa-gateway.log` (auto-rotated at 10MB)

### Log Levels

-   `debug`: Verbose development info
-   `info`: Normal operations
-   `warn`: Potential issues
-   `error`: Recoverable errors
-   `fatal`: Critical errors

### Example Log Output

```
2025-10-15T10:30:00.000Z ℹ️  INFO  [WhatsAppClient]     Connected to WhatsApp
    📋 {
      "user": {
        "id": "6281234567890",
        "name": "My WhatsApp"
      }
    }
```

## 🐛 Troubleshooting

### QR Code Not Showing

1. Check service is running: `GET /health`
2. Check status: `GET /status`
3. If already connected, QR won't show
4. Delete `sessions/` folder and restart

### Connection Issues

1. Check network connectivity
2. Ensure WhatsApp is active on phone
3. Review logs: `tail -f logs/wa-gateway.log`
4. Try deleting session and re-authenticating

### Message Not Sending

1. Verify connection: `GET /status`
2. Check phone number format (with country code, no +)
3. Ensure recipient number exists on WhatsApp

## 🔐 Security

**Production Checklist:**

-   [ ] Change CORS origin from `*` to specific domain
-   [ ] Add authentication middleware
-   [ ] Use HTTPS/WSS in production
-   [ ] Secure session files
-   [ ] Don't expose QR endpoint publicly
-   [ ] Implement rate limiting
-   [ ] Add request validation
-   [ ] Use environment variables for secrets

## 📝 License

MIT License - feel free to use in your projects!

## 🤝 Contributing

Contributions welcome! Please read our contributing guidelines.

## 📮 Support

-   📧 Email: support@example.com
-   💬 Discord: [Join our server](#)
-   🐛 Issues: [GitHub Issues](#)

## 🙏 Credits

Built with:

-   [Baileys](https://github.com/WhiskeySockets/Baileys) - WhatsApp Web API
-   [Bun](https://bun.sh) - Fast JavaScript runtime
-   [Hono](https://hono.dev) - Fast web framework
-   [Socket.IO](https://socket.io) - Real-time communication

---

Made with ❤️ for the WhatsApp automation community
