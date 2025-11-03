import type { ConfirmChannel } from "amqplib";

export function publishJSON<T>(ch: ConfirmChannel, exchange: string, routingKey: string, value: T): Promise<void> {
    const json = JSON.stringify(value);
    const jsonBytes = new Buffer(json)
}