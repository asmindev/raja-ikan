/**
 * Function untuk mengambil daftar ikan segar dari backend Raja Ikan
 */

import type { AIFunction, FunctionCallResult, Product } from "../types";
import { CONFIG } from "../../config/config";

/**
 * Fungsi untuk format harga ke Rupiah
 */
function formatPrice(price: number): string {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(price);
}

/**
 * Execute function untuk mendapatkan daftar ikan dari backend Raja Ikan
 */
async function executeGetProducts(args: {
    category?: string;
    available_only?: boolean;
    limit?: number;
}): Promise<FunctionCallResult> {
    try {
        // Fetch ikan dari backend
        const response = await fetch(`${CONFIG.BACKEND_API_URL}/products`);

        if (!response.ok) {
            throw new Error(`Failed to fetch products: ${response.statusText}`);
        }

        const data: any = await response.json();
        let products: any[] = Array.isArray(data) ? data : data.data || [];

        // Convert backend format ke format ikan
        products = products.map((p) => ({
            name: p.name,
            price: parseFloat(p.price),
            stock: p.stock || 100, // Default stock jika tidak ada
        }));

        // Filter by category jika ada
        if (args.category) {
            products = products.filter(
                (p) => p.category.toLowerCase() === args.category?.toLowerCase()
            );
        }

        // Filter hanya yang available jika diminta
        if (args.available_only) {
            products = products.filter((p) => p.isAvailable);
        }

        // Limit hasil jika ada
        if (args.limit && args.limit > 0) {
            products = products.slice(0, args.limit);
        }

        // Format data untuk response dengan list numbering
        const formattedProducts = products
            .map(
                (p, index) =>
                    `${index + 1}. ${p.name} - ${formatPrice(p.price)}`
            )
            .join("\n");

        return {
            success: true,
            data: {
                total: products.length,
                list: formattedProducts,
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
export const getProductsFunction: AIFunction = {
    name: "get_products",
    description:
        "Mendapatkan daftar ikan segar yang tersedia dari database Raja Ikan. Gunakan function ini ketika customer menanyakan daftar ikan, harga ikan, atau ikan apa saja yang tersedia hari ini. Function ini akan mengembalikan nama ikan dan harga terkini.",
    parameters: {
        type: "object",
        properties: {
            category: {
                type: "string",
                description:
                    "Filter berdasarkan jenis/kategori ikan (misalnya: Ikan Laut, Ikan Air Tawar, Ikan Premium). Kosongkan untuk menampilkan semua ikan.",
            },
            available_only: {
                type: "boolean",
                description:
                    "Jika true, hanya tampilkan ikan yang tersedia (fresh/stok ada). Default: false",
                default: false,
            },
            limit: {
                type: "number",
                description:
                    "Batasi jumlah ikan yang ditampilkan. Kosongkan untuk menampilkan semua ikan yang tersedia.",
            },
        },
        required: [],
    },
    execute: executeGetProducts,
};
