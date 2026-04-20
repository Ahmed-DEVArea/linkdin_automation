// ============================================
// Content Service — Idea & Post Generation
// ============================================

import { callLLM, extractJSON } from './llm';
import {
  IDEA_GENERATION_PROMPT,
  POST_GENERATION_PROMPT,
  REFINE_POST_PROMPT,
  IMAGE_SCENE_PROMPT,
} from './prompts';
import type { ContentIdea, LinkedInPost, LLMProvider } from '@/types';

export async function generateIdeas(
  topic: string,
  count: number = 5,
  provider: LLMProvider = 'claude'
): Promise<ContentIdea[]> {
  const prompt = IDEA_GENERATION_PROMPT
    .replace('{topic}', topic)
    .replace('{count}', String(count));

  const response = await callLLM({
    provider,
    prompt,
    systemPrompt: 'You are a LinkedIn content strategist. Return ONLY valid JSON.',
    temperature: 0.8,
  });

  const data = extractJSON<{ ideas: ContentIdea[] }>(response);
  
  // Ensure each idea has a unique id
  return data.ideas.map((idea, index) => ({
    ...idea,
    id: idea.id || String(index + 1),
  }));
}

export async function generatePost(
  idea: ContentIdea,
  provider: LLMProvider = 'claude',
  customInstructions?: string
): Promise<LinkedInPost> {
  const prompt = POST_GENERATION_PROMPT
    .replace('{title}', idea.title)
    .replace('{description}', idea.description)
    .replace('{angle}', idea.angle)
    .replace('{hook}', idea.hook)
    .replace('{customInstructions}', customInstructions || '');

  const content = await callLLM({
    provider,
    prompt,
    systemPrompt:
      'You are a LinkedIn ghostwriter. Write raw, authentic posts. Return ONLY the post text.',
    temperature: 0.7,
  });

  return {
    id: crypto.randomUUID(),
    topic: idea.title,
    content: content.trim(),
    hook: content.split('\n')[0] || idea.hook,
    status: 'generated',
    createdAt: new Date().toISOString(),
  };
}

export async function refinePost(
  content: string,
  instructions: string = '',
  provider: LLMProvider = 'claude'
): Promise<string> {
  const prompt = REFINE_POST_PROMPT
    .replace('{content}', content)
    .replace('{instructions}', instructions);

  const refined = await callLLM({
    provider,
    prompt,
    systemPrompt:
      'You are a LinkedIn post editor. Return ONLY the refined post text.',
    temperature: 0.6,
  });

  return refined.trim();
}

export async function generateSceneDescription(
  postContent: string,
  provider: LLMProvider = 'claude'
): Promise<string> {
  const prompt = IMAGE_SCENE_PROMPT.replace('{content}', postContent);

  const scene = await callLLM({
    provider,
    prompt,
    systemPrompt:
      'You are an image prompt engineer. Return ONLY a concise scene description.',
    temperature: 0.7,
    maxTokens: 256,
  });

  return scene.trim();
}
