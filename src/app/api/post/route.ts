// ============================================
// API: Generate LinkedIn Post
// POST /api/post
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { generatePost, refinePost } from '@/lib/content';
import type { GeneratePostRequest } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body: GeneratePostRequest = await request.json();

    if (!body.idea) {
      return NextResponse.json(
        { error: 'Idea is required' },
        { status: 400 }
      );
    }

    const post = await generatePost(
      body.idea,
      body.provider || 'claude',
      body.customInstructions
    );

    return NextResponse.json({ post });
  } catch (error) {
    console.error('Error generating post:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate post',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// PATCH /api/post — Refine existing post
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    const refined = await refinePost(
      body.content,
      body.instructions || '',
      body.provider || 'claude'
    );

    return NextResponse.json({ content: refined });
  } catch (error) {
    console.error('Error refining post:', error);
    return NextResponse.json(
      {
        error: 'Failed to refine post',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
