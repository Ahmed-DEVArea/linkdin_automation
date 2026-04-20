// ============================================
// API: Generate Carousel
// POST /api/carousel
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { generateCarousel } from '@/lib/carousel';
import { getMockCarousel } from '@/lib/mock-data';
import type { GenerateCarouselRequest } from '@/types';

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
    const body: GenerateCarouselRequest = await request.json();

    if (!body.post?.content) {
      return NextResponse.json(
        { error: 'Post content is required' },
        { status: 400 }
      );
    }

    const provider = body.provider || 'kimi';
    const userKey = body.apiKey;
    const isDemo = body.demo === true || !hasApiKey(provider, userKey);

    if (isDemo) {
      await new Promise((r) => setTimeout(r, 1800));
      const carousel = getMockCarousel(body.post.topic, body.post.content);
      return NextResponse.json({ carousel, demo: true });
    }

    const carousel = await generateCarousel(
      body.post.topic,
      body.post.content,
      body.slideCount || 8,
      provider,
      userKey
    );

    return NextResponse.json({ carousel });
  } catch (error) {
    console.error('Error generating carousel:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate carousel',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
