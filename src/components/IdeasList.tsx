'use client';

// ============================================
// IdeasList — Select from generated ideas
// ============================================

import { useState } from 'react';
import { ArrowLeft, ArrowRight, Lightbulb } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { getApiKeyForProvider } from '@/lib/client-utils';

export function IdeasList() {
  const {
    ideas,
    topic,
    selectIdea,
    setStep,
    setCurrentPost,
    setLoading,
    llmProvider,
    apiKeys,
  } = useAppStore();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const handleSelectIdea = async (idea: (typeof ideas)[0]) => {
    setLoadingId(idea.id);
    setLoading('isGeneratingPost', true);
    setError('');

    try {
      const res = await fetch('/api/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idea,
          provider: llmProvider,
          apiKey: getApiKeyForProvider(llmProvider, apiKeys),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to generate post');
      }

      const data = await res.json();
      selectIdea(idea);
      setCurrentPost(data.post);
      setStep('editor');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoadingId(null);
      setLoading('isGeneratingPost', false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-16 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <button
              onClick={() => setStep('input')}
              className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-300 text-sm mb-3 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back
            </button>
            <h2 className="text-2xl font-bold text-white">
              Content Ideas
            </h2>
            <p className="text-zinc-500 mt-1">
              Topic: <span className="text-zinc-400">{topic}</span>
            </p>
          </div>
          <div className="flex items-center gap-2 text-zinc-600 text-sm">
            <Lightbulb className="w-4 h-4" />
            {ideas.length} ideas
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 px-4 py-3 bg-red-950/50 border border-red-900 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Ideas Grid */}
        <div className="space-y-3">
          {ideas.map((idea) => (
            <button
              key={idea.id}
              onClick={() => handleSelectIdea(idea)}
              disabled={loadingId !== null}
              className="group w-full text-left p-6 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-zinc-600 transition-all disabled:opacity-50"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white group-hover:text-zinc-100">
                    {idea.title}
                  </h3>
                  <p className="text-zinc-500 mt-1.5 text-sm leading-relaxed">
                    {idea.description}
                  </p>
                  <div className="mt-3 flex items-center gap-3">
                    <span className="text-xs px-2.5 py-1 bg-zinc-800 text-zinc-400 rounded-md">
                      {idea.angle}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-zinc-600 italic">
                    &ldquo;{idea.hook}&rdquo;
                  </p>
                </div>
                <div className="flex-shrink-0 mt-1">
                  {loadingId === idea.id ? (
                    <div className="w-8 h-8 border-2 border-zinc-600 border-t-white rounded-full animate-spin" />
                  ) : (
                    <ArrowRight className="w-5 h-5 text-zinc-700 group-hover:text-zinc-400 transition-colors" />
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
