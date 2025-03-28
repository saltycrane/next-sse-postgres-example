"use server";

import { query } from "@/lib/db";
import { revalidatePath } from "next/cache";

export type Message = {
  id: number;
  content: string;
  created_at: string;
};

export async function createMessage(formData: FormData) {
  const content = formData.get("content") as string;

  if (!content || content.trim() === "") {
    throw new Error("Content is required");
  }

  try {
    const result = await query(
      "INSERT INTO messages (content) VALUES ($1) RETURNING *",
      [content],
    );

    // Revalidate the messages path to update the UI
    revalidatePath("/");
    return { message: result.rows[0] };
  } catch (error) {
    console.error("Error creating message:", error);
    throw new Error("Failed to create message");
  }
}

export async function getMessages() {
  try {
    const { rows } = await query(
      "SELECT * FROM messages ORDER BY created_at DESC LIMIT 50",
    );
    return rows as Message[];
  } catch (error) {
    console.error("Error fetching messages:", error);
    throw new Error("Failed to fetch messages");
  }
}
