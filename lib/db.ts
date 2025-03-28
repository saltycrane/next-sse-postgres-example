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
  let isControllerActive = true;
  let heartbeatInterval: NodeJS.Timeout;
  let client: any = null;

  return new ReadableStream({
    async start(controller) {
      // Initial fetch of messages
      try {
        client = await pool.connect();

        // Send initial messages
        const { rows: initialMessages } = await client.query(
          "SELECT * FROM messages ORDER BY created_at DESC LIMIT 10",
        );

        if (isControllerActive) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "initial", messages: initialMessages })}\n\n`,
            ),
          );
        }

        // Setup PostgreSQL notification listener
        await client.query("LISTEN message_changes");

        // Event handler for notifications
        client.on("notification", (notification) => {
          try {
            if (!isControllerActive) return;

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
        heartbeatInterval = setInterval(() => {
          if (!isControllerActive) {
            clearInterval(heartbeatInterval);
            return;
          }

          try {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: "heartbeat", time: new Date().toISOString() })}\n\n`,
              ),
            );
          } catch (error) {
            console.error("Heartbeat error:", error);
            isControllerActive = false;
            clearInterval(heartbeatInterval);
          }
        }, 30000);
      } catch (error) {
        console.error("Stream setup error:", error);

        if (isControllerActive) {
          try {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: "error", error: "Connection failed" })}\n\n`,
              ),
            );
          } catch (enqueueError) {
            console.error("Failed to send error message:", enqueueError);
          }

          isControllerActive = false;

          if (heartbeatInterval) {
            clearInterval(heartbeatInterval);
          }

          if (client) {
            client.query("UNLISTEN message_changes").catch(console.error);
            client.release();
          }

          controller.close();
        }
      }
    },

    cancel() {
      isControllerActive = false;

      if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
      }

      if (client) {
        client.query("UNLISTEN message_changes").catch(console.error);
        client.release();
      }
    },
  });
}

export default pool;
