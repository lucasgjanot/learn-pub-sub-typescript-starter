import amqp from "amqplib"
import { publishJSON } from "../internal/pubsub/publish.js";
import { ExchangePerilDirect, ExchangePerilTopic, GameLogSlug, PauseKey } from "../internal/routing/routing.js";
import { getInput, printServerHelp } from "../internal/gamelogic/gamelogic.js";
import { declareAndBind, SimpleQueueType } from "../internal/pubsub/consume.js";

async function main() {
  console.log("Starting Peril server...");
  const rabbitString = "amqp://guest:guest@localhost:5672/";
  const conn = await amqp.connect(rabbitString);
  console.log("Peril game server connected to RabbitMQ!");

  const ch = await conn.createConfirmChannel();
  

  ["SIGINT", "SIGTERM"].forEach((signal) =>
    process.on(signal, async () => {
      try {
        await conn.close();
        console.log("RabbitMQ connection closed.");
      } catch (err) {
        console.error("Error closing RabbitMQ connection:", err);
      } finally {
        process.exit(0);
      }
    }),
  );

  const [channel, queue] = await declareAndBind(conn,ExchangePerilTopic, 'game_logs', `${GameLogSlug}.*`, SimpleQueueType.Durable)

  printServerHelp();
  while (true) {
    const input = await getInput();
    if (input.length === 0) {
      continue;
    }
    if (input[0] === "pause") {
      console.log("Sending pause message")
      await publishJSON(ch, ExchangePerilDirect, PauseKey, {isPaused: true});
      continue;
    }
    if (input[0] === "resume") {
      console.log("Sending resume message");
      await publishJSON(ch, ExchangePerilDirect, PauseKey, {isPaused: false});
      continue;
    }
    if (input[0] === "quit") {
      console.log("Exiting server...")
      break;
    }
    console.log("Don't know this command")



    }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
