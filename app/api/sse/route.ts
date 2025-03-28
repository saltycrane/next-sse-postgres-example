import { createNotificationClient, query } from "@/lib/db";

export async function GET(request: Request) {
  // Set headers for SSE
  const encoder = new TextEncoder();
  const customReadable = new ReadableStream({
    async start(controller) {
      // Send initial messages
      const { rows: initialMessages } = await query(
        "SELECT * FROM messages ORDER BY created_at DESC LIMIT 10",
      );
      controller.enqueue(
        encoder.encode(
          `data: ${JSON.stringify({ type: "initial", messages: initialMessages })}\n\n`,
        ),
      );

      try {
        // Setup PostgreSQL notification listener
        const { pool, client } = await createNotificationClient();

        await client.query("LISTEN message_changes");

        // Event handler for notifications
        client.on("notification", async (notification) => {
          const newMessage = JSON.parse(notification.payload);
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "update", message: newMessage })}\n\n`,
            ),
          );
        });

        // Keep connection alive with heartbeat
        const heartbeat = setInterval(() => {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "heartbeat", time: new Date().toISOString() })}\n\n`,
            ),
          );
        }, 30000);

        // Clean up on connection close
        request.signal.addEventListener("abort", () => {
          clearInterval(heartbeat);
          client.release(); // Release client back to the pool
          pool.end(); // End the pool connection
        });
      } catch (error) {
        console.error("SSE error:", error);
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: "error", error: "Connection failed" })}\n\n`,
          ),
        );
        controller.close();
      }
    },
  });

  return new Response(customReadable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
