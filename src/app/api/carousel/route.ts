// ============================================
// API: Generate Carousel
// POST /api/carousel
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { generateCarousel } from '@/lib/carousel';
import type { GenerateCarouselRequest } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body: GenerateCarouselRequest = await request.json();

    if (!body.post?.content) {
      return NextResponse.json(
        { error: 'Post content is required' },
        { status: 400 }
      );
    }

    const carousel = await generateCarousel(
      body.post.topic,
      body.post.content,
      body.slideCount || 8,
      body.provider || 'claude'
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
