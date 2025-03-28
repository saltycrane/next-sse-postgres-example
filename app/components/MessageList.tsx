"use client";

import { useEffect, useState } from "react";
import { Message } from "../actions";

export default function MessageList({
  initialMessages,
}: {
  initialMessages: Message[];
}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [status, setStatus] = useState("Connected");

  useEffect(() => {
    // Set up SSE connection
    const eventSource = new EventSource("/stream");

    eventSource.onopen = () => {
      setStatus("Connected");
    };

    eventSource.onerror = () => {
      setStatus("Connection error. Reconnecting...");
      // Browser will automatically try to reconnect
    };

    eventSource.addEventListener("message", (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "initial") {
          setMessages(data.messages);
        } else if (data.type === "update") {
          setMessages((prevMessages) => [data.message, ...prevMessages]);
        } else if (data.type === "heartbeat") {
          console.log("Heartbeat received:", data.time);
        }
      } catch (error) {
        console.error("Error parsing SSE data:", error);
      }
    });

    return () => {
      eventSource.close();
    };
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(date);
  };

  return (
    <div>
      <div className="mb-4 text-sm text-gray-500">Status: {status}</div>

      <div className="space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-10">
            No messages yet. Be the first to send one!
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className="border p-4 rounded-lg bg-white shadow"
            >
              <div className="text-gray-700 mb-2">{message.content}</div>
              <div className="text-xs text-gray-500">
                {formatDate(message.created_at)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
