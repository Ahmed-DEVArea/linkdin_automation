'use client';

// ============================================
// PostEditor - Edit, enhance, and save content
// ============================================

import { useState } from 'react';
import Image from 'next/image';
import {
  ArrowLeft,
  RefreshCw,
  LayoutGrid,
  Save,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { CarouselPreview } from './CarouselPreview';
import { getApiKeyForProvider } from '@/lib/client-utils';

export function PostEditor() {
  const {
    currentPost,
    updatePostContent,
    setCurrentPost,
    setStep,
    llmProvider,
    apiKeys,
    notionConfig,
  } = useAppStore();

  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isGeneratingCarousel, setIsGeneratingCarousel] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showCarousel, setShowCarousel] = useState(false);
  const [error, setError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');

  if (!currentPost) return null;

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    setError('');
    try {
      const res = await fetch('/api/post', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: currentPost.content,
          provider: llmProvider,
          apiKey: getApiKeyForProvider(llmProvider, apiKeys),
        }),
      });

      if (!res.ok) throw new Error('Failed to regenerate');

      const data = await res.json();
      updatePostContent(data.content);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to regenerate');
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleGenerateCarousel = async () => {
    setIsGeneratingCarousel(true);
    setError('');
    try {
      const res = await fetch('/api/carousel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          post: currentPost,
          slideCount: 8,
          provider: llmProvider,
          apiKey: getApiKeyForProvider(llmProvider, apiKeys),
        }),
      });

      if (!res.ok) throw new Error('Failed to generate carousel');

      const data = await res.json();
      setCurrentPost({
        ...currentPost,
        carousel: data.carousel,
      });
      setShowCarousel(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to generate carousel'
      );
    } finally {
      setIsGeneratingCarousel(false);
    }
  };

  const handleSaveToNotion = async () => {
    setIsSaving(true);
    setError('');
    setSaveSuccess('');
    try {
      const res = await fetch('/api/notion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          post: currentPost,
          notionApiKey: notionConfig.apiKey,
          notionDatabaseId: notionConfig.databaseId,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save');
      }

      const data = await res.json();
      setCurrentPost({
        ...currentPost,
        notionPageId: data.pageId,
        status: 'saved',
      });
      setSaveSuccess('Saved to Notion successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(currentPost.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const wordCount = currentPost.content.split(/\s+/).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <button
              onClick={() => setStep('ideas')}
              className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-300 text-sm mb-3 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to ideas
            </button>
            <h2 className="text-2xl font-bold text-white">
              {currentPost.topic}
            </h2>
          </div>
          <span className="text-zinc-600 text-sm">{wordCount} words</span>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 bg-red-950/50 border border-red-900 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}
        {saveSuccess && (
          <div className="mb-4 px-4 py-3 bg-green-950/50 border border-green-900 rounded-lg text-green-400 text-sm">
            {saveSuccess}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
                <span className="text-xs text-zinc-600 uppercase tracking-wider">
                  Post
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-zinc-400 hover:text-white rounded-md hover:bg-zinc-800 transition-all"
                  >
                    {copied ? (
                      <Check className="w-3.5 h-3.5 text-green-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>

              <textarea
                value={currentPost.content}
                onChange={(e) => updatePostContent(e.target.value)}
                className="w-full bg-transparent text-white text-base leading-relaxed p-6 min-h-[400px] resize-none focus:outline-none placeholder:text-zinc-700"
                placeholder="Your post content..."
              />
            </div>

            {currentPost.imageUrl && (
              <div className="mt-4 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-zinc-800">
                  <span className="text-xs text-zinc-600 uppercase tracking-wider">
                    Generated Image
                  </span>
                </div>
                <div className="p-4">
                  <Image
                    src={currentPost.imageUrl}
                    alt="Generated"
                    width={1200}
                    height={800}
                    unoptimized
                    className="w-full h-auto rounded-lg"
                  />
                  {currentPost.imagePrompt && (
                    <p className="mt-2 text-xs text-zinc-600">
                      Prompt: {currentPost.imagePrompt}
                    </p>
                  )}
                </div>
              </div>
            )}

            {currentPost.carousel && (
              <div className="mt-4">
                <button
                  onClick={() => setShowCarousel(!showCarousel)}
                  className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white mb-3 transition-colors"
                >
                  {showCarousel ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                  {showCarousel ? 'Hide' : 'Show'} Carousel Preview
                </button>
                {showCarousel && (
                  <CarouselPreview carousel={currentPost.carousel} />
                )}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <ActionButton
              onClick={handleRegenerate}
              loading={isRegenerating}
              icon={<RefreshCw className="w-4 h-4" />}
              label="Regenerate"
              sublabel="Refine the post"
            />
            <ActionButton
              onClick={handleGenerateCarousel}
              loading={isGeneratingCarousel}
              icon={<LayoutGrid className="w-4 h-4" />}
              label="Generate Carousel"
              sublabel="Create slide deck"
            />
            <div className="pt-3 border-t border-zinc-800">
              <ActionButton
                onClick={handleSaveToNotion}
                loading={isSaving}
                icon={<Save className="w-4 h-4" />}
                label="Save to Notion"
                sublabel="Store everything"
                primary
              />
            </div>

            <div className="pt-6">
              <button
                onClick={() => {
                  useAppStore.getState().reset();
                }}
                className="w-full text-sm text-zinc-600 hover:text-zinc-400 transition-colors"
              >
                Start a new post
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ActionButton({
  onClick,
  loading,
  icon,
  label,
  sublabel,
  primary,
}: {
  onClick: () => void;
  loading: boolean;
  icon: React.ReactNode;
  label: string;
  sublabel: string;
  primary?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all disabled:opacity-50 ${
        primary
          ? 'bg-white text-black border-white hover:bg-zinc-200'
          : 'bg-zinc-900 text-white border-zinc-800 hover:border-zinc-600'
      }`}
    >
      {loading ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        icon
      )}
      <div className="text-left">
        <div className="text-sm font-medium">{label}</div>
        <div
          className={`text-xs ${primary ? 'text-black/50' : 'text-zinc-600'}`}
        >
          {sublabel}
        </div>
      </div>
    </button>
  );
}
