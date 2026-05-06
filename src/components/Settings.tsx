'use client';

// ============================================
// Settings - API Key Configuration Modal
// Keys are stored in localStorage, never on server
// ============================================

import { useState } from 'react';
import { X, Eye, EyeOff, Check, Settings as SettingsIcon } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import type { UserApiKeys } from '@/types';

interface ProviderConfig {
  key: keyof UserApiKeys;
  label: string;
  placeholder: string;
  helpUrl: string;
  helpText: string;
  visible: boolean;
}

const providers: ProviderConfig[] = [
  {
    key: 'kimi',
    label: 'Kimi K2.5 (Free)',
    placeholder: 'sk-...',
    helpUrl: 'https://platform.moonshot.cn/console/api-keys',
    helpText: 'Get free API key from Moonshot AI',
    visible: true,
  },
  {
    key: 'gemini',
    label: 'Google Gemini',
    placeholder: 'AIza...',
    helpUrl: 'https://aistudio.google.com/apikey',
    helpText: 'Free tier available from Google AI Studio',
    visible: false,
  },
  {
    key: 'anthropic',
    label: 'Anthropic Claude',
    placeholder: 'sk-ant-...',
    helpUrl: 'https://console.anthropic.com/settings/keys',
    helpText: 'Paid - requires Anthropic account',
    visible: false,
  },
  {
    key: 'openai',
    label: 'OpenAI GPT-4o',
    placeholder: 'sk-...',
    helpUrl: 'https://platform.openai.com/api-keys',
    helpText: 'Paid - requires OpenAI account',
    visible: false,
  },
];

const visibleProviders = providers.filter((p) => p.visible);

export function SettingsModal() {
  const { apiKeys, setApiKey, showSettings, setShowSettings } = useAppStore();

  if (!showSettings) return null;

  return (
    <SettingsModalContent
      apiKeys={apiKeys}
      setApiKey={setApiKey}
      setShowSettings={setShowSettings}
    />
  );
}

function SettingsModalContent({
  apiKeys,
  setApiKey,
  setShowSettings,
}: {
  apiKeys: UserApiKeys;
  setApiKey: (provider: keyof UserApiKeys, key: string) => void;
  setShowSettings: (show: boolean) => void;
}) {
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [localKeys, setLocalKeys] = useState<UserApiKeys>({ ...apiKeys });
  const [saved, setSaved] = useState(false);

  const toggleVisibility = (key: string) => {
    setVisibleKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleSave = () => {
    for (const p of visibleProviders) {
      const value = localKeys[p.key] || '';
      setApiKey(p.key, value.trim());
    }
    setSaved(true);
    setTimeout(() => {
      setShowSettings(false);
      setSaved(false);
    }, 800);
  };

  const configuredCount = visibleProviders.filter(
    (p) => (localKeys[p.key] || '').trim().length > 0
  ).length;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={() => setShowSettings(false)}
      />

      <div className="relative w-full max-w-lg mx-4 bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <SettingsIcon className="w-5 h-5 text-zinc-400" />
            <div>
              <h2 className="text-lg font-semibold text-white">API Settings</h2>
              <p className="text-xs text-zinc-500">
                Keys are stored locally in your browser.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowSettings(false)}
            aria-label="Close settings"
            className="p-1.5 text-zinc-500 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-4 space-y-4 max-h-[60vh] overflow-y-auto">
          {visibleProviders.map((p) => (
            <div key={p.key}>
              <div className="flex items-center justify-between gap-4 mb-1.5">
                <label className="text-sm font-medium text-zinc-300">
                  {p.label}
                </label>
                <a
                  href={p.helpUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                >
                  {p.helpText}
                </a>
              </div>
              <div className="relative">
                <input
                  type={visibleKeys.has(p.key) ? 'text' : 'password'}
                  value={localKeys[p.key] || ''}
                  onChange={(e) =>
                    setLocalKeys((prev) => ({
                      ...prev,
                      [p.key]: e.target.value,
                    }))
                  }
                  placeholder={p.placeholder}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 pr-10 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 font-mono transition-all"
                />
                <button
                  onClick={() => toggleVisibility(p.key)}
                  aria-label={visibleKeys.has(p.key) ? 'Hide key' : 'Show key'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  {visibleKeys.has(p.key) ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-800 bg-zinc-900/50">
          <p className="text-xs text-zinc-600">
            {configuredCount}/{visibleProviders.length} providers configured
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSettings(false)}
              className="px-4 py-2 text-sm text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saved}
              className="flex items-center gap-2 px-5 py-2 text-sm font-medium bg-white text-black rounded-lg hover:bg-zinc-200 disabled:opacity-70 transition-all"
            >
              {saved ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Saved
                </>
              ) : (
                'Save Keys'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
