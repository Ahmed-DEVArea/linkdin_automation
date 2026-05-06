// ============================================
// API: Save to Notion
// POST /api/notion
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { saveToNotion, verifyNotionConnection } from '@/lib/notion';
import type { SaveToNotionRequest } from '@/types';

function resolveNotionConfig(apiKey?: string, databaseId?: string) {
  return {
    apiKey: apiKey?.trim() || process.env.NOTION_API_KEY,
    databaseId: databaseId?.trim() || process.env.NOTION_DATABASE_ID,
  };
}

function getMissingConfig(config: { apiKey?: string; databaseId?: string }) {
  const missing: string[] = [];
  if (!config.apiKey) missing.push('Notion API key');
  if (!config.databaseId) missing.push('Notion database ID');
  return missing;
}

export async function POST(request: NextRequest) {
  try {
    const body: SaveToNotionRequest = await request.json();

    if (!body.post) {
      return NextResponse.json(
        { error: 'Post data is required' },
        { status: 400 }
      );
    }

    const config = resolveNotionConfig(
      body.notionApiKey,
      body.notionDatabaseId
    );
    const missing = getMissingConfig(config);

    if (missing.length > 0) {
      return NextResponse.json(
        {
          error: `Notion is not connected. Missing: ${missing.join(', ')}.`,
        },
        { status: 400 }
      );
    }

    const result = await saveToNotion(
      {
        ...body.post,
        status: 'saved',
      },
      config
    );

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

export async function GET(request: NextRequest) {
  try {
    const config = resolveNotionConfig(
      request.headers.get('x-notion-api-key') || undefined,
      request.headers.get('x-notion-database-id') || undefined
    );
    const missing = getMissingConfig(config);

    if (missing.length > 0) {
      return NextResponse.json(
        {
          connected: false,
          error: `Missing: ${missing.join(', ')}.`,
        },
        { status: 400 }
      );
    }

    const status = await verifyNotionConnection(config);
    return NextResponse.json(status, { status: status.connected ? 200 : 400 });
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
