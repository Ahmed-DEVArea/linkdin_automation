'use client';

// ============================================
// ProviderSwitch — Toggle between LLM providers
// ============================================

import { useAppStore } from '@/store/useAppStore';
import type { LLMProvider } from '@/types';

const providers: { id: LLMProvider; label: string }[] = [
  { id: 'claude', label: 'Claude' },
  { id: 'openai', label: 'GPT-4o' },
  { id: 'gemini', label: 'Gemini' },
];

export function ProviderSwitch() {
  const { llmProvider, setLLMProvider } = useAppStore();

  return (
    <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-1">
      {providers.map((p) => (
        <button
          key={p.id}
          onClick={() => setLLMProvider(p.id)}
          className={`px-3 py-1.5 text-sm rounded-md transition-all ${
            llmProvider === p.id
              ? 'bg-zinc-700 text-white'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}
