// ============================================
// API: Save to Notion
// POST /api/notion
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { saveToNotion, verifyNotionConnection } from '@/lib/notion';
import type { SaveToNotionRequest } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body: SaveToNotionRequest = await request.json();

    if (!body.post) {
      return NextResponse.json(
        { error: 'Post data is required' },
        { status: 400 }
      );
    }

    const result = await saveToNotion({
      ...body.post,
      status: 'saved',
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error saving to Notion:', error);
    return NextResponse.json(
      {
        error: 'Failed to save to Notion',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// GET /api/notion — Check Notion connection
export async function GET() {
  try {
    const status = await verifyNotionConnection();
    return NextResponse.json(status);
  } catch (error) {
    return NextResponse.json(
      {
        connected: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
