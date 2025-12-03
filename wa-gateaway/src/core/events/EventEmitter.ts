import { createLogger } from "../logger/Logger";

const logger = createLogger("EventEmitter");

export type EventCallback = (...args: any[]) => void | Promise<void>;

export class EventEmitter {
    private events: Map<string, EventCallback[]> = new Map();
    private context: string;

    constructor(context: string = "EventEmitter") {
        this.context = context;
    }

    on(event: string, callback: EventCallback): void {
        if (!this.events.has(event)) {
            this.events.set(event, []);
        }
        this.events.get(event)!.push(callback);
        logger.debug(`Event listener registered: ${event}`, {
            context: this.context,
            listenersCount: this.events.get(event)!.length,
        });
    }

    once(event: string, callback: EventCallback): void {
        const wrappedCallback: EventCallback = async (...args) => {
            await callback(...args);
            this.off(event, wrappedCallback);
        };
        this.on(event, wrappedCallback);
    }

    off(event: string, callback: EventCallback): void {
        const callbacks = this.events.get(event);
        if (!callbacks) return;

        const index = callbacks.indexOf(callback);
        if (index !== -1) {
            callbacks.splice(index, 1);
            logger.debug(`Event listener removed: ${event}`, {
                context: this.context,
                remainingListeners: callbacks.length,
            });
        }

        if (callbacks.length === 0) {
            this.events.delete(event);
        }
    }

    async emit(event: string, ...args: any[]): Promise<void> {
        const callbacks = this.events.get(event);
        if (!callbacks || callbacks.length === 0) {
            logger.debug(`No listeners for event: ${event}`, {
                context: this.context,
            });
            return;
        }

        logger.debug(`Emitting event: ${event}`, {
            context: this.context,
            listenersCount: callbacks.length,
            hasArgs: args.length > 0,
        });

        const promises = callbacks.map(async (callback) => {
            try {
                await callback(...args);
            } catch (error) {
                logger.error(`Error in event listener for ${event}`, error, {
                    context: this.context,
                });
            }
        });

        await Promise.all(promises);
    }

    removeAllListeners(event?: string): void {
        if (event) {
            this.events.delete(event);
            logger.debug(`All listeners removed for event: ${event}`, {
                context: this.context,
            });
        } else {
            this.events.clear();
            logger.debug("All listeners removed", {
                context: this.context,
            });
        }
    }

    listenerCount(event: string): number {
        return this.events.get(event)?.length || 0;
    }

    eventNames(): string[] {
        return Array.from(this.events.keys());
    }
}
