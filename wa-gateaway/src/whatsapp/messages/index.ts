import type { WASocket } from "atexovi-baileys";
import { proto } from "atexovi-baileys";
import { Logger } from "../../core/logger/Logger";
import { AIAssistant } from "../../ai";
import { CONFIG } from "../../config/config";
import { chatHistoryService } from "../../services/ChatHistoryService";
import { sendInteractiveButtons } from "../helpers";

const logger = new Logger("MessageHandler");

// Initialize AI Assistant
let aiAssistant: AIAssistant | null = null;

export function getAIAssistant(): AIAssistant {
    if (!aiAssistant) {
        const apiKey = CONFIG.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error("GEMINI_API_KEY not configured");
        }
        aiAssistant = new AIAssistant(apiKey, {
            model: "gemini-2.0-flash",
            temperature: 0.7,
        });
        logger.info("✅ AI Assistant initialized");
    }
    return aiAssistant;
}

/**
 * Handle incoming WhatsApp messages
 */
export async function messageHandlers(
    sock: WASocket,
    messages: proto.IWebMessageInfo[]
): Promise<void> {
    for (const message of messages) {
        try {
            // Skip messages from self
            if (message.key.fromMe) continue;

            // Extract message info
            const from = message.key.remoteJid;
            const messageType = Object.keys(message.message || {})[0];

            // Debug: log full message structure untuk button response
            if (message.message) {
                logger.info(`📩 Message from ${from} (type: ${messageType})`);
                logger.debug(
                    `Message keys: ${Object.keys(message.message).join(", ")}`
                );
            }

            if (!from) continue;

            // Handle different message types
            if (
                messageType === "conversation" ||
                messageType === "extendedTextMessage"
            ) {
                const text =
                    message.message?.conversation ||
                    message.message?.extendedTextMessage?.text;

                if (!text) continue;

                logger.info(`📨 Text from ${from}: ${text}`);

                if (text === "list") {
                    // Example: testing interactive buttons
                    await sendInteractiveButtons(
                        sock,
                        from,
                        "Choose an option from the list:",
                        [
                            { displayText: "Ya, Benar ✅", id: "confirm" },
                            { displayText: "Tidak ❌", id: "cancel" },
                        ],
                        {
                            title: "List Menu",
                            subtitle: "Select one",
                            footer: "Sent by Raja Ikan",
                        }
                    );
                } else {
                    try {
                        // Get AI Assistant
                        const assistant = getAIAssistant();

                        // Process message with AI (dengan function calling)
                        logger.info(`🤖 Processing with AI...`);
                        const aiResponse = await assistant.chat(from, text);

                        // Check if order extraction happened
                        let hasOrderExtraction = false;
                        let orderItems: any[] = [];

                        if (
                            aiResponse.functionCalls &&
                            aiResponse.functionCalls.length > 0
                        ) {
                            const functionNames = aiResponse.functionCalls
                                .map((fc) => fc.function)
                                .join(", ");
                            logger.info(
                                `📞 Function calls executed: ${functionNames}`
                            );

                            // Check for extract_order_items
                            const orderExtraction =
                                aiResponse.functionCalls.find(
                                    (fc) =>
                                        fc.function === "extract_order_items"
                                );

                            if (orderExtraction) {
                                logger.debug(
                                    `Order extraction result:`,
                                    JSON.stringify(
                                        orderExtraction.result,
                                        null,
                                        2
                                    )
                                );

                                // Check multiple possible result structures
                                const resultData =
                                    orderExtraction.result?.data ||
                                    orderExtraction.result;
                                const items = resultData?.order_items;

                                if (
                                    items &&
                                    Array.isArray(items) &&
                                    items.length > 0
                                ) {
                                    hasOrderExtraction = true;
                                    orderItems = items;
                                    logger.info(
                                        `✅ Extracted ${items.length} order items`
                                    );
                                }
                            }
                        }

                        // Send AI response
                        if (aiResponse.response) {
                            await sock.sendMessage(from, {
                                text: aiResponse.response,
                            });
                            logger.info(`✅ AI response sent to ${from}`);
                        }

                        // If order was extracted, send confirmation buttons
                        logger.debug(
                            `hasOrderExtraction: ${hasOrderExtraction}, orderItems.length: ${orderItems.length}`
                        );

                        if (hasOrderExtraction && orderItems.length > 0) {
                            const orderSummary = `\n📋 *Pesanan Anda:*\n${orderItems
                                .map(
                                    (item, idx) =>
                                        `${idx + 1}. ${item.name}: ${
                                            item.qty
                                        } kg`
                                )
                                .join(
                                    "\n"
                                )}\n\nApakah pesanan ini sudah benar?`;

                            await sendInteractiveButtons(
                                sock,
                                from,
                                orderSummary,
                                [
                                    {
                                        displayText: "Ya, Benar ✅",
                                        id: "confirm_order",
                                    },
                                    {
                                        displayText: "Tidak, Batalkan ❌",
                                        id: "cancel_order",
                                    },
                                ],
                                {
                                    title: "Konfirmasi Pesanan",
                                    footer: "Raja Ikan - Ikan Segar Terpercaya",
                                }
                            );
                            logger.info(
                                `📤 Confirmation buttons sent to ${from}`
                            );
                        }
                    } catch (error) {
                        logger.error("AI processing error:", error);
                        // Send error message to user
                        await sock.sendMessage(from, {
                            text: "Maaf, terjadi kesalahan. Silakan coba lagi.",
                        });
                    }
                }
            } else if (messageType === "messageContextInfo") {
                console.log("messageContextInfo", message.message);
                const buttonResponse = message.message?.buttonsResponseMessage;
                const selectedButtonId = buttonResponse?.selectedButtonId;

                logger.info(
                    `🔘 Button response from ${from}: ${selectedButtonId}`
                );

                if (selectedButtonId === "confirm_order") {
                    // User confirmed order
                    await sock.sendMessage(from, {
                        text: "✅ Pesanan Anda telah dikonfirmasi! Kami akan segera memproses pesanan ini.",
                    });
                    logger.info(`✅ Order confirmed by ${from}`);
                } else if (selectedButtonId === "cancel_order") {
                    // User cancelled order
                    await sock.sendMessage(from, {
                        text: "❌ Pesanan dibatalkan. Silakan pesan kembali jika ada perubahan.",
                    });
                    logger.info(`❌ Order cancelled by ${from}`);
                }
            } else if (messageType === "templateButtonReplyMessage") {
                // Alternative button response format
                const buttonReply = message.message?.templateButtonReplyMessage;
                const selectedId = buttonReply?.selectedId;

                logger.info(
                    `🔘 Template button reply from ${from}: ${selectedId}`
                );

                if (selectedId === "confirm_order") {
                    await sock.sendMessage(from, {
                        text: "✅ Pesanan Anda telah dikonfirmasi! Kami akan segera memproses pesanan ini.",
                    });
                    logger.info(`✅ Order confirmed by ${from}`);
                } else if (selectedId === "cancel_order") {
                    await sock.sendMessage(from, {
                        text: "❌ Pesanan dibatalkan. Silakan pesan kembali jika ada perubahan.",
                    });
                    logger.info(`❌ Order cancelled by ${from}`);
                }
            } else if (messageType === "interactiveResponseMessage") {
                // Native flow button response
                const interactiveResponse =
                    message.message?.interactiveResponseMessage;
                const nativeFlowResponseMessage =
                    interactiveResponse?.nativeFlowResponseMessage;

                logger.info(`🔘 Interactive response from ${from}`);
                logger.debug(
                    `Interactive response data:`,
                    JSON.stringify(interactiveResponse, null, 2)
                );

                // Try to parse the response
                if (nativeFlowResponseMessage?.paramsJson) {
                    try {
                        const params = JSON.parse(
                            nativeFlowResponseMessage.paramsJson
                        );
                        const selectedId = params.id;

                        logger.info(`🔘 Button ID: ${selectedId}`);

                        if (selectedId === "confirm_order") {
                            await sock.sendMessage(from, {
                                text: "✅ Pesanan Anda telah dikonfirmasi! Kami akan segera memproses pesanan ini.",
                            });
                            logger.info(`✅ Order confirmed by ${from}`);
                        } else if (selectedId === "cancel_order") {
                            await sock.sendMessage(from, {
                                text: "❌ Pesanan dibatalkan. Silakan pesan kembali jika ada perubahan.",
                            });
                            logger.info(`❌ Order cancelled by ${from}`);
                        }
                    } catch (error) {
                        logger.error(
                            "Failed to parse interactive response:",
                            error
                        );
                    }
                }
            } else if (messageType === "imageMessage") {
                logger.info(`🖼️ Image from ${from}`);
                // Save metadata to chat history
                await chatHistoryService.addMessage(
                    from,
                    "user",
                    "[IMAGE]",
                    "image"
                );
            } else if (messageType === "videoMessage") {
                logger.info(`🎥 Video from ${from}`);
                await chatHistoryService.addMessage(
                    from,
                    "user",
                    "[VIDEO]",
                    "video"
                );
            } else if (messageType === "audioMessage") {
                logger.info(`🎵 Audio from ${from}`);
                await chatHistoryService.addMessage(
                    from,
                    "user",
                    "[VOICE]",
                    "voice"
                );
            } else if (messageType === "documentMessage") {
                logger.info(`📄 Document from ${from}`);
                await chatHistoryService.addMessage(
                    from,
                    "user",
                    "[DOCUMENT]",
                    "document"
                );
            } else {
                logger.info(`📨 ${messageType} from ${from}`);
            }
        } catch (error) {
            logger.error("Error handling message:", error);
        }
    }
}
