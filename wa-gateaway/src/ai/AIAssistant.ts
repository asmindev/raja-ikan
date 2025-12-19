/**
 * AI Assistant menggunakan Google Gemini dengan Function Calling
 */

import { Type } from "@google/genai";
import type { ChatMessage, AIAssistantConfig } from "./types";
import { availableFunctions, initializeFunctions } from "./functions";
import { Logger } from "../core/logger/Logger";
import { chatHistoryService } from "../services/ChatHistoryService";
import type { IGeminiClient } from "../infrastructure/external/gemini";

export class AIAssistant {
    private geminiClient: IGeminiClient;
    private config: AIAssistantConfig;
    private logger: Logger;
    private conversationHistory: Map<string, ChatMessage[]>;

    constructor(
        geminiClient: IGeminiClient,
        config?: Partial<AIAssistantConfig>
    ) {
        console.log("Initializing AIAssistant with Gemini client");

        this.geminiClient = geminiClient;

        // Initialize functions with GeminiClient dependency
        initializeFunctions(geminiClient);

        this.config = {
            model: config?.model || "gemini-2.0-flash",
            temperature: config?.temperature ?? 0.7,
            maxTokens: config?.maxTokens ?? 1000,

            systemPrompt:
                config?.systemPrompt ||
                `You are an order processing assistant for "Raja Ikan" fish store.

Your PRIMARY task is to extract order information using the extract_order_items function whenever a customer mentions a product with quantity.

MANDATORY BEHAVIOR:
If input contains: [product_name] + [quantity_number] + optional("kg"|"kilo"|"ekor"|"buah")
Then: ALWAYS call extract_order_items function FIRST

DO NOT write a response text without calling the function first.

Available functions:
- extract_order_items(text: string) - Extract order items from customer message
- get_products() - List available products
- extract_confirmation(text: string) - Parse yes/no responses

After extract_order_items returns data, then you can respond in Indonesian.`,
        };

        this.logger = new Logger("AIAssistant");
        this.conversationHistory = new Map();
    }

    /**
     * Get atau create conversation history untuk user
     * Load dari MongoDB jika belum ada di memory
     */
    private async getConversationHistory(
        userId: string
    ): Promise<ChatMessage[]> {
        if (!this.conversationHistory.has(userId)) {
            // Load dari database
            const dbMessages = await chatHistoryService.getChatHistory(
                userId,
                18
            ); // 18 messages + 2 system

            const history: ChatMessage[] = [
                {
                    role: "system",
                    content: this.config.systemPrompt!,
                },
            ];

            // Convert db messages ke ChatMessage format
            // Include both AI and admin messages as assistant role
            for (const msg of dbMessages) {
                history.push({
                    role: msg.role,
                    content: msg.content,
                });
            }

            this.logger.debug(
                `Loaded ${dbMessages.length} messages from DB for ${userId}`
            );

            this.conversationHistory.set(userId, history);
        }
        return this.conversationHistory.get(userId)!;
    }

    /**
     * Add message to conversation history (memory & database)
     */
    private async addToHistory(userId: string, message: ChatMessage) {
        const history = await this.getConversationHistory(userId);
        history.push(message);

        // Save ke database (skip system messages)
        if (message.role !== "system") {
            await chatHistoryService.addMessage(
                userId,
                message.role as "user" | "assistant",
                message.content,
                "text",
                "ai" // AI bot messages
            );
        }

        // Batasi history maksimal 20 pesan untuk menghemat token
        if (history.length > 20) {
            // Simpan system prompt dan 18 pesan terakhir
            const systemPrompt = history[0];
            const recentMessages = history.slice(-18);
            if (systemPrompt) {
                this.conversationHistory.set(userId, [
                    systemPrompt,
                    ...recentMessages,
                ]);
            }
        }
    }

    /**
     * Invalidate in-memory cache untuk user (force reload dari DB next time)
     */
    public invalidateCache(userId: string) {
        this.conversationHistory.delete(userId);
        this.logger.info(`Cache invalidated for user: ${userId}`);
    }

    /**
     * Clear conversation history untuk user tertentu (memory & database)
     */
    public async clearHistory(userId: string) {
        this.conversationHistory.delete(userId);
        await chatHistoryService.clearHistory(userId);
        this.logger.info(`Conversation history cleared for user: ${userId}`);
    }

