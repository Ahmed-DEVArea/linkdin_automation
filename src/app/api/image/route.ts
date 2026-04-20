// ============================================
// API: Generate Image via Higgsfield
// POST /api/image
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { generateImage, isHiggsFieldConfigured } from '@/lib/higgsfield';
import { generateSceneDescription } from '@/lib/content';

/**
 * Check if any LLM provider has a key available (env or user-provided)
 */
function hasAnyLLMKey(userApiKey?: string): boolean {
  return !!(
    userApiKey ||
    process.env.KIMI_API_KEY ||
    process.env.ANTHROPIC_API_KEY ||
    process.env.OPENAI_API_KEY ||
    process.env.GEMINI_API_KEY
  );
}

/**
 * Generate a simple fallback scene description without needing an LLM
 */
function getFallbackSceneDescription(postContent: string): string {
  // Extract first meaningful line as topic hint
  const firstLine = postContent.split('\n').find(l => l.trim().length > 10) || '';
  return `A professional young person in a modern, minimalist office setting, looking thoughtful while working on a laptop. Natural lighting from a window. The scene conveys authenticity and focused work. Topic context: ${firstLine.substring(0, 80)}`;
}

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

    // Generate scene description — try LLM first, fall back to simple prompt
    let sceneDescription = body.sceneDescription;
    if (!sceneDescription) {
      if (hasAnyLLMKey(body.apiKey)) {
        try {
          sceneDescription = await generateSceneDescription(
            body.postContent,
            body.provider || 'kimi',
            body.apiKey
          );
        } catch {
          // LLM failed — use fallback
          sceneDescription = getFallbackSceneDescription(body.postContent);
        }
      } else {
        // No LLM key available — use fallback
        sceneDescription = getFallbackSceneDescription(body.postContent);
      }
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
