import type { ConfirmChannel } from "amqplib";
import amqp from "amqplib"

export function publishJSON<T>(
    ch: ConfirmChannel,
    exchange: string, 
    routingKey: string,
    value: T
): Promise<void> {
    const jsonString = JSON.stringify(value);
    const jsonBytes = Buffer.from(jsonString)
    return new Promise((resolve, reject) => {
        ch.publish(
            exchange,
            routingKey,
            jsonBytes,
            {contentType:"application/json"},
            (err) => {
                if (err != null) {
                    reject(new Error("Message was NACKed by the broker"));
                } else {
                    resolve()
                }
            }
        );
    });
}