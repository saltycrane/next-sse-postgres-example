import { Pool } from "pg";

// Create connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

// Helper function to execute queries
export async function query(text: string, params?: any[]) {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
}

// Create a notification listener that returns a ReadableStream
export function createMessageStream() {
  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      // Initial fetch of messages
      try {
        const client = await pool.connect();

        // Send initial messages
        const { rows: initialMessages } = await client.query(
          "SELECT * FROM messages ORDER BY created_at DESC LIMIT 10",
        );
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: "initial", messages: initialMessages })}\n\n`,
          ),
        );

        // Setup PostgreSQL notification listener
        await client.query("LISTEN message_changes");

        // Event handler for notifications
        client.on("notification", (notification) => {
          try {
            const newMessage = JSON.parse(notification.payload);
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: "update", message: newMessage })}\n\n`,
              ),
            );
          } catch (error) {
            console.error("Error handling notification:", error);
          }
        });

        // Keep connection alive with heartbeat
        const heartbeat = setInterval(() => {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "heartbeat", time: new Date().toISOString() })}\n\n`,
            ),
          );
        }, 30000);

        // Clean up on stream close
        return () => {
          clearInterval(heartbeat);
          client.query("UNLISTEN message_changes").catch(console.error);
          client.release();
        };
      } catch (error) {
        console.error("Stream setup error:", error);
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: "error", error: "Connection failed" })}\n\n`,
          ),
        );
        controller.close();
      }
    },
  });
}

export default pool;
