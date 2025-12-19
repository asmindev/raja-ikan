/**
 * Gemini Client Interface
 *
 * Abstracts Google Gemini AI API interactions
 */

export interface GeminiConfig {
    apiKey: string;
    model: string;
    temperature: number;
    maxTokens: number;
}

export interface GeminiMessage {
    role: "user" | "model";
    parts: { text: string }[];
}

export interface GeminiFunctionCall {
    name: string;
    args: Record<string, any>;
}

export interface GeminiResponse {
    text?: string;
    functionCalls?: GeminiFunctionCall[];
    candidates?: any[];
}

export interface GeminiGenerateRequest {
    contents: GeminiMessage[];
    systemInstruction?: string;
    tools?: any[];
    toolConfig?: any;
    temperature?: number;
    maxOutputTokens?: number;
}

export interface IGeminiClient {
    generateContent(request: GeminiGenerateRequest): Promise<GeminiResponse>;
}
