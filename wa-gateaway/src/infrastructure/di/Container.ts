/**
 * Dependency Injection Container
 *
 * Manages application dependencies and provides singleton instances
 * for services, repositories, factories, use cases, and external clients.
 */

import { AIAssistant } from "../../ai/AIAssistant";
import { OrderService } from "../../domain/order/services/OrderService";
import { OrderRepository } from "../database/repositories/OrderRepository";
import { MessageHandlerFactory } from "../whatsapp/message-handlers/MessageHandlerFactory";
import type { IOrderRepository } from "../../domain/order/repositories/IOrderRepository";

// External Clients
import {
    GeminiClient,
    type IGeminiClient,
    BackendClient,
    type IBackendClient,
} from "../external";
import { CONFIG } from "../../config/config";

// Use Cases
import {
    ProcessMessageUseCase,
    CreatePendingOrderUseCase,
    ConfirmOrderUseCase,
    CancelOrderUseCase,
} from "../../application/use-cases";

/**
 * Simple DI Container using singleton pattern
 */
export class Container {
    private static instance: Container;

    // External Clients
    private geminiClient?: IGeminiClient;
    private backendClient?: IBackendClient;

    // Repositories
    private orderRepository?: IOrderRepository;

    // Services
    private aiAssistant?: AIAssistant;
    private orderService?: OrderService;

    // Factories
    private messageHandlerFactory?: MessageHandlerFactory;

    // Use Cases
    private processMessageUseCase?: ProcessMessageUseCase;
    private createPendingOrderUseCase?: CreatePendingOrderUseCase;
    private confirmOrderUseCase?: ConfirmOrderUseCase;
    private cancelOrderUseCase?: CancelOrderUseCase;

    private constructor() {}

    /**
     * Get singleton instance of container
     */
    static getInstance(): Container {
        if (!Container.instance) {
            Container.instance = new Container();
        }
        return Container.instance;
    }

    // ==================== External Clients ====================

    /**
     * Get Gemini client instance
     */
    getGeminiClient(): IGeminiClient {
        if (!this.geminiClient) {
            const apiKey = CONFIG.GEMINI_API_KEY;
            if (!apiKey) {
                throw new Error("GEMINI_API_KEY not configured");
            }
            this.geminiClient = new GeminiClient({
                apiKey,
                model: "gemini-2.0-flash",
                temperature: 0.7,
                maxTokens: 1000,
            });
        }
        return this.geminiClient;
    }

    /**
     * Get Backend API client instance
     */
    getBackendClient(): IBackendClient {
        if (!this.backendClient) {
            const baseUrl = CONFIG.BACKEND_URL || "http://localhost:8000";
            this.backendClient = new BackendClient({
                baseUrl,
                apiKey: CONFIG.BACKEND_API_KEY,
            });
        }
        return this.backendClient;
    }

    // ==================== Repositories ====================

    /**
     * Get order repository instance
     */
    getOrderRepository(): IOrderRepository {
        if (!this.orderRepository) {
            this.orderRepository = new OrderRepository();
        }
        return this.orderRepository;
    }

    /**
     * Get AI assistant instance
     */
    getAIAssistant(): AIAssistant {
        if (!this.aiAssistant) {
            this.aiAssistant = new AIAssistant(this.getGeminiClient(), {
                model: "gemini-2.0-flash",
                temperature: 0.7,
            });
        }
        return this.aiAssistant;
    }

    /**
     * Get order service instance
     */
    getOrderService(): OrderService {
        if (!this.orderService) {
            this.orderService = new OrderService(this.getOrderRepository());
        }
        return this.orderService;
    }

    /**
     * Get message handler factory instance
     */
    getMessageHandlerFactory(): MessageHandlerFactory {
        if (!this.messageHandlerFactory) {
            this.messageHandlerFactory = new MessageHandlerFactory(
                this.getAIAssistant(),
                this.getOrderService()
            );
        }
        return this.messageHandlerFactory;
    }

    // ==================== Use Cases ====================

    /**
     * Get process message use case instance
     */
    getProcessMessageUseCase(): ProcessMessageUseCase {
        if (!this.processMessageUseCase) {
            this.processMessageUseCase = new ProcessMessageUseCase(
                this.getAIAssistant(),
                this.getOrderService()
            );
        }
        return this.processMessageUseCase;
    }

    /**
     * Get create pending order use case instance
     */
    getCreatePendingOrderUseCase(): CreatePendingOrderUseCase {
        if (!this.createPendingOrderUseCase) {
            this.createPendingOrderUseCase = new CreatePendingOrderUseCase(
                this.getOrderService()
            );
        }
        return this.createPendingOrderUseCase;
    }

    /**
     * Get confirm order use case instance
     */
    getConfirmOrderUseCase(): ConfirmOrderUseCase {
        if (!this.confirmOrderUseCase) {
            this.confirmOrderUseCase = new ConfirmOrderUseCase(
                this.getOrderService()
            );
        }
        return this.confirmOrderUseCase;
    }

    /**
     * Get cancel order use case instance
     */
    getCancelOrderUseCase(): CancelOrderUseCase {
        if (!this.cancelOrderUseCase) {
            this.cancelOrderUseCase = new CancelOrderUseCase(
                this.getOrderService()
            );
        }
        return this.cancelOrderUseCase;
    }

    /**
     * Reset all instances (useful for testing)
     */
    reset(): void {
        this.geminiClient = undefined;
        this.backendClient = undefined;
        this.orderRepository = undefined;
        this.aiAssistant = undefined;
        this.orderService = undefined;
        this.messageHandlerFactory = undefined;
        this.processMessageUseCase = undefined;
        this.createPendingOrderUseCase = undefined;
        this.confirmOrderUseCase = undefined;
        this.cancelOrderUseCase = undefined;
    }
}

/**
 * Convenience function to get container instance
 */
export const getContainer = () => Container.getInstance();
