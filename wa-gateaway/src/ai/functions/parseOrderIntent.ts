/**
 * Function untuk ekstrak order items dari teks customer
 */

import type { AIFunction, FunctionCallResult } from "../types";

/**
 * Execute function untuk ekstrak order items
 */
async function executeExtractOrderItems(args: {
    text: string;
}): Promise<FunctionCallResult> {
    try {
        const text = args.text.toLowerCase().trim();

        // Remove common order keywords
        let cleanText = text
            .replace(/\b(pesan|pesen|order|beli|mau|minta)\b/gi, "")
            .trim();

        // Pattern untuk ekstrak: [nama produk] [angka] [unit?]
        // Contoh: "lele 5kg", "nila 3 kilo", "gurame 2"
        const itemPattern =
            /([a-z\s]+?)\s*(\d+(?:[.,]\d+)?)\s*(kg|kilo|kilogram|gr|gram|ekor|pcs|buah)?/gi;
        const matches = [...cleanText.matchAll(itemPattern)];

        if (matches.length === 0) {
            return {
                success: true,
                data: {
                    order_items: [],
                },
            };
        }

        const orderItems = matches.map((match) => {
            const name = match[1]!.trim();
            const qty = parseFloat(match[2]!.replace(",", "."));
            return { name, qty };
        });

        return {
            success: true,
            data: {
                order_items: orderItems,
            },
        };
    } catch (error) {
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
        "Ekstrak item pesanan dari teks customer menjadi format JSON. Contoh: 'Pesan lele 5kg' → {order_items: [{name: 'lele', qty: 5}]}. Gunakan ketika customer memesan produk.",
    parameters: {
        type: "object",
        properties: {
            text: {
                type: "string",
                description: "Teks pesanan dari customer",
            },
        },
        required: ["text"],
    },
    execute: executeExtractOrderItems,
};
