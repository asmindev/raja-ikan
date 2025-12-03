/**
 * Export semua AI functions
 */

import { getProductsFunction } from "./getProducts";
import { extractOrderItemsFunction } from "./parseOrderIntent";
import { extractConfirmationFunction } from "./orderFunctions";
import type { AIFunction } from "../types";

/**
 * Registry semua functions yang tersedia
 */
export const availableFunctions: Record<string, AIFunction> = {
    get_products: getProductsFunction,
    extract_order_items: extractOrderItemsFunction,
    extract_confirmation: extractConfirmationFunction,
};

/**
 * Get function definitions untuk OpenAI
 */
export function getFunctionDefinitions() {
    return Object.values(availableFunctions).map((fn) => ({
        type: "function" as const,
        function: {
            name: fn.name,
            description: fn.description,
            parameters: fn.parameters,
        },
    }));
}

/**
 * Execute function by name
 */
export async function executeFunction(name: string, args: any) {
    const fn = availableFunctions[name];
    if (!fn) {
        throw new Error(`Function ${name} not found`);
    }
    return await fn.execute(args);
}
