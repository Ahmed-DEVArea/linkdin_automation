'use client';

// ============================================
// Main App — LinkedIn Content Engine
// ============================================

import { useAppStore } from '@/store/useAppStore';
import { TopicInput } from '@/components/TopicInput';
import { IdeasList } from '@/components/IdeasList';
import { PostEditor } from '@/components/PostEditor';

export default function Home() {
  const { step } = useAppStore();

  return (
    <main className="relative">
      {/* Demo mode indicator */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500/10 border-b border-amber-500/20 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 py-2 flex items-center justify-between">
          <p className="text-xs text-amber-400/80">
            <span className="inline-block w-1.5 h-1.5 bg-amber-400 rounded-full mr-2 animate-pulse" />
            Demo Mode — Using sample data. Add API keys to .env.local for live AI generation.
          </p>
        </div>
      </div>

      <div className="pt-8">
        {step === 'input' && <TopicInput />}
        {step === 'ideas' && <IdeasList />}
        {step === 'editor' && <PostEditor />}
        {step === 'saved' && <PostEditor />}
      </div>
    </main>
  );
}
