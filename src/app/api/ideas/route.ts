// ============================================
// API: Generate Content Ideas
// POST /api/ideas
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { generateIdeas } from '@/lib/content';
import type { GenerateIdeasRequest } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body: GenerateIdeasRequest = await request.json();

    if (!body.topic || body.topic.trim().length === 0) {
      return NextResponse.json(
        { error: 'Topic is required' },
        { status: 400 }
      );
    }

    const ideas = await generateIdeas(
      body.topic.trim(),
      body.count || 5,
      body.provider || 'claude'
    );

    return NextResponse.json({ ideas });
  } catch (error) {
    console.error('Error generating ideas:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate ideas',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
