'use client';

// ============================================
// Main App — LinkedIn Content Engine
// ============================================

import { useAppStore } from '@/store/useAppStore';
import { TopicInput } from '@/components/TopicInput';
import { IdeasList } from '@/components/IdeasList';
import { PostEditor } from '@/components/PostEditor';
import { SettingsModal } from '@/components/Settings';
import { Settings } from 'lucide-react';

export default function Home() {
  const { step, apiKeys, setShowSettings } = useAppStore();

  const hasAnyKey = Object.values(apiKeys).some((k) => k && k.trim().length > 0);

  return (
    <main className="relative">
      {/* Top bar */}
      <div className="fixed top-0 left-0 right-0 z-50 backdrop-blur-sm border-b border-zinc-800/50">
        <div className={`${hasAnyKey ? 'bg-zinc-950/80' : 'bg-amber-500/10 border-amber-500/20'}`}>
          <div className="max-w-4xl mx-auto px-6 py-2 flex items-center justify-between">
            {hasAnyKey ? (
              <p className="text-xs text-green-400/70">
                <span className="inline-block w-1.5 h-1.5 bg-green-400 rounded-full mr-2" />
                Live Mode — AI generation active
              </p>
            ) : (
              <p className="text-xs text-amber-400/80">
                <span className="inline-block w-1.5 h-1.5 bg-amber-400 rounded-full mr-2 animate-pulse" />
                Demo Mode — Click Settings to add your API keys
              </p>
            )}
            <button
              onClick={() => setShowSettings(true)}
              className="flex items-center gap-1.5 px-3 py-1 text-xs text-zinc-400 hover:text-white rounded-md hover:bg-zinc-800 transition-all"
            >
              <Settings className="w-3.5 h-3.5" />
              Settings
            </button>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      <SettingsModal />

      <div className="pt-10">
        {step === 'input' && <TopicInput />}
        {step === 'ideas' && <IdeasList />}
        {step === 'editor' && <PostEditor />}
        {step === 'saved' && <PostEditor />}
      </div>
    </main>
  );
}
