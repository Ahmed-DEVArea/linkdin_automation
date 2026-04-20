// ============================================
// API: Setup Notion Database
// POST /api/notion/setup — Create the LinkedIn Content database
// ============================================

import { NextResponse } from 'next/server';

const NOTION_API_BASE = 'https://api.notion.com/v1';
const NOTION_VERSION = '2022-06-28';

function getHeaders() {
  const apiKey = process.env.NOTION_API_KEY;
  if (!apiKey) throw new Error('NOTION_API_KEY is not set');
  return {
    'Authorization': `Bearer ${apiKey}`,
    'Notion-Version': NOTION_VERSION,
    'Content-Type': 'application/json',
  };
}

export async function POST() {
  try {
    const headers = getHeaders();

    // Check if database already exists
    const dbSearch = await fetch(`${NOTION_API_BASE}/search`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        query: 'LinkedIn Content',
        filter: { property: 'object', value: 'database' },
      }),
    });

    const dbSearchData = await dbSearch.json();

    if (dbSearchData.results?.length > 0) {
      const existingDb = dbSearchData.results[0];
      return NextResponse.json({
        success: true,
        databaseId: existingDb.id,
        message: 'Database already exists',
        existing: true,
      });
    }

    // Find a parent page
    const searchRes = await fetch(`${NOTION_API_BASE}/search`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        filter: { property: 'object', value: 'page' },
        page_size: 5,
      }),
    });

    const searchData = await searchRes.json();

    if (!searchData.results?.length) {
      return NextResponse.json(
        {
          error: 'No Notion pages found. Connect the integration to a page first.',
          instructions: [
            '1. Go to any Notion page',
            '2. Click ••• (three dots) → Connections',
            '3. Connect to "linkdin_automation"',
            '4. Try again',
          ],
        },
        { status: 400 }
      );
    }

    const parentPageId = searchData.results[0].id;

    // Create the database
    const createRes = await fetch(`${NOTION_API_BASE}/databases`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        parent: { type: 'page_id', page_id: parentPageId },
        icon: { type: 'emoji', emoji: '📝' },
        title: [{ type: 'text', text: { content: 'LinkedIn Content' } }],
        properties: {
          'Topic': { title: {} },
          'Date': { date: {} },
          'Status': {
            select: {
              options: [
                { name: 'Draft', color: 'yellow' },
                { name: 'Review', color: 'orange' },
                { name: 'Published', color: 'green' },
                { name: 'Archived', color: 'gray' },
              ],
            },
          },
          'Type': {
            select: {
              options: [
                { name: 'Post', color: 'blue' },
                { name: 'Carousel', color: 'purple' },
                { name: 'Post + Carousel', color: 'pink' },
              ],
            },
          },
          'AI Model': {
            select: {
              options: [
                { name: 'Claude', color: 'orange' },
                { name: 'GPT-4o', color: 'green' },
                { name: 'Gemini', color: 'blue' },
              ],
            },
          },
          'Word Count': { number: { format: 'number' } },
          'Has Carousel': { checkbox: {} },
          'Has Image': { checkbox: {} },
          'Image URL': { url: {} },
        },
      }),
    });

    if (!createRes.ok) {
      const err = await createRes.text();
      throw new Error(`Failed to create database: ${err}`);
    }

    const db = await createRes.json();

    return NextResponse.json({
      success: true,
      databaseId: db.id,
      message: 'Database created successfully',
      existing: false,
    });
  } catch (error) {
    console.error('Error setting up Notion:', error);
    return NextResponse.json(
      {
        error: 'Failed to setup Notion database',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
