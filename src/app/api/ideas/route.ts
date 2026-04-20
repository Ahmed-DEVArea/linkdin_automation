// ============================================
// API: Generate Content Ideas
// POST /api/ideas
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { generateIdeas } from '@/lib/content';
import { getMockIdeas } from '@/lib/mock-data';
import type { GenerateIdeasRequest } from '@/types';

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
    const body: GenerateIdeasRequest = await request.json();

    if (!body.topic || body.topic.trim().length === 0) {
      return NextResponse.json(
        { error: 'Topic is required' },
        { status: 400 }
      );
    }

    const provider = body.provider || 'kimi';
    const userKey = body.apiKey;
    const isDemo = body.demo === true || !hasApiKey(provider, userKey);

    if (isDemo) {
      await new Promise((r) => setTimeout(r, 1200));
      const ideas = getMockIdeas(body.topic.trim());
      return NextResponse.json({ ideas, demo: true });
    }

    try {
      const ideas = await generateIdeas(
        body.topic.trim(),
        body.count || 5,
        provider,
        userKey
      );
      return NextResponse.json({ ideas });
    } catch (llmError) {
      // If auth fails (401, expired key), fall back to demo mode
      const msg = llmError instanceof Error ? llmError.message : '';
      if (msg.includes('401') || msg.includes('Authentication') || msg.includes('Unauthorized') || msg.includes('API key')) {
        console.warn('LLM auth failed, falling back to demo:', msg);
        const ideas = getMockIdeas(body.topic.trim());
        return NextResponse.json({ ideas, demo: true, authError: msg });
      }
      throw llmError;
    }
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
