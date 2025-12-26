// src/app.ts
import { Hono as Hono6 } from "hono";
import { cors } from "hono/cors";
import { logger as honoLogger } from "hono/logger";
import { createServer } from "http";

// src/whatsapp/WhatsAppService.ts
import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState
} from "baileys";
import QRCode from "qrcode";

// src/core/logger/Logger.ts
import fs from "fs/promises";
import path2 from "path";

// src/config/config.ts
import path from "path";
var CONFIG = {
  PORT: process.env.PORT || 3000,
  SESSION_PATH: path.resolve(process.cwd(), "./sesi"),
  LOG_PATH: path.resolve(process.cwd(), "./logs"),
  LOG_LEVEL: process.env.LOG_LEVEL || "info",
  BACKEND_URL: process.env.BACKEND_URL || "http://localhost:8000",
  BACKEND_API_URL: process.env.BACKEND_API_URL || "http://localhost:8000/api/v1",
  BACKEND_API_KEY: process.env.BACKEND_API_KEY || "",
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || "",
  MONGODB_URI: process.env.MONGODB_URI || "mongodb://localhost:27017/wa-gateway",
  AUTO_CLEAR_SESSION: process.env.AUTO_CLEAR_SESSION !== "false"
};

// src/core/logger/Logger.ts
class Logger {
  context;
  static logFile = path2.join(CONFIG.LOG_PATH, "wa-gateway.log");
  static writeQueue = [];
  static isWriting = false;
  constructor(context) {
    this.context = context;
  }
  static getLevelPriority(level) {
    const priorities = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3,
      fatal: 4
    };
    return priorities[level];
  }
  shouldLog(level) {
    const currentPriority = Logger.getLevelPriority(CONFIG.LOG_LEVEL);
    const messagePriority = Logger.getLevelPriority(level);
    return messagePriority >= currentPriority;
  }
  formatMessage(entry) {
    const emoji = this.getLevelEmoji(entry.level);
    const levelStr = entry.level.toUpperCase().padEnd(5);
    const contextStr = `[${entry.context}]`.padEnd(20);
    let output = `${entry.timestamp} ${emoji} ${levelStr} ${contextStr} ${entry.message}`;
    if (entry.metadata && Object.keys(entry.metadata).length > 0) {
      output += `
    \uD83D\uDCCB ${JSON.stringify(entry.metadata, null, 2).replace(/\n/g, `
    `)}`;
    }
    if (entry.error) {
      output += `
    ❌ ${entry.error.message}`;
      if (entry.error.stack) {
        output += `
    ${entry.error.stack.replace(/\n/g, `
    `)}`;
      }
    }
    return output;
  }
  getLevelEmoji(level) {
    const emojis = {
      debug: "\uD83D\uDD0D",
      info: "ℹ️ ",
      warn: "⚠️ ",
      error: "❌",
      fatal: "\uD83D\uDC80"
    };
    return emojis[level];
  }
  getConsoleMethod(level) {
    if (level === "warn")
      return "warn";
    if (level === "error" || level === "fatal")
      return "error";
    return "log";
  }
  async writeToFile(message) {
    Logger.writeQueue.push(message);
    if (Logger.isWriting)
      return;
    Logger.isWriting = true;
    try {
      await fs.mkdir(path2.dirname(Logger.logFile), { recursive: true });
      while (Logger.writeQueue.length > 0) {
        const messages = Logger.writeQueue.splice(0, 100);
        const content = messages.join(`
`) + `
`;
        await fs.appendFile(Logger.logFile, content);
      }
    } catch (error) {
      console.error("Failed to write to log file:", error);
    } finally {
      Logger.isWriting = false;
    }
  }
  log(level, message, metadata, error) {
    if (!this.shouldLog(level))
      return;
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      context: this.context,
      message,
      metadata,
      error
    };
    const formattedMessage = this.formatMessage(entry);
    const consoleMethod = this.getConsoleMethod(level);
    console[consoleMethod](formattedMessage);
    this.writeToFile(formattedMessage).catch(() => {});
  }
  debug(message, metadata) {
    this.log("debug", message, metadata);
  }
  info(message, metadata) {
    this.log("info", message, metadata);
  }
  warn(message, metadata) {
    this.log("warn", message, metadata);
  }
  error(message, error, metadata) {
    const errorObj = error instanceof Error ? error : undefined;
    const meta = error instanceof Error ? metadata : { ...metadata, error };
    this.log("error", message, meta, errorObj);
  }
  fatal(message, error, metadata) {
    const errorObj = error instanceof Error ? error : undefined;
    const meta = error instanceof Error ? metadata : { ...metadata, error };
    this.log("fatal", message, meta, errorObj);
  }
  child(childContext) {
    return new Logger(`${this.context}:${childContext}`);
  }
  static async rotateLogs() {
    try {
      const stats = await fs.stat(Logger.logFile);
      const maxSize = 10 * 1024 * 1024;
      if (stats.size > maxSize) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const archiveFile = Logger.logFile.replace(".log", `.${timestamp}.log`);
        await fs.rename(Logger.logFile, archiveFile);
        console.log(`\uD83D\uDCE6 Log file rotated to ${archiveFile}`);
        const logDir = path2.dirname(Logger.logFile);
        const files = await fs.readdir(logDir);
        const logFiles = files.filter((f) => f.startsWith("wa-gateway.") && f.endsWith(".log")).sort().reverse();
        for (let i = 5;i < logFiles.length; i++) {
          const fileToDelete = logFiles[i];
          if (fileToDelete) {
            await fs.unlink(path2.join(logDir, fileToDelete));
          }
        }
      }
    } catch (error) {}
  }
}
var baileysLogger = {
  level: "silent",
  fatal: () => {},
  error: () => {},
  warn: () => {},
  info: () => {},
  debug: () => {},
  trace: () => {},
  child: () => baileysLogger
};

// src/ai/AIAssistant.ts
import { Type } from "@google/genai";

