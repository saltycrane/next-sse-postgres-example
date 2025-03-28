# Next.js Server-Sent Events with PostgreSQL Example

This is a demonstration of using Server-Sent Events (SSE) with Next.js App Router and PostgreSQL to build a real-time message board application.

Build with "Edit with Copilot" Claude 3.7 Sonnect Thinking. (See commits for chat input.)

## Features

- Real-time updates using Server-Sent Events
- PostgreSQL LISTEN/NOTIFY for database change notifications
- Next.js App Router, React Server Components, Server Actions, Streaming

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your PostgreSQL database:
   ```bash
   createdb your_database_name
   psql -d your_database_name -f database.sql
   ```
4. Create a `.env.local` file based on `.env.local.example` and add your PostgreSQL connection URL.
5. Run the development server:
   ```bash
   npm run dev
   ```
6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## How It Works

1. The application establishes a Server-Sent Events connection to the server via `/api/sse`.
2. PostgreSQL triggers send notifications when data changes in the messages table.
3. The SSE endpoint listens for these PostgreSQL notifications and forwards them to connected clients.
4. The React client component receives these updates and renders them in real-time.

## System Requirements

- Node.js 18 or later
- PostgreSQL 12 or later
