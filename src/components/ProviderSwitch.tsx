'use client';

// ============================================
// ProviderSwitch — Toggle between LLM providers
// ============================================

import { useAppStore } from '@/store/useAppStore';
import type { LLMProvider } from '@/types';

const providers: { id: LLMProvider; label: string; hint?: string }[] = [
  { id: 'kimi', label: 'Kimi K2.5', hint: 'Free' },
  { id: 'claude', label: 'Claude' },
  { id: 'openai', label: 'GPT-4o' },
  { id: 'gemini', label: 'Gemini' },
];

export function ProviderSwitch() {
  const { llmProvider, setLLMProvider, apiKeys } = useAppStore();

  // Map provider id to apiKeys key
  const keyMap: Record<LLMProvider, keyof typeof apiKeys> = {
    kimi: 'kimi',
    claude: 'anthropic',
    openai: 'openai',
    gemini: 'gemini',
  };

  return (
    <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-1">
      {providers.map((p) => {
        const hasKey = !!(apiKeys[keyMap[p.id]]);
        return (
          <button
            key={p.id}
            onClick={() => setLLMProvider(p.id)}
            className={`relative px-3 py-1.5 text-sm rounded-md transition-all ${
              llmProvider === p.id
                ? 'bg-zinc-700 text-white'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {p.label}
            {hasKey && (
              <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-green-400 rounded-full" />
            )}
          </button>
        );
      })}
    </div>
  );
}