// src/ai/functions/getProducts.ts
function formatPrice(price) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(price);
}
async function executeGetProducts(args) {
  try {
    const response = await fetch(`${CONFIG.BACKEND_API_URL}/products`);
    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.statusText}`);
    }
    const data = await response.json();
    let products = Array.isArray(data) ? data : data.data || [];
    products = products.map((p) => ({
      name: p.name,
      price: parseFloat(p.price),
      stock: p.stock || 100
    }));
    if (args.category) {
      products = products.filter((p) => p.category.toLowerCase() === args.category?.toLowerCase());
    }
    if (args.available_only) {
      products = products.filter((p) => p.isAvailable);
    }
    if (args.limit && args.limit > 0) {
      products = products.slice(0, args.limit);
    }
    const formattedProducts = products.map((p, index) => `${index + 1}. ${p.name} - ${formatPrice(p.price)}`).join(`
`);
    return {
      success: true,
      data: {
        total: products.length,
        list: formattedProducts
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}
var getProductsFunction = {
  name: "get_products",
  description: "Mendapatkan daftar ikan segar yang tersedia dari database Raja Ikan. Gunakan function ini ketika customer menanyakan daftar ikan, harga ikan, atau ikan apa saja yang tersedia hari ini. Function ini akan mengembalikan nama ikan dan harga terkini.",
  parameters: {
    type: "object",
    properties: {
      category: {
        type: "string",
        description: "Filter berdasarkan jenis/kategori ikan (misalnya: Ikan Laut, Ikan Air Tawar, Ikan Premium). Kosongkan untuk menampilkan semua ikan."
      },
      available_only: {
        type: "boolean",
        description: "Jika true, hanya tampilkan ikan yang tersedia (fresh/stok ada). Default: false",
        default: false
      },
      limit: {
        type: "number",
        description: "Batasi jumlah ikan yang ditampilkan. Kosongkan untuk menampilkan semua ikan yang tersedia."
      }
    },
    required: []
  },
  execute: executeGetProducts
};

// src/ai/functions/parseOrderIntent.ts
var logger = new Logger("ExtractOrderItems");
var geminiClient = null;
function setGeminiClient(client) {
  geminiClient = client;
  logger.info("GeminiClient injected into extract_order_items function");
}

// src/ai/functions/index.ts
var availableFunctions = {
  get_products: getProductsFunction
};
function initializeFunctions(geminiClient2) {
  setGeminiClient(geminiClient2);
}

// src/services/ChatHistoryService.ts
var logger2 = new Logger("ChatHistoryService");

class ChatHistoryService {
  async getChatHistory(phone, limit = 20) {
    logger2.warn("ChatHistoryService.getChatHistory: Mongoose removed, returning empty array");
    return [];
  }
  async addMessage(phone, role, content, type = "text", source = "ai") {
    logger2.warn("ChatHistoryService.addMessage: Mongoose removed, message not saved");
  }
  async clearHistory(phone) {
    logger2.warn("ChatHistoryService.clearHistory: Mongoose removed, history not cleared");
  }
  async deleteChat(phone) {
    logger2.warn("ChatHistoryService.deleteChat: Mongoose removed, chat not deleted");
  }
  async getActiveChats() {
    logger2.warn("ChatHistoryService.getActiveChats: Mongoose removed, returning empty array");
    return [];
  }
  async addAdminReply(phone, content) {
    logger2.warn("ChatHistoryService.addAdminReply: Mongoose removed, admin reply not saved");
  }
  async getChatStats(phone) {
    logger2.warn("ChatHistoryService.getChatStats: Mongoose removed, returning null");
    return null;
  }
}
var chatHistoryService = new ChatHistoryService;

// src/ai/AIAssistant.ts
class AIAssistant {
  geminiClient;
  config;
  logger;
  conversationHistory;
  constructor(geminiClient2, config) {
    console.log("Initializing AIAssistant with Gemini client");
    this.geminiClient = geminiClient2;
    initializeFunctions(geminiClient2);
    this.config = {
      model: config?.model || "gemini-2.0-flash",
      temperature: config?.temperature ?? 0.7,
      maxTokens: config?.maxTokens ?? 1000,
      systemPrompt: config?.systemPrompt || `You are an order processing assistant for "Raja Ikan" fish store.

Your PRIMARY task is to extract order information using the extract_order_items function whenever a customer mentions a product with quantity.

MANDATORY BEHAVIOR:
If input contains: [product_name] + [quantity_number] + optional("kg"|"kilo"|"ekor"|"buah")
Then: ALWAYS call extract_order_items function FIRST

DO NOT write a response text without calling the function first.

Available functions:
- extract_order_items(text: string) - Extract order items from customer message
- get_products() - List available products
- extract_confirmation(text: string) - Parse yes/no responses

After extract_order_items returns data, then you can respond in Indonesian.`
    };
    this.logger = new Logger("AIAssistant");
    this.conversationHistory = new Map;
  }
  async getConversationHistory(userId) {
    if (!this.conversationHistory.has(userId)) {
      const dbMessages = await chatHistoryService.getChatHistory(userId, 18);
      const history = [
        {
          role: "system",
          content: this.config.systemPrompt
        }
      ];
      for (const msg of dbMessages) {
        history.push({
          role: msg.role,
          content: msg.content
        });
      }
      this.logger.debug(`Loaded ${dbMessages.length} messages from DB for ${userId}`);
      this.conversationHistory.set(userId, history);
    }
    return this.conversationHistory.get(userId);
  }
  async addToHistory(userId, message) {
    const history = await this.getConversationHistory(userId);
    history.push(message);
    if (message.role !== "system") {
      await chatHistoryService.addMessage(userId, message.role, message.content, "text", "ai");
    }
    if (history.length > 20) {
      const systemPrompt = history[0];
      const recentMessages = history.slice(-18);
      if (systemPrompt) {
        this.conversationHistory.set(userId, [
          systemPrompt,
          ...recentMessages
        ]);
      }
    }
  }
  invalidateCache(userId) {
    this.conversationHistory.delete(userId);
    this.logger.info(`Cache invalidated for user: ${userId}`);
  }
  async clearHistory(userId) {
    this.conversationHistory.delete(userId);
    await chatHistoryService.clearHistory(userId);
    this.logger.info(`Conversation history cleared for user: ${userId}`);
  }
  async chat(userId, message) {
    try {
      await this.addToHistory(userId, {
        role: "user",
        content: message
      });
      const history = await this.getConversationHistory(userId);
      const functionCalls = [];
      const tools = [
        {
          functionDeclarations: Object.values(availableFunctions).map((fn) => ({
            name: fn.name,
            description: fn.description,
            parameters: {
              type: Type.OBJECT,
              properties: fn.parameters.properties,
              required: fn.parameters.required || []
            }
          }))
        }
      ];
      this.logger.debug(`Available functions: ${tools[0]?.functionDeclarations?.map((f) => f.name).join(", ") || "none"}`);
      const contents = [];
      for (let i = 1;i < history.length; i++) {
        const msg = history[i];
        if (msg) {
          contents.push({
            role: msg.role === "assistant" ? "model" : "user",
            parts: [{ text: msg.content }]
          });
        }
      }
      contents.push({
        role: "user",
        parts: [{ text: message }]
      });
      this.logger.debug(`Sending ${contents.length} messages to Gemini for ${userId}`);
      let response = await this.geminiClient.generateContent({
        contents,
        systemInstruction: this.config.systemPrompt,
        tools,
        toolConfig: {
          functionCallingConfig: {
            mode: "ANY"
          }
        },
        temperature: 0.3,
        maxOutputTokens: this.config.maxTokens
      });
      this.logger.debug(`Gemini response - functionCalls: ${response.functionCalls?.length || 0}, text: ${response.text?.substring(0, 100)}`);
      while (response.functionCalls && response.functionCalls.length > 0) {
        const functionResponses = [];
        for (const call of response.functionCalls) {
          const functionName = call.name || "";
          const functionArgs = call.args || {};
          this.logger.info(`Executing function: ${functionName} with args:`, functionArgs);
          try {
            const fn = availableFunctions[functionName];
            if (!fn) {
              throw new Error(`Function ${functionName} not found`);
            }
            const functionResult = await fn.execute(functionArgs);
            functionCalls.push({
              function: functionName,
              args: functionArgs,
              result: functionResult
            });
            functionResponses.push({
              name: functionName,
              response: { result: functionResult }
            });
            this.logger.info(`Function ${functionName} executed successfully`);
          } catch (error) {
            this.logger.error(`Error executing function ${functionName}:`, error);
            functionResponses.push({
              name: functionName,
              response: {
                error: error instanceof Error ? error.message : "Unknown error"
              }
            });
          }
        }
        if (response.candidates && response.candidates[0]) {
          contents.push(response.candidates[0].content);
        }
        contents.push({
          role: "user",
          parts: functionResponses.map((fr) => ({
            functionResponse: {
              name: fr.name,
              response: fr.response
            }
          }))
        });
        response = await this.geminiClient.generateContent({
          contents,
          systemInstruction: this.config.systemPrompt,
          tools,
          temperature: 0,
          maxOutputTokens: this.config.maxTokens
        });
      }
      const finalResponse = response.text || "Maaf, saya tidak mengerti.";
      await this.addToHistory(userId, {
        role: "assistant",
        content: finalResponse
      });
      return {
        response: finalResponse,
        functionCalls: functionCalls.length > 0 ? functionCalls : undefined
      };
    } catch (error) {
      this.logger.error("Error in AI chat:", error);
      throw error;
    }
  }
  async getHistory(userId) {
    return await this.getConversationHistory(userId);
  }
}

// src/domain/order/entities/OrderItem.ts
class OrderItem {
  name;
  qty;
  unit;
  price;
  constructor(data) {
    this.validateData(data);
    this.name = data.name.trim();
    this.qty = data.qty;
    this.unit = data.unit || "kg";
    this.price = data.price;
  }
  validateData(data) {
    if (!data.name || data.name.trim().length === 0) {
      throw new Error("Order item name cannot be empty");
    }
    if (data.qty <= 0) {
      throw new Error("Order item quantity must be greater than 0");
    }
  }
  getSubtotal() {
    return this.price ? this.price * this.qty : 0;
  }
  toJSON() {
    return {
      name: this.name,
      qty: this.qty,
      unit: this.unit,
      price: this.price
    };
  }
  toString() {
    return `${this.name} ${this.qty} ${this.unit}`;
  }
}

// src/domain/order/entities/Order.ts
class Order {
  id;
  customerPhone;
  items;
  status;
  totalAmount;
  notes;
  createdAt;
  confirmedAt;
  cancelledAt;
  constructor(data) {
    this.validateData(data);
    this.id = data.id;
    this.customerPhone = this.normalizePhone(data.customerPhone);
    this.items = data.items.map((item) => new OrderItem(item));
    this.status = data.status;
    this.totalAmount = data.totalAmount || this.calculateTotal();
    this.notes = data.notes;
    this.createdAt = data.createdAt || new Date;
    this.confirmedAt = data.confirmedAt;
    this.cancelledAt = data.cancelledAt;
  }
  validateData(data) {
    if (!data.customerPhone) {
      throw new Error("Customer phone is required");
    }
    if (!data.items || data.items.length === 0) {
      throw new Error("Order must have at least one item");
    }
  }
  normalizePhone(phone) {
    let normalized = phone.replace(/[^0-9]/g, "");
    if (normalized.startsWith("0")) {
      normalized = "62" + normalized.substring(1);
    } else if (!normalized.startsWith("62")) {
      normalized = "62" + normalized;
    }
    return normalized;
  }
  calculateTotal() {
    return this.items.reduce((sum, item) => sum + item.getSubtotal(), 0);
  }
  confirm() {
    if (this.status !== "pending" /* PENDING */) {
      throw new Error(`Cannot confirm order with status: ${this.status}`);
    }
    this.status = "confirmed" /* CONFIRMED */;
    this.confirmedAt = new Date;
  }
  cancel() {
    if (this.status === "completed" /* COMPLETED */) {
      throw new Error("Cannot cancel completed order");
    }
    this.status = "cancelled" /* CANCELLED */;
    this.cancelledAt = new Date;
  }
  isPending() {
    return this.status === "pending" /* PENDING */;
  }
  isConfirmed() {
    return this.status === "confirmed";
  }
  isCancelled() {
    return this.status === "cancelled";
  }
  getItemsSummary() {
    return this.items.map((item, idx) => `${idx + 1}. ${item.toString()}`).join(`
`);
  }
  toJSON() {
    return {
      id: this.id,
      customerPhone: this.customerPhone,
      items: this.items.map((item) => item.toJSON()),
      status: this.status,
      totalAmount: this.totalAmount,
      notes: this.notes,
      createdAt: this.createdAt,
      confirmedAt: this.confirmedAt,
      cancelledAt: this.cancelledAt
    };
  }
}

// src/domain/order/services/OrderService.ts
var logger3 = new Logger("OrderService");

class OrderService {
  orderRepository;
  constructor(orderRepository) {
    this.orderRepository = orderRepository;
  }
  async createPendingOrder(customerPhone, items) {
    logger3.info(`Creating pending order for ${customerPhone}`);
    const existingPending = await this.orderRepository.findPendingByCustomerPhone(customerPhone);
    if (existingPending) {
      logger3.info(`Found existing pending order for ${customerPhone}, replacing it`);
      await this.orderRepository.delete(existingPending.id);
    }
    const order = new Order({
      customerPhone,
      items,
      status: "pending" /* PENDING */
    });
    const savedOrder = await this.orderRepository.save(order);
    logger3.info(`Pending order created: ${savedOrder.id}`);
    return savedOrder;
  }
  async confirmOrder(customerPhone) {
    logger3.info(`Confirming order for ${customerPhone}`);
    const pendingOrder = await this.orderRepository.findPendingByCustomerPhone(customerPhone);
    if (!pendingOrder) {
      throw new Error("No pending order found for this customer");
    }
    pendingOrder.confirm();
    const confirmedOrder = await this.orderRepository.save(pendingOrder);
    logger3.info(`Order confirmed: ${confirmedOrder.id}`);
    return confirmedOrder;
  }
  async cancelOrder(customerPhone) {
    logger3.info(`Cancelling order for ${customerPhone}`);
    const pendingOrder = await this.orderRepository.findPendingByCustomerPhone(customerPhone);
    if (!pendingOrder) {
      throw new Error("No pending order found for this customer");
    }
    pendingOrder.cancel();
    const cancelledOrder = await this.orderRepository.save(pendingOrder);
    logger3.info(`Order cancelled: ${cancelledOrder.id}`);
    return cancelledOrder;
  }
  async getPendingOrder(customerPhone) {
    return await this.orderRepository.findPendingByCustomerPhone(customerPhone);
  }
  getOrderSummaryText(order) {
    return `\uD83D\uDCCB *Pesanan Anda:*
${order.getItemsSummary()}

Apakah pesanan ini sudah benar?`;
  }
  async getOrdersByStatus(status) {
    return await this.orderRepository.findByStatus(status);
  }
  async getCustomerOrders(customerPhone) {
    return await this.orderRepository.findByCustomerPhone(customerPhone);
  }
}

// src/infrastructure/database/repositories/OrderRepository.ts
var logger4 = new Logger("OrderRepository");

class OrderRepository {
}

// src/infrastructure/whatsapp/message-handlers/MessageHandler.ts
class MessageHandler {
  logger;
  constructor(loggerName) {
    this.logger = new Logger(loggerName);
  }
  extractMessageInfo(message) {
    const from = message.key.remoteJid;
    const messageType = Object.keys(message.message || {})[0];
    return {
      from: from || "",
      messageType: messageType || "",
      fromMe: message.key.fromMe || false
    };
  }
}

// src/whatsapp/helpers.ts
import { proto } from "atexovi-baileys";
async function sendInteractiveButtons(sock, to, text, buttons, options) {
  const nativeButtons = buttons.map((btn) => proto.Message.InteractiveMessage.NativeFlowMessage.NativeFlowButton.create({
    name: "quick_reply",
    buttonParamsJson: JSON.stringify({
      display_text: btn.displayText,
      id: btn.id
    })
  }));
  await sock.sendMessage(to, {
    text,
    title: options?.title,
    subtitle: options?.subtitle,
    footer: options?.footer,
    interactiveButtons: nativeButtons
  });
}

// src/infrastructure/whatsapp/message-handlers/TextMessageHandler.ts
class TextMessageHandler extends MessageHandler {
  aiAssistant;
  orderService;
  constructor(aiAssistant, orderService) {
    super("TextMessageHandler");
    this.aiAssistant = aiAssistant;
    this.orderService = orderService;
  }
  canHandle(messageType) {
    return messageType === "conversation" || messageType === "extendedTextMessage";
  }
  async handle(sock, message) {
    const { from, fromMe } = this.extractMessageInfo(message);
    if (fromMe)
      return;
    const text = message.message?.conversation || message.message?.extendedTextMessage?.text;
    if (!text)
      return;
    this.logger.info(`\uD83D\uDCE8 Text from ${from}: ${text}`);
    if (text === "list") {
      await this.handleTestCommand(sock, from);
      return;
    }
    await this.processWithAI(sock, from, text);
  }
  async handleTestCommand(sock, from) {
    await sendInteractiveButtons(sock, from, "Choose an option from the list:", [
      { displayText: "Ya, Benar ✅", id: "confirm" },
      { displayText: "Tidak ❌", id: "cancel" }
    ], {
      title: "List Menu",
      subtitle: "Select one",
      footer: "Sent by Raja Ikan"
    });
  }
  async processWithAI(sock, from, text) {
    try {
      this.logger.info(`\uD83E\uDD16 Processing with AI...`);
      const aiResponse = await this.aiAssistant.chat(from, text);
      const orderExtraction = this.extractOrderFromResponse(aiResponse);
      if (aiResponse.response) {
        await sock.sendMessage(from, {
          text: aiResponse.response
        });
        this.logger.info(`✅ AI response sent to ${from}`);
      }
      if (orderExtraction.hasOrder) {
        await this.handleOrderExtraction(sock, from, orderExtraction.items);
      }
    } catch (error) {
      this.logger.error("AI processing error:", error);
      await sock.sendMessage(from, {
        text: "Maaf, terjadi kesalahan. Silakan coba lagi."
      });
    }
  }
  extractOrderFromResponse(aiResponse) {
    let hasOrder = false;
    let items = [];
    this.logger.info(`\uD83D\uDD0D Response from AI:`, aiResponse);
    if (aiResponse.functionCalls && aiResponse.functionCalls.length > 0) {
      const functionNames = aiResponse.functionCalls.map((fc) => fc.function).join(", ");
      this.logger.info(`\uD83D\uDCDE Function calls executed: ${functionNames}`);
      const orderExtraction = aiResponse.functionCalls.find((fc) => fc.function === "extract_order_items");
      if (orderExtraction) {
        this.logger.info(`Order extraction result:`, orderExtraction.result);
        const resultData = orderExtraction.result?.data || orderExtraction.result;
        const extractedItems = resultData?.order_items;
        this.logger.info(`Extracted items:`, extractedItems);
        if (extractedItems && Array.isArray(extractedItems) && extractedItems.length > 0) {
          hasOrder = true;
          items = extractedItems;
          this.logger.info(`✅ Extracted ${items.length} order items`);
        } else {
          this.logger.warn(`⚠️ extract_order_items called but returned empty array`);
        }
      }
    } else {
      this.logger.info(`ℹ️  No function calls in AI response`);
    }
    return { hasOrder, items };
  }
  async handleOrderExtraction(sock, from, items) {
    try {
      const order = await this.orderService.createPendingOrder(from, items);
      const orderSummary = this.orderService.getOrderSummaryText(order);
      await sendInteractiveButtons(sock, from, orderSummary, [
        { displayText: "Ya, Benar ✅", id: "confirm_order" },
        { displayText: "Tidak, Batalkan ❌", id: "cancel_order" }
      ], {
        title: "Konfirmasi Pesanan",
        footer: "Raja Ikan - Ikan Segar Terpercaya"
      });
      this.logger.info(`\uD83D\uDCE4 Confirmation buttons sent to ${from}`);
    } catch (error) {
      this.logger.error("Failed to create pending order:", error);
    }
  }
}

// src/infrastructure/whatsapp/message-handlers/ButtonResponseHandler.ts
class ButtonResponseHandler extends MessageHandler {
  orderService;
  allowedMsgType = [
    "messageContextInfo",
    "buttonsResponseMessage",
    "templateButtonReplyMessage",
    "interactiveResponseMessage"
  ];
  constructor(orderService) {
    super("ButtonResponseHandler");
    this.orderService = orderService;
  }
  canHandle(messageType) {
    return this.allowedMsgType.includes(messageType);
  }
  async handle(sock, message) {
    const { from, fromMe, messageType } = this.extractMessageInfo(message);
    if (fromMe)
      return;
    this.logger.debug(`Message keys: ${Object.keys(message.message || {}).join(", ")}`);
    const buttonId = this.extractButtonId(message, messageType);
    if (!buttonId) {
      this.logger.warn(`Could not extract button ID from message`);
      return;
    }
    this.logger.info(`\uD83D\uDD18 Button clicked by ${from}: ${buttonId}`);
    await this.handleButtonAction(sock, from, buttonId);
  }
  extractButtonId(message, messageType) {
    if (messageType === "buttonsResponseMessage") {
      return message.message?.buttonsResponseMessage?.selectedButtonId || null;
    }
    if (messageType === "templateButtonReplyMessage") {
      return message.message?.templateButtonReplyMessage?.selectedId || null;
    }
    if (messageType === "interactiveResponseMessage") {
      const interactiveResponse = message.message?.interactiveResponseMessage;
      const nativeFlowResponseMessage = interactiveResponse?.nativeFlowResponseMessage;
      if (nativeFlowResponseMessage?.paramsJson) {
        try {
          const params = JSON.parse(nativeFlowResponseMessage.paramsJson);
          return params.id || null;
        } catch (error) {
          this.logger.error("Failed to parse interactive response:", error);
          return null;
        }
      }
    }
    return null;
  }
  async handleButtonAction(sock, from, buttonId) {
    try {
      if (buttonId === "confirm_order") {
        await this.confirmOrder(sock, from);
      } else if (buttonId === "cancel_order") {
        await this.cancelOrder(sock, from);
      } else {
        this.logger.warn(`Unknown button action: ${buttonId}`);
      }
    } catch (error) {
      this.logger.error(`Failed to handle button action:`, error);
      await sock.sendMessage(from, {
        text: "Maaf, terjadi kesalahan. Silakan coba lagi."
      });
    }
  }
  async confirmOrder(sock, from) {
    try {
      const order = await this.orderService.confirmOrder(from);
      await sock.sendMessage(from, {
        text: `✅ Pesanan Anda telah dikonfirmasi!

${order.getItemsSummary()}

Kami akan segera memproses pesanan ini. Terima kasih!`
      });
      this.logger.info(`✅ Order confirmed by ${from}: ${order.id}`);
    } catch (error) {
      this.logger.error(`Failed to confirm order:`, error);
      await sock.sendMessage(from, {
        text: "Maaf, tidak ada pesanan yang perlu dikonfirmasi."
      });
    }
  }
  async cancelOrder(sock, from) {
    try {
      await this.orderService.cancelOrder(from);
      await sock.sendMessage(from, {
        text: "❌ Pesanan dibatalkan. Silakan pesan kembali jika ada perubahan."
      });
      this.logger.info(`❌ Order cancelled by ${from}`);
    } catch (error) {
      this.logger.error(`Failed to cancel order:`, error);
      await sock.sendMessage(from, {
        text: "Maaf, tidak ada pesanan yang perlu dibatalkan."
      });
    }
  }
}

// src/infrastructure/whatsapp/message-handlers/MediaMessageHandler.ts
class MediaMessageHandler extends MessageHandler {
  constructor() {
    super("MediaMessageHandler");
  }
  canHandle(messageType) {
    return messageType === "imageMessage" || messageType === "videoMessage" || messageType === "audioMessage" || messageType === "documentMessage";
  }
  async handle(sock, message) {
    const { from, fromMe, messageType } = this.extractMessageInfo(message);
    if (fromMe)
      return;
    this.logger.info(`\uD83D\uDCCE ${messageType} from ${from}`);
    await this.saveMediaMetadata(from, messageType);
  }
  async saveMediaMetadata(from, messageType) {
    const mediaTypeMap = {
      imageMessage: { content: "[IMAGE]", type: "image" },
      videoMessage: { content: "[VIDEO]", type: "video" },
      audioMessage: { content: "[VOICE]", type: "voice" },
      documentMessage: { content: "[DOCUMENT]", type: "document" }
    };
    const media = mediaTypeMap[messageType];
    if (media) {
      await chatHistoryService.addMessage(from, "user", media.content, media.type);
    }
  }
}

// src/infrastructure/whatsapp/message-handlers/MessageHandlerFactory.ts
var logger5 = new Logger("MessageHandlerFactory");

class MessageHandlerFactory {
  aiAssistant;
  orderService;
  handlers = [];
  constructor(aiAssistant, orderService) {
    this.aiAssistant = aiAssistant;
    this.orderService = orderService;
    this.initializeHandlers();
  }
  initializeHandlers() {
    this.handlers = [
      new TextMessageHandler(this.aiAssistant, this.orderService),
      new ButtonResponseHandler(this.orderService),
      new MediaMessageHandler
    ];
  }
  async processMessage(sock, message) {
    const messageType = Object.keys(message.message || {})[0];
    if (!messageType) {
      logger5.warn("Message has no type");
      return;
    }
    const handler = this.handlers.find((h) => h.canHandle(messageType));
    if (handler) {
      await handler.handle(sock, message);
    } else {
      logger5.info(`No handler for message type: ${messageType}`);
    }
  }
  async processMessages(sock, messages) {
    for (const message of messages) {
      try {
        if (message.key.fromMe)
          continue;
        await this.processMessage(sock, message);
      } catch (error) {
        logger5.error("Error processing message:", error);
      }
    }
  }
}
// src/infrastructure/external/gemini/GeminiClient.ts
import { GoogleGenAI } from "@google/genai";
class GeminiClient {
  genAI;
  config;
  logger = new Logger("GeminiClient");
  constructor(config) {
    this.config = config;
    this.genAI = new GoogleGenAI({ apiKey: config.apiKey });
    this.logger.info("✅ Gemini client initialized");
  }
  async generateContent(request) {
    try {
      this.logger.debug(`Generating content with ${request.contents.length} messages`);
      const response = await this.genAI.models.generateContent({
        model: this.config.model,
        contents: request.contents,
        config: {
          systemInstruction: request.systemInstruction,
          tools: request.tools,
          toolConfig: request.toolConfig,
          temperature: request.temperature ?? this.config.temperature,
          maxOutputTokens: request.maxOutputTokens ?? this.config.maxTokens
        }
      });
      this.logger.debug("Raw Gemini response:", {
        text: response.text,
        functionCalls: response.functionCalls,
        candidatesCount: response.candidates?.length || 0
      });
      if (response.candidates && response.candidates.length > 0) {
        const candidate = response.candidates[0];
        if (candidate) {
          this.logger.debug("First candidate content:", {
            role: candidate.content?.role,
            partsCount: candidate.content?.parts?.length || 0,
            parts: candidate.content?.parts
          });
        }
      }
      return {
        text: response.text,
        functionCalls: response.functionCalls?.map((fc) => ({
          name: fc.name || "",
          args: fc.args || {}
        })),
        candidates: response.candidates
      };
    } catch (error) {
      this.logger.error("Error generating content:", error);
      throw error;
    }
  }
}
// src/infrastructure/external/backend/BackendClient.ts
class BackendClient {
  config;
  logger = new Logger("BackendClient");
  constructor(config) {
    this.config = config;
    this.logger.info(`✅ Backend client initialized: ${config.baseUrl}`);
  }
  async getProducts() {
    try {
      this.logger.debug("Fetching products from backend");
      const response = await fetch(`${this.config.baseUrl}/api/products`, {
        headers: this.getHeaders()
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      this.logger.info(`✅ Fetched ${data.length} products`);
      return data;
    } catch (error) {
      this.logger.error("Error fetching products:", error);
      throw error;
    }
  }
  async getProductById(id) {
    try {
      this.logger.debug(`Fetching product ${id}`);
      const response = await fetch(`${this.config.baseUrl}/api/products/${id}`, {
        headers: this.getHeaders()
      });
      if (response.status === 404) {
        return null;
      }
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      this.logger.info(`✅ Fetched product ${id}`);
      return data;
    } catch (error) {
      this.logger.error(`Error fetching product ${id}:`, error);
      throw error;
    }
  }
  async createOrder(order) {
    try {
      this.logger.debug(`Creating order for ${order.customerPhone}`);
      const response = await fetch(`${this.config.baseUrl}/api/orders`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(order)
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      this.logger.info(`✅ Order created: ${data.orderId}`);
      return { orderId: data.orderId, success: true };
    } catch (error) {
      this.logger.error("Error creating order:", error);
      throw error;
    }
  }
  async updateOrderStatus(orderId, status) {
    try {
      this.logger.debug(`Updating order ${orderId} to status ${status}`);
      const response = await fetch(`${this.config.baseUrl}/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: this.getHeaders(),
        body: JSON.stringify({ status })
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      this.logger.info(`✅ Order ${orderId} status updated to ${status}`);
      return { success: true };
    } catch (error) {
      this.logger.error(`Error updating order ${orderId}:`, error);
      throw error;
    }
  }
  getHeaders() {
    const headers = {
      "Content-Type": "application/json"
    };
    if (this.config.apiKey) {
      headers["Authorization"] = `Bearer ${this.config.apiKey}`;
    }
    return headers;
  }
}
// src/infrastructure/external/whatsapp/WhatsAppClient.ts
class WhatsAppClient {
  socket;
  logger = new Logger("WhatsAppClient");
  constructor(socket) {
    this.socket = socket;
    this.logger.info("✅ WhatsApp client initialized");
  }
  async sendTextMessage(to, text) {
    try {
      await this.socket.sendMessage(to, { text });
      this.logger.debug(`Message sent to ${to}`);
    } catch (error) {
      this.logger.error(`Error sending message to ${to}:`, error);
      throw error;
    }
  }
  async sendInteractiveButtons(to, message, buttons, options) {
    try {
      await sendInteractiveButtons(this.socket, to, message, buttons, options);
      this.logger.debug(`Interactive buttons sent to ${to}`);
    } catch (error) {
      this.logger.error(`Error sending interactive buttons to ${to}:`, error);
      throw error;
    }
  }
  getSocket() {
    return this.socket;
  }
}
// src/application/use-cases/ProcessMessageUseCase.ts
class ProcessMessageUseCase {
  aiAssistant;
  orderService;
  logger = new Logger("ProcessMessageUseCase");
  constructor(aiAssistant, orderService) {
    this.aiAssistant = aiAssistant;
    this.orderService = orderService;
  }
  async execute(request) {
    const { sock, from, text } = request;
    try {
      this.logger.info(`Processing message from ${from}`);
      const aiResponse = await this.aiAssistant.chat(from, text);
      if (aiResponse.response) {
        await sock.sendMessage(from, {
          text: aiResponse.response
        });
        this.logger.info(`✅ AI response sent to ${from}`);
      }
      const orderExtraction = this.extractOrderFromResponse(aiResponse);
      if (orderExtraction.hasOrder) {
        return {
          success: true,
          aiResponse: aiResponse.response,
          orderCreated: true,
          orderItems: orderExtraction.items
        };
      }
      return {
        success: true,
        aiResponse: aiResponse.response,
        orderCreated: false
      };
    } catch (error) {
      this.logger.error("Error processing message:", error);
      await sock.sendMessage(from, {
        text: "Maaf, terjadi kesalahan. Silakan coba lagi."
      });
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }
  extractOrderFromResponse(aiResponse) {
    let hasOrder = false;
    let items = [];
    if (aiResponse.functionCalls && aiResponse.functionCalls.length > 0) {
      const functionNames = aiResponse.functionCalls.map((fc) => fc.function).join(", ");
      this.logger.info(`\uD83D\uDCDE Function calls executed: ${functionNames}`);
      const orderExtraction = aiResponse.functionCalls.find((fc) => fc.function === "extract_order_items");
      if (orderExtraction) {
        this.logger.debug(`Order extraction result:`, orderExtraction.result);
        const resultData = orderExtraction.result?.data || orderExtraction.result;
        const extractedItems = resultData?.order_items;
        if (extractedItems && Array.isArray(extractedItems) && extractedItems.length > 0) {
          hasOrder = true;
          items = extractedItems;
          this.logger.info(`✅ Extracted ${items.length} order items`);
        }
      }
    }
    return { hasOrder, items };
  }
}
// src/application/use-cases/CreatePendingOrderUseCase.ts
class CreatePendingOrderUseCase {
  orderService;
  logger = new Logger("CreatePendingOrderUseCase");
  constructor(orderService) {
    this.orderService = orderService;
  }
  async execute(request) {
    const { sock, customerPhone, orderItems } = request;
    try {
      this.logger.info(`Creating pending order for ${customerPhone}`);
      const order = await this.orderService.createPendingOrder(customerPhone, orderItems);
      const orderSummary = this.orderService.getOrderSummaryText(order);
      await sendInteractiveButtons(sock, customerPhone, orderSummary, [
        { displayText: "Ya, Benar ✅", id: "confirm_order" },
        { displayText: "Tidak, Batalkan ❌", id: "cancel_order" }
      ], {
        title: "Konfirmasi Pesanan",
        footer: "Raja Ikan - Ikan Segar Terpercaya"
      });
      this.logger.info(`\uD83D\uDCE4 Confirmation buttons sent to ${customerPhone}`);
      return {
        success: true,
        orderId: order.id
      };
    } catch (error) {
      this.logger.error("Failed to create pending order:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }
}
// src/application/use-cases/ConfirmOrderUseCase.ts
class ConfirmOrderUseCase {
  orderService;
  logger = new Logger("ConfirmOrderUseCase");
  constructor(orderService) {
    this.orderService = orderService;
  }
  async execute(request) {
    const { sock, customerPhone } = request;
    try {
      this.logger.info(`Confirming order for ${customerPhone}`);
      const pendingOrder = await this.orderService.getPendingOrder(customerPhone);
      if (!pendingOrder) {
        const message = "Tidak ada pesanan yang perlu dikonfirmasi.";
        await sock.sendMessage(customerPhone, { text: message });
        return {
          success: false,
          message,
          error: "No pending order found"
        };
      }
      const confirmedOrder = await this.orderService.confirmOrder(customerPhone);
      if (!confirmedOrder) {
        const message = "Gagal mengkonfirmasi pesanan.";
        await sock.sendMessage(customerPhone, { text: message });
        return {
          success: false,
          message,
          error: "Failed to confirm order"
        };
      }
      const successMessage = `✅ Pesanan Anda telah dikonfirmasi!

${this.orderService.getOrderSummaryText(confirmedOrder)}

Kami akan segera memproses pesanan ini. Terima kasih!`;
      await sock.sendMessage(customerPhone, { text: successMessage });
      this.logger.info(`✅ Order ${confirmedOrder.id} confirmed for ${customerPhone}`);
      return {
        success: true,
        message: successMessage,
        orderId: confirmedOrder.id
      };
    } catch (error) {
      this.logger.error("Error confirming order:", error);
      const errorMessage = "Maaf, terjadi kesalahan saat mengkonfirmasi pesanan.";
      await sock.sendMessage(customerPhone, { text: errorMessage });
      return {
        success: false,
        message: errorMessage,
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }
}
// src/application/use-cases/CancelOrderUseCase.ts
class CancelOrderUseCase {
  orderService;
  logger = new Logger("CancelOrderUseCase");
  constructor(orderService) {
    this.orderService = orderService;
  }
  async execute(request) {
    const { sock, customerPhone } = request;
    try {
      this.logger.info(`Cancelling order for ${customerPhone}`);
      const pendingOrder = await this.orderService.getPendingOrder(customerPhone);
      if (!pendingOrder) {
        const message = "Tidak ada pesanan yang perlu dibatalkan.";
        await sock.sendMessage(customerPhone, { text: message });
        return {
          success: false,
          message,
          error: "No pending order found"
        };
      }
      const cancelledOrder = await this.orderService.cancelOrder(customerPhone);
      const cancelMessage = "❌ Pesanan dibatalkan. Silakan pesan kembali jika ada perubahan atau ingin memesan produk lain.";
      await sock.sendMessage(customerPhone, { text: cancelMessage });
      this.logger.info(`❌ Order ${cancelledOrder.id} cancelled for ${customerPhone}`);
      return {
        success: true,
        message: cancelMessage,
        orderId: cancelledOrder.id
      };
    } catch (error) {
      this.logger.error("Error cancelling order:", error);
      const errorMessage = "Maaf, terjadi kesalahan saat membatalkan pesanan.";
      await sock.sendMessage(customerPhone, { text: errorMessage });
      return {
        success: false,
        message: errorMessage,
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }
}
// src/infrastructure/di/Container.ts
class Container {
  static instance;
  geminiClient;
  backendClient;
  orderRepository;
  aiAssistant;
  orderService;
  messageHandlerFactory;
  processMessageUseCase;
  createPendingOrderUseCase;
  confirmOrderUseCase;
  cancelOrderUseCase;
  constructor() {}
  static getInstance() {
    if (!Container.instance) {
      Container.instance = new Container;
    }
    return Container.instance;
  }
  getGeminiClient() {
    if (!this.geminiClient) {
      const apiKey = CONFIG.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY not configured");
      }
      this.geminiClient = new GeminiClient({
        apiKey,
        model: "gemini-2.0-flash",
        temperature: 0.7,
        maxTokens: 1000
      });
    }
    return this.geminiClient;
  }
  getBackendClient() {
    if (!this.backendClient) {
      const baseUrl = CONFIG.BACKEND_URL || "http://localhost:8000";
      this.backendClient = new BackendClient({
        baseUrl,
        apiKey: CONFIG.BACKEND_API_KEY
      });
    }
    return this.backendClient;
  }
  getOrderRepository() {
    if (!this.orderRepository) {
      this.orderRepository = new OrderRepository;
    }
    return this.orderRepository;
  }
  getAIAssistant() {
    if (!this.aiAssistant) {
      this.aiAssistant = new AIAssistant(this.getGeminiClient(), {
        model: "gemini-2.0-flash",
        temperature: 0.7
      });
    }
    return this.aiAssistant;
  }
  getOrderService() {
    if (!this.orderService) {
      this.orderService = new OrderService(this.getOrderRepository());
    }
    return this.orderService;
  }
  getMessageHandlerFactory() {
    if (!this.messageHandlerFactory) {
      this.messageHandlerFactory = new MessageHandlerFactory(this.getAIAssistant(), this.getOrderService());
    }
    return this.messageHandlerFactory;
  }
  getProcessMessageUseCase() {
    if (!this.processMessageUseCase) {
      this.processMessageUseCase = new ProcessMessageUseCase(this.getAIAssistant(), this.getOrderService());
    }
    return this.processMessageUseCase;
  }
  getCreatePendingOrderUseCase() {
    if (!this.createPendingOrderUseCase) {
      this.createPendingOrderUseCase = new CreatePendingOrderUseCase(this.getOrderService());
    }
    return this.createPendingOrderUseCase;
  }
  getConfirmOrderUseCase() {
    if (!this.confirmOrderUseCase) {
      this.confirmOrderUseCase = new ConfirmOrderUseCase(this.getOrderService());
    }
    return this.confirmOrderUseCase;
  }
  getCancelOrderUseCase() {
    if (!this.cancelOrderUseCase) {
      this.cancelOrderUseCase = new CancelOrderUseCase(this.getOrderService());
    }
    return this.cancelOrderUseCase;
  }
  reset() {
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
var getContainer = () => Container.getInstance();

// src/whatsapp/messages/index.ts
var logger6 = new Logger("MessageHandler");
async function messageHandlers(sock, messages) {
  try {
    const container = getContainer();
    const messageHandlerFactory = container.getMessageHandlerFactory();
    logger6.info(`\uD83D\uDCE8 Processing ${messages.length} message(s)`);
    await messageHandlerFactory.processMessages(sock, messages);
    logger6.info(`✅ All messages processed`);
  } catch (error) {
    logger6.error("Error in message handler:", error);
  }
}

// src/whatsapp/WhatsAppService.ts
class WhatsAppService {
  logger;
  socket = null;
  isConnected = false;
  userInfo;
  currentQRCode = null;
  qrCodeCallback;
  connectionUpdateCallback;
  constructor() {
    this.logger = new Logger("WhatsAppService");
  }
  onQRCode(callback) {
    this.qrCodeCallback = callback;
  }
  onConnectionUpdate(callback) {
    this.connectionUpdateCallback = callback;
  }
  getStatus() {
    return {
      connected: this.isConnected,
      user: this.userInfo,
      qrCode: this.currentQRCode || undefined
    };
  }
  getQRCode() {
    return this.currentQRCode;
  }
  async sendMessage(to, text) {
    if (!this.socket || !this.isConnected) {
      throw new Error("WhatsApp is not connected");
    }
    const jid = this.formatJID(to);
    await this.socket.sendMessage(jid, { text });
    this.logger.info(`✅ Message sent to ${to}`);
  }
  async logout() {
    if (this.socket) {
      await this.socket.logout();
    }
    this.resetState();
    this.logger.info("\uD83D\uDC4B Logged out from WhatsApp");
  }
  async restart() {
    this.logger.info("\uD83D\uDD04 Restarting WhatsApp connection...");
    await this.closeSocket();
    this.resetState();
    await this.initialize();
  }
  async initialize() {
    try {
      this.logger.info("\uD83D\uDE80 Initializing WhatsApp...");
      const { state, saveCreds } = await useMultiFileAuthState(CONFIG.SESSION_PATH);
      this.socket = makeWASocket({
        auth: state,
        logger: baileysLogger,
        printQRInTerminal: false,
        syncFullHistory: false
      });
      this.socket.ev.on("creds.update", saveCreds);
      this.setupEventHandlers();
      this.logger.info("✅ WhatsApp initialized");
    } catch (error) {
      this.logger.error("❌ Initialization failed:", error);
      throw error;
    }
  }
  setupEventHandlers() {
    if (!this.socket)
      return;
    this.setupConnectionEvents();
    this.setupMessageEvents();
  }
  setupConnectionEvents() {
    if (!this.socket)
      return;
    this.socket.ev.on("connection.update", async (update) => {
      const { connection, lastDisconnect, qr } = update;
      if (qr)
        await this.onQR(qr);
      if (connection === "close")
        await this.onDisconnect(lastDisconnect);
      if (connection === "open")
        await this.onConnect();
    });
  }
  async onQR(qrRaw) {
    try {
      this.logger.info("\uD83D\uDCF1 QR code generated");
      const qrDataURL = await QRCode.toDataURL(qrRaw);
      this.currentQRCode = qrDataURL;
      this.qrCodeCallback?.(qrDataURL);
      this.connectionUpdateCallback?.({
        connected: false,
        qrCode: qrDataURL
      });
    } catch (error) {
      this.logger.error("QR generation failed:", error);
    }
  }
  async onDisconnect(lastDisconnect) {
    const statusCode = lastDisconnect?.error?.output?.statusCode;
    const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
    this.logger.warn(`❌ Disconnected (reconnect: ${shouldReconnect})`);
    this.isConnected = false;
    this.userInfo = undefined;
    this.connectionUpdateCallback?.({ connected: false });
    if (shouldReconnect) {
      this.logger.info("\uD83D\uDD04 Reconnecting in 3s...");
      setTimeout(() => this.initialize(), 3000);
    }
  }
  async onConnect() {
    this.logger.info("✅ Connected!");
    this.isConnected = true;
    this.currentQRCode = null;
    if (this.socket?.user) {
      this.userInfo = {
        id: this.socket.user.id,
        name: this.socket.user.name || "Unknown"
      };
      this.logger.info(`\uD83D\uDC64 Logged in as: ${this.userInfo.name}`);
      this.connectionUpdateCallback?.({
        connected: true,
        user: this.userInfo
      });
      this.qrCodeCallback?.("");
    }
  }
  setupMessageEvents() {
    if (!this.socket)
      return;
    this.socket.ev.on("messages.upsert", async ({ messages, type }) => {
      if (type !== "notify")
        return;
      messageHandlers(this.socket, messages);
    });
  }
  formatJID(phone) {
    if (phone.includes("@s.whatsapp.net")) {
      return phone;
    }
    const cleaned = phone.replace(/[^\d+]/g, "").replace(/^\+/, "");
    return `${cleaned}@s.whatsapp.net`;
  }
  async closeSocket() {
    if (!this.socket)
      return;
    try {
      this.socket.end(undefined);
      this.logger.info("\uD83D\uDD0C Socket closed");
    } catch (error) {
      this.logger.error("Socket close error:", error);
    }
    this.socket = null;
  }
  resetState() {
    this.isConnected = false;
    this.currentQRCode = null;
    this.userInfo = undefined;
    this.socket = null;
  }
}
// src/services/WebSocketService.ts
import { Server as SocketIOServer } from "socket.io";
class WebSocketService {
  io;
  logger;
  constructor(httpServer) {
    this.logger = new Logger("WebSocketService");
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: "*",
        credentials: true
      },
      transports: ["websocket", "polling"]
    });
    this.setupEventHandlers();
  }
  setupEventHandlers() {
    this.io.on("connection", (socket) => {
      this.logger.info(`\uD83D\uDD0C Client connected: ${socket.id}`);
      socket.on("disconnect", () => {
        this.logger.info(`❌ Client disconnected: ${socket.id}`);
      });
      socket.on("ping", () => {
        socket.emit("pong");
      });
    });
  }
  emitQRCode(qrCode) {
    this.logger.info("\uD83D\uDCF1 Broadcasting QR code to all clients");
    this.io.emit("qr:generated", {
      qrCode,
      timestamp: new Date().toISOString()
    });
  }
  emitConnectionStatus(status) {
    this.logger.info(`\uD83D\uDD04 Broadcasting connection status: ${status.status}`);
    this.io.emit("connection:status", {
      ...status,
      timestamp: new Date().toISOString()
    });
  }
  emitWhatsAppConnected(user) {
    this.logger.info(`✅ Broadcasting WhatsApp connected: ${user.name}`);
    this.io.emit("whatsapp:connected", { user });
  }
  emitWhatsAppDisconnected() {
    this.logger.warn("\uD83D\uDCF4 Broadcasting WhatsApp disconnected");
    this.io.emit("whatsapp:disconnected", {});
  }
  emitMessageReceived(data) {
    this.logger.info(`\uD83D\uDCE8 Broadcasting incoming message from: ${data.from}`);
    this.io.emit("message:received", {
      ...data,
      timestamp: new Date().toISOString()
    });
  }
  emitMessageSent(data) {
    this.logger.info(`\uD83D\uDCE4 Broadcasting message sent status: ${data.success}`);
    this.io.emit("message:sent", {
      ...data,
      timestamp: new Date().toISOString()
    });
  }
  getIO() {
    return this.io;
  }
}

// src/routes/health.routes.ts
import { Hono } from "hono";
var healthRoutes = new Hono;
healthRoutes.get("/health", (c) => {
  return c.json({
    status: "ok",
    timestamp: new Date().toISOString()
  });
});
var health_routes_default = healthRoutes;

// src/routes/status.routes.ts
import { Hono as Hono2 } from "hono";
function createStatusRoutes(waService) {
  const statusRoutes = new Hono2;
  statusRoutes.get("/status", (c) => {
    const status = waService.getStatus();
    return c.json({
      status: {
        connected: status.connected,
        user: status.user,
        hasQRCode: !!status.qrCode
      },
      timestamp: new Date().toISOString()
    });
  });
  return statusRoutes;
}

// src/routes/qr.routes.ts
import { Hono as Hono3 } from "hono";
var logger7 = new Logger("QRRoutes");
function createQRRoutes(waService) {
  const qrRoutes = new Hono3;
  qrRoutes.get("/api/qr", (c) => {
    const qrCode = waService.getQRCode();
    if (!qrCode) {
      return c.json({
        success: false,
        message: "No QR code available. WhatsApp might be already connected."
      }, 404);
    }
    return c.json({
      success: true,
      qrCode,
      timestamp: new Date().toISOString()
    });
  });
  qrRoutes.post("/api/qr/generate", async (c) => {
    try {
      const status = waService.getStatus();
      if (status.connected) {
        return c.json({
          success: false,
          message: "WhatsApp is already connected. Please logout first."
        }, 400);
      }
      logger7.info("\uD83D\uDCF1 Generating new QR code...");
      await waService.restart();
      return c.json({
        success: true,
        message: "QR code generation initiated. Please wait for the QR code.",
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger7.error("Failed to generate QR code:", error);
      return c.json({
        success: false,
        message: error.message || "Failed to generate QR code"
      }, 500);
    }
  });
  return qrRoutes;
}

// src/routes/message.routes.ts
import { Hono as Hono4 } from "hono";
var logger8 = new Logger("MessageRoutes");
function createMessageRoutes(waService, wsService) {
  const messageRoutes = new Hono4;
  messageRoutes.post("/api/send", async (c) => {
    try {
      const body = await c.req.json();
      const { to, message } = body;
      if (!to || !message) {
        return c.json({
          success: false,
          message: "Missing required fields: to, message"
        }, 400);
      }
      await waService.sendMessage(to, message);
      await chatHistoryService.addAdminReply(to, message);
      try {
        const container = getContainer();
        const assistant = container.getAIAssistant();
        assistant.invalidateCache(to);
        logger8.debug(`AI cache invalidated for ${to} after admin reply`);
      } catch (error) {
        logger8.debug("AI not initialized, skip cache invalidation");
      }
      wsService.emitMessageSent({
        to,
        message,
        success: true
      });
      return c.json({
        success: true,
        message: "Message sent successfully",
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger8.error("Failed to send message:", error);
      wsService.emitMessageSent({
        to: "",
        message: "",
        success: false,
        error: error.message
      });
      return c.json({
        success: false,
        message: error.message || "Failed to send message"
      }, 500);
    }
  });
  messageRoutes.get("/api/chats/:phone", async (c) => {
    try {
      const phone = c.req.param("phone");
      const limit = parseInt(c.req.query("limit") || "50");
      const messages = await chatHistoryService.getChatHistory(phone, limit);
      return c.json({
        success: true,
        phone,
        messages,
        total: messages.length
      });
    } catch (error) {
      logger8.error("Failed to get chat history:", error);
      return c.json({
        success: false,
        message: error.message || "Failed to get chat history"
      }, 500);
    }
  });
  messageRoutes.get("/api/chats", async (c) => {
    try {
      const activeChats = await chatHistoryService.getActiveChats();
      return c.json({
        success: true,
        chats: activeChats,
        total: activeChats.length
      });
    } catch (error) {
      logger8.error("Failed to get active chats:", error);
      return c.json({
        success: false,
        message: error.message || "Failed to get active chats"
      }, 500);
    }
  });
  return messageRoutes;
}

// src/routes/auth.routes.ts
import { Hono as Hono5 } from "hono";
function createAuthRoutes(waService, wsService) {
  const authRoutes = new Hono5;
  authRoutes.post("/api/logout", async (c) => {
    try {
      await waService.logout();
      wsService.emitWhatsAppDisconnected();
      return c.json({
        success: true,
        message: "Logged out successfully"
      });
    } catch (error) {
      return c.json({
        success: false,
        message: error.message || "Failed to logout"
      }, 500);
    }
  });
  return authRoutes;
}

// src/routes/index.ts
function setupRoutes(app, waService, wsService) {
  app.route("/", health_routes_default);
  app.route("/", createStatusRoutes(waService));
  app.route("/", createQRRoutes(waService));
  app.route("/", createMessageRoutes(waService, wsService));
  app.route("/", createAuthRoutes(waService, wsService));
}

// src/app.ts
var logger9 = new Logger("Application");
var app = new Hono6;
app.use("*", cors({
  origin: "*",
  credentials: true
}));
app.use("*", honoLogger());
var waService;
var wsService;
async function startApp() {
  try {
    logger9.info("\uD83D\uDE80 Starting WhatsApp Gateway Service...");
    const port = Number(CONFIG.PORT) || 3000;
    const httpServer = createServer(async (req, res) => {
      const request = new Request(`http://${req.headers.host || "localhost"}${req.url}`, {
        method: req.method,
        headers: req.headers,
        body: req.method !== "GET" && req.method !== "HEAD" ? await new Promise((resolve) => {
          const chunks = [];
          req.on("data", (chunk) => chunks.push(chunk));
          req.on("end", () => resolve(Buffer.concat(chunks)));
        }) : undefined
      });
      const response = await app.fetch(request);
      res.writeHead(response.status, Object.fromEntries(response.headers));
      if (response.body) {
        const reader = response.body.getReader();
        while (true) {
          const { done, value } = await reader.read();
          if (done)
            break;
          res.write(value);
        }
      }
      res.end();
    });
    httpServer.listen(port);
    logger9.info(`\uD83C\uDF10 HTTP Server running on http://0.0.0.0:${port}`);
    wsService = new WebSocketService(httpServer);
    logger9.info(`\uD83D\uDD0C WebSocket Server running on port ${port}`);
    waService = new WhatsAppService;
    setupRoutes(app, waService, wsService);
    waService.onQRCode((qrCode) => {
      logger9.info("\uD83D\uDCF1 QR Code received from WhatsApp");
      wsService.emitQRCode(qrCode);
    });
    waService.onConnectionUpdate((status) => {
      if (status.connected && status.user) {
        logger9.info(`✅ WhatsApp connected: ${status.user.name}`);
        wsService.emitConnectionStatus({
          status: "connected",
          user: status.user
        });
        wsService.emitWhatsAppConnected(status.user);
        wsService.emitQRCode("");
      } else if (!status.connected) {
        logger9.info("\uD83D\uDCF4 WhatsApp disconnected");
        wsService.emitConnectionStatus({
          status: "disconnected"
        });
        if (!status.qrCode) {
          wsService.emitWhatsAppDisconnected();
        }
      }
    });
    await waService.initialize();
    logger9.info("✅ WhatsApp Gateway Service started successfully!");
    logger9.info(`\uD83D\uDCF1 Scan QR code to connect WhatsApp`);
    logger9.info(`\uD83C\uDF10 Frontend should connect to: http://0.0.0.0:${port}`);
  } catch (error) {
    logger9.error("❌ Failed to start application:", error);
    process.exit(1);
  }
}
startApp();
