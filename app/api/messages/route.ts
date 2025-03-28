import { query } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { content } = await request.json();
    
    if (!content || typeof content !== 'string' || content.trim() === '') {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }
    
    const result = await query('INSERT INTO messages (content) VALUES ($1) RETURNING *', [content]);
    return NextResponse.json({ message: result.rows[0] });
  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json({ error: 'Failed to create message' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { rows } = await query('SELECT * FROM messages ORDER BY created_at DESC LIMIT 50');
    return NextResponse.json({ messages: rows });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}
