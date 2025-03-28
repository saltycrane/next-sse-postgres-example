import { createMessageStream } from "@/lib/db";

export async function GET() {
  const stream = createMessageStream();

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
