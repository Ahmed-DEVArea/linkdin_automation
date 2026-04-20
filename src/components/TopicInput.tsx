'use client';

// ============================================
// TopicInput — Clean minimal input screen
// ============================================

import { useState } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { ProviderSwitch } from './ProviderSwitch';
import { getApiKeyForProvider } from '@/lib/client-utils';

export function TopicInput() {
  const { topic, setTopic, setIdeas, setStep, setLoading, llmProvider, apiKeys } =
    useAppStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!topic.trim()) return;

    setIsLoading(true);
    setLoading('isGeneratingIdeas', true);
    setError('');

    try {
      const res = await fetch('/api/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic.trim(),
          count: 5,
          provider: llmProvider,
          apiKey: getApiKeyForProvider(llmProvider, apiKeys),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to generate ideas');
      }

      const data = await res.json();
      setIdeas(data.ideas);
      setStep('ideas');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
      setLoading('isGeneratingIdeas', false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
      <div className="w-full max-w-2xl px-6">
        {/* Logo / Brand */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white tracking-tight">
            Content Engine
          </h1>
          <p className="text-zinc-500 mt-3 text-lg">
            Generate LinkedIn posts that feel human.
          </p>
        </div>

        {/* Input Area */}
        <div className="relative">
          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="What do you want to post about?"
            rows={3}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-6 py-5 text-white text-lg placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 resize-none transition-all"
            disabled={isLoading}
          />

          {/* Examples */}
          <div className="flex flex-wrap gap-2 mt-4">
            {[
              'AI replacing jobs',
              'Remote work culture',
              'Startup failures',
              'Personal branding',
            ].map((example) => (
              <button
                key={example}
                onClick={() => setTopic(example)}
                className="px-3 py-1.5 text-sm text-zinc-500 bg-zinc-900 border border-zinc-800 rounded-lg hover:text-zinc-300 hover:border-zinc-700 transition-colors"
              >
                {example}
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-4 px-4 py-3 bg-red-950/50 border border-red-900 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="mt-8 flex items-center justify-between">
          <ProviderSwitch />

          <button
            onClick={handleGenerate}
            disabled={!topic.trim() || isLoading}
            className="group flex items-center gap-2 px-6 py-3 bg-white text-black font-medium rounded-lg hover:bg-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            {isLoading ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                Generate Ideas
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
