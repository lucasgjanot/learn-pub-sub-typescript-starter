import amqp from "amqplib"

async function main() {
  console.log("Starting Peril server...");
  const rabbitString = "amqp://guest:guest@localhost:5672/";
  const conn = await amqp.connect(rabbitString);
  console.log("Peril game server connected to RabbitMQ!");

  const ch = await conn.createChannel();

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
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
