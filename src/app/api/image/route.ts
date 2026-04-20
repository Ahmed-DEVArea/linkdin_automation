// ============================================
// API: Generate Image via Higgsfield
// POST /api/image
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { generateImage, isHiggsFieldConfigured } from '@/lib/higgsfield';
import { generateSceneDescription } from '@/lib/content';

export async function POST(request: NextRequest) {
  try {
    if (!isHiggsFieldConfigured()) {
      return NextResponse.json(
        { error: 'Higgsfield API is not configured. Add HIGGSFIELD_API_KEY_ID and HIGGSFIELD_API_KEY_SECRET to your environment or Settings.' },
        { status: 400 }
      );
    }

    const body = await request.json();

    if (!body.postContent) {
      return NextResponse.json(
        { error: 'Post content is required' },
        { status: 400 }
      );
    }

    // Generate scene description from post content if not provided
    let sceneDescription = body.sceneDescription;
    if (!sceneDescription) {
      sceneDescription = await generateSceneDescription(
        body.postContent,
        body.provider || 'kimi',
        body.apiKey
      );
    }

    const result = await generateImage({
      prompt: sceneDescription,
      style: body.style || 'realistic',
      characterId: body.characterId,
    });

    return NextResponse.json({
      imageUrl: result.imageUrl,
      prompt: result.prompt,
      sceneDescription,
    });
  } catch (error) {
    console.error('Error generating image:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate image',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
