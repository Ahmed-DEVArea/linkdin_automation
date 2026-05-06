'use client';

// ============================================
// Main App - LinkedIn Content Generation
// ============================================

import { useAppStore } from '@/store/useAppStore';
import { TopicInput } from '@/components/TopicInput';
import { IdeasList } from '@/components/IdeasList';
import { PostEditor } from '@/components/PostEditor';
import { SettingsModal } from '@/components/Settings';
import { Settings } from 'lucide-react';

export default function Home() {
  const { step, setShowSettings } = useAppStore();

  return (
    <main className="relative">
      <button
        onClick={() => setShowSettings(true)}
        aria-label="Open settings"
        className="fixed top-4 right-4 z-50 p-2.5 text-zinc-400 hover:text-white bg-zinc-900/80 border border-zinc-800 rounded-lg hover:border-zinc-600 backdrop-blur-sm transition-all"
      >
        <Settings className="w-4 h-4" />
      </button>

      <SettingsModal />

      {step === 'input' && <TopicInput />}
      {step === 'ideas' && <IdeasList />}
      {step === 'editor' && <PostEditor />}
      {step === 'saved' && <PostEditor />}
    </main>
  );
}
