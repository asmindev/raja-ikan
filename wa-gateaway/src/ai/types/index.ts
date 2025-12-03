/**
 * Types for AI Assistant and Function Calling
 */

export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    currency: string;
    category: string;
    stock: number;
    image?: string;
    isAvailable: boolean;
}

export interface FunctionCallResult {
    success: boolean;
    data?: any;
    error?: string;
}

export interface AIFunction {
    name: string;
    description: string;
    parameters: {
        type: "object";
        properties: Record<string, any>;
        required?: string[];
    };
    execute: (...args: any[]) => Promise<FunctionCallResult>;
}

export interface ChatMessage {
    role: "system" | "user" | "assistant" | "function";
    content: string;
    name?: string;
}

export interface AIAssistantConfig {
    model: string;
    temperature?: number;
    maxTokens?: number;
    systemPrompt?: string;
}
