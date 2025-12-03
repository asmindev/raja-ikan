````markdown
# AI Assistant dengan Function Calling

Module ini menyediakan AI Assistant menggunakan **Google Gemini** (package `@google/genai`) dengan kemampuan function calling untuk mengotomasi respons kepada pelanggan WhatsApp.

## Fitur

-   ✅ Function calling untuk mendapatkan data real-time dari backend Laravel
-   ✅ Conversation history per user
-   ✅ Support multiple functions
-   ✅ Error handling yang robust
-   ✅ Logging lengkap
-   ✅ Mudah di-extend dengan function baru
-   ✅ **GRATIS** dengan Gemini API (15 RPM free tier)
-   ✅ Menggunakan SDK terbaru `@google/genai` v1.28+

## Struktur Folder

```
ai/
├── AIAssistant.ts         # Main AI Assistant class
├── types/
│   └── index.ts          # TypeScript types
├── functions/
│   ├── index.ts          # Function registry
│   └── getProducts.ts    # Function untuk get daftar produk dari backend
├── example.ts            # Contoh penggunaan
└── README.md             # Dokumentasi ini
```

## Setup

### 1. Set Gemini API Key

Tambahkan ke file `.env`:

```env
GEMINI_API_KEY=your-api-key-here
```

**Dapatkan API key GRATIS di:** https://aistudio.google.com/app/apikey

### 2. Pastikan Backend Laravel Running

AI Assistant membutuhkan backend Laravel untuk fetch data produk:

```bash
# Di terminal backend
cd backend
php artisan serve
```

### 3. Test Function

```bash
bun src/ai/example.ts
```

## Penggunaan

### Basic Usage

```typescript
import { AIAssistant } from "./ai";
import { CONFIG } from "./config/config";

const assistant = new AIAssistant(CONFIG.GEMINI_API_KEY, {
    model: "gemini-2.0-flash-exp", // atau "gemini-1.5-flash", "gemini-1.5-pro"
    temperature: 0.7,
});

const response = await assistant.chat("user-123", "Saya mau lihat menu");

console.log(response.response);
```

### Integrasi dengan WhatsApp MessageHandler

```typescript
import { AIAssistant } from "../ai";
import { CONFIG } from "../config/config";

export class MessageHandler {
    private aiAssistant: AIAssistant | null = null;

    constructor() {
        // Initialize AI Assistant jika API key tersedia
        if (CONFIG.GEMINI_API_KEY) {
            this.aiAssistant = new AIAssistant(CONFIG.GEMINI_API_KEY);
        }
    }

    async handleTextMessage(from: string, text: string) {
        // Skip jika AI tidak aktif
        if (!this.aiAssistant) {
            return;
        }

        try {
            // Gunakan phone number sebagai userId
            const response = await this.aiAssistant.chat(from, text);

            // Kirim response ke WhatsApp
            await this.sendMessage(from, response.response);

            // Optional: Log function calls untuk analytics
            if (response.functionCalls) {
                console.log("Functions called:", response.functionCalls);
            }
        } catch (error) {
            console.error("AI error:", error);
            // Fallback ke manual handling
        }
    }
}
```

## Function Calling

### get_products

Mendapatkan daftar produk dari backend Laravel (`GET /api/v1/products`).

**Parameters:**

-   `category` (optional): Filter berdasarkan kategori
-   `available_only` (optional): Jika true, hanya tampilkan produk aktif
-   `limit` (optional): Batasi jumlah produk

**Backend Response Format:**

```json
[
    {
        "id": 1,
        "name": "Nasi Goreng",
        "description": "Nasi goreng spesial",
        "price": "25000.00",
        "image": "http://...",
        "is_active": true
    }
]
```

**AI akan otomatis call function ini ketika user menanyakan:**

-   "Lihat menu"
-   "Ada makanan apa aja?"
-   "Menu minuman dong"
-   "Yang ready apa aja?"

## Menambah Function Baru

Contoh menambah function `create_order`:

1. Buat `functions/createOrder.ts`
2. Implement `executeCreateOrder` yang fetch ke backend API
3. Export `createOrderFunction` dengan schema Gemini
4. Register di `functions/index.ts`

## Configuration

### Model Options

-   `gemini-2.0-flash-exp`: **Terbaru, experimental** - Gemini 2.0 dengan multimodal
-   `gemini-1.5-flash`: **Cepat, GRATIS** (recommended untuk produksi)
-   `gemini-1.5-pro`: Lebih pintar, masih GRATIS tapi limited quota
-   `gemini-1.0-pro`: Legacy, tidak direkomendasikan

### Environment Variables

```env
GEMINI_API_KEY=your-api-key-here
BACKEND_API_URL=http://localhost:8000/api/v1
```

## Cost & Limits (Gemini API Free Tier)

✅ **GRATIS** dengan limit:

-   **15 RPM** (Requests Per Minute)
-   **1 million tokens/day**
-   **1500 requests/day**

Cukup untuk aplikasi kecil-menengah!

## Troubleshooting

**Error: "API key not valid"**
→ Pastikan API key benar dari https://aistudio.google.com/app/apikey

**Error: "Failed to fetch products"**
→ Pastikan backend Laravel running di port 8000

**Error: "Resource exhausted"**
→ Tunggu 1 menit (rate limit 15 RPM)

**Slow Response**
→ Gunakan `gemini-1.5-flash` untuk respon lebih cepat

## License

MIT
````
