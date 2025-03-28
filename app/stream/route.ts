import { createMessageStream } from "@/lib/db";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const stream = createMessageStream();

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