    /**
     * Process user message dengan function calling
     */
    public async chat(
        userId: string,
        message: string
    ): Promise<{ response: string; functionCalls?: any[] }> {
        try {
            // Add user message to history
            await this.addToHistory(userId, {
                role: "user",
                content: message,
            });

            const history = await this.getConversationHistory(userId);
            const functionCalls: any[] = [];

            // Konversi function definitions ke format Gemini
            const tools = [
                {
                    functionDeclarations: Object.values(availableFunctions).map(
                        (fn) => ({
                            name: fn.name,
                            description: fn.description,
                            parameters: {
                                type: Type.OBJECT,
                                properties: fn.parameters.properties,
                                required: fn.parameters.required || [],
                            },
                        })
                    ),
                },
            ];

            this.logger.debug(
                `Available functions: ${
                    tools[0]?.functionDeclarations
                        ?.map((f) => f.name)
                        .join(", ") || "none"
                }`
            );

            // Build contents dari full conversation history
            // Skip system prompt (index 0) karena sudah di-handle terpisah
            const contents: any[] = [];

            // Add conversation history (skip system prompt)
            for (let i = 1; i < history.length; i++) {
                const msg = history[i];
                if (msg) {
                    contents.push({
                        role: msg.role === "assistant" ? "model" : "user",
                        parts: [{ text: msg.content }],
                    });
                }
            }

            // Add current user message
            contents.push({
                role: "user",
                parts: [{ text: message }],
            });

            this.logger.debug(
                `Sending ${contents.length} messages to Gemini for ${userId}`
            );

            // Call generateContent dengan tools dan system instruction
            // Use ANY mode to force function calling
            let response = await this.geminiClient.generateContent({
                contents: contents,
                systemInstruction: this.config.systemPrompt,
                tools: tools,
                toolConfig: {
                    functionCallingConfig: {
                        mode: "ANY",
                    },
                },
                temperature: 0.3,
                maxOutputTokens: this.config.maxTokens,
            });

            this.logger.debug(
                `Gemini response - functionCalls: ${
                    response.functionCalls?.length || 0
                }, text: ${response.text?.substring(0, 100)}`
            );

            // Handle function calls (bisa parallel/multiple function calls)
            while (
                response.functionCalls &&
                response.functionCalls.length > 0
            ) {
                const functionResponses = [];

                for (const call of response.functionCalls) {
                    const functionName = call.name || "";
                    const functionArgs = call.args || {};

                    this.logger.info(
                        `Executing function: ${functionName} with args:`,
                        functionArgs
                    );

                    try {
                        const fn = availableFunctions[functionName];
                        if (!fn) {
                            throw new Error(
                                `Function ${functionName} not found`
                            );
                        }

                        const functionResult = await fn.execute(functionArgs);

                        functionCalls.push({
                            function: functionName,
                            args: functionArgs,
                            result: functionResult,
                        });

                        // Build function response sesuai format dokumentasi
                        functionResponses.push({
                            name: functionName,
                            response: { result: functionResult },
                        });

                        this.logger.info(
                            `Function ${functionName} executed successfully`
                        );
                    } catch (error) {
                        this.logger.error(
                            `Error executing function ${functionName}:`,
                            error
                        );
                        functionResponses.push({
                            name: functionName,
                            response: {
                                error:
                                    error instanceof Error
                                        ? error.message
                                        : "Unknown error",
                            },
                        });
                    }
                }

                // Append model's response dengan function calls ke contents
                // Sesuai dokumentasi: contents.append(response.candidates[0].content)
                if (response.candidates && response.candidates[0]) {
                    contents.push(response.candidates[0].content);
                }

                // Append function responses
                // Sesuai format: types.Content(role="user", parts=[function_response_part])
                contents.push({
                    role: "user",
                    parts: functionResponses.map((fr) => ({
                        functionResponse: {
                            name: fr.name,
                            response: fr.response,
                        },
                    })),
                });

                // Call lagi dengan function results
                response = await this.geminiClient.generateContent({
                    contents: contents,
                    systemInstruction: this.config.systemPrompt,
                    tools: tools,
                    temperature: 0,
                    maxOutputTokens: this.config.maxTokens,
                });
            }

            // Get final text response
            const finalResponse = response.text || "Maaf, saya tidak mengerti.";

            // Add final assistant response to history
            await this.addToHistory(userId, {
                role: "assistant",
                content: finalResponse,
            });

            return {
                response: finalResponse,
                functionCalls:
                    functionCalls.length > 0 ? functionCalls : undefined,
            };
        } catch (error) {
            this.logger.error("Error in AI chat:", error);
            throw error;
        }
    }

    /**
     * Get conversation history untuk user
     */
    public async getHistory(userId: string): Promise<ChatMessage[]> {
        return await this.getConversationHistory(userId);
    }
}
