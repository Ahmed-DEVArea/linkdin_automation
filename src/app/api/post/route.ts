// ============================================
// API: Generate LinkedIn Post
// POST /api/post
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { generatePost, refinePost } from '@/lib/content';
import { getMockPost } from '@/lib/mock-data';
import type { GeneratePostRequest } from '@/types';

function hasApiKey(provider: string, userKey?: string): boolean {
  if (userKey) return true;
  switch (provider) {
    case 'claude': return !!process.env.ANTHROPIC_API_KEY;
    case 'openai': return !!process.env.OPENAI_API_KEY;
    case 'gemini': return !!process.env.GEMINI_API_KEY;
    case 'kimi':   return !!process.env.KIMI_API_KEY;
    default: return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: GeneratePostRequest = await request.json();

    if (!body.idea) {
      return NextResponse.json(
        { error: 'Idea is required' },
        { status: 400 }
      );
    }

    const provider = body.provider || 'kimi';
    const userKey = body.apiKey;
    const isDemo = body.demo === true || !hasApiKey(provider, userKey);

    if (isDemo) {
      await new Promise((r) => setTimeout(r, 1500));
      const post = getMockPost(body.idea);
      return NextResponse.json({ post, demo: true });
    }

    try {
      const post = await generatePost(
        body.idea,
        provider,
        body.customInstructions,
        userKey
      );
      return NextResponse.json({ post });
    } catch (llmError) {
      const msg = llmError instanceof Error ? llmError.message : '';
      if (msg.includes('401') || msg.includes('Authentication') || msg.includes('Unauthorized') || msg.includes('API key')) {
        console.warn('LLM auth failed, falling back to demo:', msg);
        const post = getMockPost(body.idea);
        return NextResponse.json({ post, demo: true, authError: msg });
      }
      throw llmError;
    }
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

    const provider = body.provider || 'kimi';
    const userKey = body.apiKey;
    const isDemo = body.demo === true || !hasApiKey(provider, userKey);

    if (isDemo) {
      await new Promise((r) => setTimeout(r, 1000));
      const lines = body.content.split('\n');
      const shuffled = [lines[0], '', 'Here\'s what most people miss:', '', ...lines.slice(1)];
      return NextResponse.json({ content: shuffled.join('\n'), demo: true });
    }

    try {
      const refined = await refinePost(
        body.content,
        body.instructions || '',
        provider,
        userKey
      );
      return NextResponse.json({ content: refined });
    } catch (llmError) {
      const msg = llmError instanceof Error ? llmError.message : '';
      if (msg.includes('401') || msg.includes('Authentication') || msg.includes('Unauthorized') || msg.includes('API key')) {
        console.warn('LLM auth failed for refine, falling back to demo:', msg);
        const lines = body.content.split('\n');
        const shuffled = [lines[0], '', ...lines.slice(1)];
        return NextResponse.json({ content: shuffled.join('\n'), demo: true, authError: msg });
      }
      throw llmError;
    }
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
