import MessageForm from "./components/MessageForm";
import MessageList from "./components/MessageList";
import { getMessages } from "./actions";
import { Suspense } from "react";

export const revalidate = 0;

export default async function Home() {
  const initialMessages = await getMessages();

  return (
    <main>
      <h1 className="text-3xl font-bold mb-8 text-center">
        Real-time Message Board with Server Components
      </h1>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Post a Message</h2>
        <MessageForm />
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Messages (Real-time)</h2>
        <Suspense fallback={<div>Loading messages...</div>}>
          <MessageList initialMessages={initialMessages} />
        </Suspense>
      </div>
    </main>
  );
}
