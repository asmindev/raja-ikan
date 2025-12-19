/**
 * Google Gemini Client Implementation
 *
 * Wraps Google GenAI SDK to isolate external dependency
 */

import { GoogleGenAI } from "@google/genai";
import type {
    IGeminiClient,
    GeminiConfig,
    GeminiResponse,
    GeminiGenerateRequest,
} from "./IGeminiClient";
import { Logger } from "../../../core/logger/Logger";

export class GeminiClient implements IGeminiClient {
    private genAI: GoogleGenAI;
    private config: GeminiConfig;
    private logger = new Logger("GeminiClient");

    constructor(config: GeminiConfig) {
        this.config = config;
        this.genAI = new GoogleGenAI({ apiKey: config.apiKey });
        this.logger.info("✅ Gemini client initialized");
    }

    async generateContent(
        request: GeminiGenerateRequest
    ): Promise<GeminiResponse> {
        try {
            this.logger.debug(
                `Generating content with ${request.contents.length} messages`
            );

            const response = await this.genAI.models.generateContent({
                model: this.config.model,
                contents: request.contents,
                config: {
                    systemInstruction: request.systemInstruction,
                    tools: request.tools,
                    toolConfig: request.toolConfig,
                    temperature: request.temperature ?? this.config.temperature,
                    maxOutputTokens:
                        request.maxOutputTokens ?? this.config.maxTokens,
                },
            });

            // Log raw response untuk debugging
            this.logger.debug("Raw Gemini response:", {
                text: response.text,
                functionCalls: response.functionCalls,
                candidatesCount: response.candidates?.length || 0,
            });

            // Log candidates details
            if (response.candidates && response.candidates.length > 0) {
                const candidate = response.candidates[0];
                if (candidate) {
                    this.logger.debug("First candidate content:", {
                        role: candidate.content?.role,
                        partsCount: candidate.content?.parts?.length || 0,
                        parts: candidate.content?.parts,
                    });
                }
            }

            return {
                text: response.text,
                functionCalls: response.functionCalls?.map((fc) => ({
                    name: fc.name || "",
                    args: fc.args || {},
                })),
                candidates: response.candidates,
            };
        } catch (error) {
            this.logger.error("Error generating content:", error);
            throw error;
        }
    }
}
