/**
 * Contoh penggunaan AI Assistant dengan Function Calling menggunakan Gemini
 *
 * Jalankan dengan: bun src/ai/example.ts
 */

import { AIAssistant } from "./AIAssistant";

// Pastikan GEMINI_API_KEY ada di environment variables
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
    console.error("❌ GEMINI_API_KEY tidak ditemukan di environment variables");
    console.log("Tambahkan ke .env file:");
    console.log("GEMINI_API_KEY=your-api-key-here");
    console.log(
        "\nDapatkan API key di: https://aistudio.google.com/app/apikey"
    );
    process.exit(1);
}

async function main() {
    console.log("🐟 Memulai AI Assistant Demo - Raja Ikan\n");

    // Initialize AI Assistant
    const assistant = new AIAssistant(GEMINI_API_KEY!, {
        model: "gemini-2.5-flash", // atau "gemini-1.5-pro" untuk hasil lebih baik
        temperature: 0.7,
    });

    const userId = "demo-customer-123";

    // Test case 1: Sapa dan tanyakan daftar ikan
    console.log("👤 Customer: Halo, ada ikan apa aja hari ini?");
    console.log("⏳ Processing...\n");

    const response1 = await assistant.chat(
        userId,
        "Halo, ada ikan apa aja hari ini?"
    );

    console.log("🤖 Raja Ikan:", response1.response);
    if (response1.functionCalls) {
        console.log(
            "\n📞 Function Calls:",
            JSON.stringify(response1.functionCalls, null, 2)
        );
    }
    console.log("\n" + "=".repeat(80) + "\n");

    // Test case 2: Tanya ikan laut
    console.log("👤 Customer: Yang ikan laut ada apa saja?");
    console.log("⏳ Processing...\n");

    const response2 = await assistant.chat(
        userId,
        "Yang ikan laut ada apa saja?"
    );

    console.log("🤖 Raja Ikan:", response2.response);
    if (response2.functionCalls) {
        console.log(
            "\n📞 Function Calls:",
            JSON.stringify(response2.functionCalls, null, 2)
        );
    }
    console.log("\n" + "=".repeat(80) + "\n");

    // Test case 3: Tanya harga ikan tertentu
    console.log("👤 Customer: Berapa harga ikan tongkol?");
    console.log("⏳ Processing...\n");

    const response3 = await assistant.chat(
        userId,
        "Berapa harga ikan tongkol?"
    );

    console.log("🤖 Raja Ikan:", response3.response);
    if (response3.functionCalls) {
        console.log(
            "\n📞 Function Calls:",
            JSON.stringify(response3.functionCalls, null, 2)
        );
    }
    console.log("\n" + "=".repeat(80) + "\n");

    // Test case 4: Tanya ikan segar yang ready
    console.log("👤 Customer: Ikan yang paling segar apa nih?");
    console.log("⏳ Processing...\n");

    const response4 = await assistant.chat(
        userId,
        "Ikan yang paling segar apa nih?"
    );

    console.log("🤖 Raja Ikan:", response4.response);
    if (response4.functionCalls) {
        console.log(
            "\n📞 Function Calls:",
            JSON.stringify(response4.functionCalls, null, 2)
        );
    }
    console.log("\n" + "=".repeat(80) + "\n");

    // Clear history
    assistant.clearHistory(userId);
    console.log("✅ Demo selesai!");
}

// Run the example
main().catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
});
