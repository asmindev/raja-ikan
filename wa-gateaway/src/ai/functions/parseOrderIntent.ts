/**
 * Function untuk ekstrak order items dari teks customer
 * Menggunakan Gemini AI untuk parsing yang lebih akurat
 */

import type { AIFunction, FunctionCallResult } from "../types";
import type { IGeminiClient } from "../../infrastructure/external/gemini/IGeminiClient";
import { Logger } from "../../core/logger/Logger";

const logger = new Logger("ExtractOrderItems");

let geminiClient: IGeminiClient | null = null;

/**
 * Set Gemini client untuk function ini
 */
export function setGeminiClient(client: IGeminiClient) {
    geminiClient = client;
    logger.info("GeminiClient injected into extract_order_items function");
}

/**
 * Execute function untuk ekstrak order items menggunakan AI
 */
async function executeExtractOrderItems(args: {
    text: string;
}): Promise<FunctionCallResult> {
    try {
        if (!geminiClient) {
            throw new Error("GeminiClient not initialized");
        }

        const text = args.text.trim();
        logger.info(`Extracting order from: "${text}"`);

        // Panggil Gemini AI untuk extract order dengan prompt khusus
        const extractionPrompt = `Extract order items dari teks customer berikut ke format JSON.

Format output yang diinginkan:
{
  "order_items": [
    { "name": "nama produk", "qty": angka }
  ]
}

Aturan:
1. Nama produk bisa 1-5 kata (contoh: "lele", "nila merah", "voluptatibus aut odit")
2. Quantity harus angka (convert "lima" → 5, "tiga setengah" → 3.5)
3. Abaikan unit seperti "kg", "kilo", "ekor" - hanya extract angka quantity
4. Jika tidak ada order, return array kosong
5. Output HARUS valid JSON

Teks customer:
"${text}"

Output JSON:`;

        const response = await geminiClient.generateContent({
            contents: [
                {
                    role: "user",
                    parts: [{ text: extractionPrompt }],
                },
            ],
            temperature: 0.3, // Lower temperature untuk consistent JSON output
            maxOutputTokens: 500,
        });

        // Parse JSON dari response
        if (!response.text) {
            throw new Error("No text response from AI");
        }

        let jsonText = response.text.trim();

        // Remove markdown code block jika ada
        jsonText = jsonText.replace(/```json\n?/g, "").replace(/```\n?/g, "");

        logger.debug(`AI extraction result: ${jsonText}`);

        const parsed = JSON.parse(jsonText);
        const orderItems = parsed.order_items || [];

        logger.info(
            `✅ Extracted ${orderItems.length} order items: ${JSON.stringify(
                orderItems
            )}`
        );

        return {
            success: true,
            data: {
                order_items: orderItems,
            },
        };
    } catch (error) {
        logger.error("Failed to extract order items:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

/**
 * Definition untuk function calling Gemini
 */
export const extractOrderItemsFunction: AIFunction = {
    name: "extract_order_items",
    description:
        "Ekstrak item pesanan dari teks customer menggunakan AI ke format JSON {order_items: [{name: string, qty: number}]}. Nama produk bisa panjang (1-5 kata). Gunakan WAJIB ketika customer memesan produk dengan format apapun. Contoh input: 'saya mau pesan voluptatibus aut odit 2 kilo', 'beli lele 5kg', 'mau nila merah 3 ekor'.",
    parameters: {
        type: "object",
        properties: {
            text: {
                type: "string",
                description:
                    "Teks pesanan asli dari customer (jangan diubah/di-filter)",
            },
        },
        required: ["text"],
    },
    execute: executeExtractOrderItems,
};
