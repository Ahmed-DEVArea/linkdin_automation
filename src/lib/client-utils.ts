// ============================================
// Client Utilities — Helper functions for frontend
// ============================================

import type { LLMProvider, UserApiKeys } from '@/types';

/**
 * Get the correct API key for a given LLM provider
 * from the user's stored keys
 */
export function getApiKeyForProvider(
  provider: LLMProvider,
  apiKeys: UserApiKeys
): string | undefined {
  switch (provider) {
    case 'claude':
      return apiKeys.anthropic;
    case 'openai':
      return apiKeys.openai;
    case 'gemini':
      return apiKeys.gemini;
    case 'kimi':
      return apiKeys.kimi;
    default:
      return undefined;
  }
}
