import MessageForm from "./components/MessageForm";
import MessageList from "./components/MessageList";

export default function Home() {
  return (
    <main>
      <h1 className="text-3xl font-bold mb-8 text-center">
        Real-time Message Board with SSE
      </h1>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Post a Message</h2>
        <MessageForm />
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Messages (Real-time)</h2>
        <MessageList />
      </div>
    </main>
  );
}
