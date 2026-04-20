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
  provider: LLMProvider = 'claude',
  apiKey?: string
): Promise<ContentIdea[]> {
  const prompt = IDEA_GENERATION_PROMPT
    .replace('{topic}', topic)
    .replace('{count}', String(count));

  const response = await callLLM({
    provider,
    prompt,
    systemPrompt: 'You are a LinkedIn content strategist for Adit — a raw, human brand. Generate ideas that feel like a real person thinking. No ChatGPT-sounding phrases. Return ONLY valid JSON.',
    temperature: 0.8,
    apiKey,
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
  customInstructions?: string,
  apiKey?: string
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
      'You are Adit\'s LinkedIn ghostwriter. Write raw, authentic posts that feel like a real person thinking — never like AI wrote it. No corporate language, no ChatGPT phrases. Return ONLY the post text.',
    temperature: 0.7,
    apiKey,
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
  provider: LLMProvider = 'claude',
  apiKey?: string
): Promise<string> {
  const prompt = REFINE_POST_PROMPT
    .replace('{content}', content)
    .replace('{instructions}', instructions);

  const refined = await callLLM({
    provider,
    prompt,
    systemPrompt:
      'You are Adit\'s LinkedIn post editor. Make posts sharper and more human — never more polished or corporate. Kill any ChatGPT-sounding phrases. Return ONLY the refined post text.',
    temperature: 0.6,
    apiKey,
  });

  return refined.trim();
}

export async function generateSceneDescription(
  postContent: string,
  provider: LLMProvider = 'claude',
  apiKey?: string
): Promise<string> {
  const prompt = IMAGE_SCENE_PROMPT.replace('{content}', postContent);

  const scene = await callLLM({
    provider,
    prompt,
    systemPrompt:
      'You are an image prompt engineer. Return ONLY a concise scene description.',
    temperature: 0.7,
    maxTokens: 256,
    apiKey,
  });

  return scene.trim();
}
