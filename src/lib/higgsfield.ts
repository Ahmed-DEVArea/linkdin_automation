// ============================================
// Higgsfield Soul 2.0 — Image Generation Service
// Uses async queue pattern: submit → poll → get image
// Auth: Key {api_key_id}:{api_key_secret}
// Docs: https://docs.higgsfield.ai/how-to/introduction
// ============================================

const HIGGSFIELD_BASE_URL = 'https://platform.higgsfield.ai';
const SOUL_MODEL_ID = 'higgsfield-ai/soul/standard';
const POLL_INTERVAL_MS = 3000; // 3 seconds
const MAX_POLL_ATTEMPTS = 60; // 3 minutes max wait

export interface HiggsFieldImageOptions {
  prompt: string;
  characterId?: string;
  aspectRatio?: string;
  style?: string;
}

interface QueuedResponse {
  status: string;
  request_id: string;
  status_url: string;
  cancel_url: string;
}

interface CompletedResponse {
  status: string;
  request_id: string;
  images?: Array<{ url: string }>;
  video?: { url: string };
}

function getAuthHeader(): string {
  const keyId = process.env.HIGGSFIELD_API_KEY_ID;
  const keySecret = process.env.HIGGSFIELD_API_KEY_SECRET;
  if (!keyId || !keySecret) {
    throw new Error('HIGGSFIELD_API_KEY_ID and HIGGSFIELD_API_KEY_SECRET are required');
  }
  return `Key ${keyId}:${keySecret}`;
}

export function isHiggsFieldConfigured(): boolean {
  return !!(process.env.HIGGSFIELD_API_KEY_ID && process.env.HIGGSFIELD_API_KEY_SECRET);
}

/**
 * Submit an image generation request to Higgsfield Soul 2.0
 * Returns a queued response with request_id for polling
 */
async function submitImageRequest(options: HiggsFieldImageOptions): Promise<QueuedResponse> {
  const characterId = options.characterId || process.env.HIGGSFIELD_CHARACTER_ID;
  const imagePrompt = buildImagePrompt(options.prompt, options.style);

  const body: Record<string, unknown> = {
    prompt: imagePrompt,
    aspect_ratio: options.aspectRatio || '1:1',
    resolution: '1080p',
  };

  // Add character reference if available
  if (characterId) {
    body.character_id = characterId;
  }

  const response = await fetch(`${HIGGSFIELD_BASE_URL}/${SOUL_MODEL_ID}`, {
    method: 'POST',
    headers: {
      'Authorization': getAuthHeader(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => 'Unknown error');
    throw new Error(`Higgsfield submit error (${response.status}): ${errorBody}`);
  }

  return response.json();
}

/**
 * Poll for the result of an image generation request
 */
async function pollForResult(statusUrl: string): Promise<CompletedResponse> {
  for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
    const response = await fetch(statusUrl, {
      headers: {
        'Authorization': getAuthHeader(),
      },
    });

    if (!response.ok) {
      throw new Error(`Higgsfield status check error (${response.status})`);
    }

    const data: CompletedResponse = await response.json();

    switch (data.status) {
      case 'completed':
        return data;
      case 'failed':
        throw new Error('Higgsfield image generation failed');
      case 'nsfw':
        throw new Error('Content was flagged by moderation. Credits refunded.');
      case 'queued':
      case 'in_progress':
        // Wait and poll again
        await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
        break;
      default:
        throw new Error(`Unknown Higgsfield status: ${data.status}`);
    }
  }

  throw new Error('Higgsfield generation timed out after 3 minutes');
}

/**
 * Generate an image using Higgsfield Soul 2.0
 * Handles the full async flow: submit → poll → return image URL
 */
export async function generateImage(options: HiggsFieldImageOptions): Promise<{
  imageUrl: string;
  prompt: string;
  requestId: string;
}> {
  // Step 1: Submit the request
  const queued = await submitImageRequest(options);

  // Step 2: Poll until complete
  const result = await pollForResult(queued.status_url);

  // Step 3: Extract image URL
  const imageUrl = result.images?.[0]?.url;
  if (!imageUrl) {
    throw new Error('No image URL in Higgsfield response');
  }

  return {
    imageUrl,
    prompt: buildImagePrompt(options.prompt, options.style),
    requestId: queued.request_id,
  };
}

function buildImagePrompt(sceneDescription: string, style?: string): string {
  const basePrompt = `Professional LinkedIn personal brand photo. ${sceneDescription}. Natural lighting, authentic feel, NOT a stock photo. High quality, editorial style.`;

  if (style === 'cinematic') {
    return `${basePrompt} Cinematic color grading, shallow depth of field.`;
  }

  if (style === 'warm') {
    return `${basePrompt} Warm tones, golden hour lighting.`;
  }

  return basePrompt;
}
