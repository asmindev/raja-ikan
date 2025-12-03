/**
 * Function untuk konfirmasi order dari customer via WhatsApp
 */

import type { AIFunction, FunctionCallResult } from "../types";

/**
 * Execute function untuk ekstrak konfirmasi (Ya/Tidak)
 */
async function executeExtractConfirmation(args: {
    text: string;
}): Promise<FunctionCallResult> {
    try {
        const text = args.text.toLowerCase().trim();

        // Yes keywords
        const yesKeywords = [
            "ya",
            "yes",
            "iya",
            "ok",
            "oke",
            "setuju",
            "benar",
            "betul",
        ];
        // No keywords
        const noKeywords = [
            "tidak",
            "no",
            "nggak",
            "enggak",
            "batal",
            "gak",
            "ndak",
        ];

        const isYes = yesKeywords.some(
            (keyword) => text === keyword || text.includes(keyword)
        );
        const isNo = noKeywords.some(
            (keyword) => text === keyword || text.includes(keyword)
        );

        let action = "none";
        if (isYes) action = "confirm";
        if (isNo) action = "cancel";

        return {
            success: true,
            data: {
                action,
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
 * Function definition
 */
export const extractConfirmationFunction: AIFunction = {
    name: "extract_confirmation",
    description:
        "Ekstrak jawaban konfirmasi dari customer. Contoh: 'Ya' → {action: 'confirm'}, 'Tidak' → {action: 'cancel'}. Gunakan ketika customer menjawab konfirmasi order.",
    parameters: {
        type: "object",
        properties: {
            text: {
                type: "string",
                description: "Jawaban konfirmasi dari customer",
            },
        },
        required: ["text"],
    },
    execute: executeExtractConfirmation,
};
