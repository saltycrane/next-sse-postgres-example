"use client";

import { useRef, useState, useTransition } from "react";
import { createMessage } from "../actions";

export default function MessageForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      try {
        await createMessage(formData);
        formRef.current?.reset();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to send message");
      }
    });
  };

  return (
    <form ref={formRef} action={handleSubmit} className="mb-6">
      <div className="flex flex-col space-y-2">
        <textarea
          name="content"
          className="border rounded p-2 w-full"
          placeholder="Type your message here..."
          rows={3}
          disabled={isPending}
        />
        <button
          type="submit"
          disabled={isPending}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded disabled:bg-blue-300"
        >
          {isPending ? "Sending..." : "Send Message"}
        </button>
        {error && <div className="text-red-500 text-sm">{error}</div>}
      </div>
    </form>
  );
}
