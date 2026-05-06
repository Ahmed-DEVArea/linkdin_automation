'use client';

import { useState } from 'react';
import { Check, Database, Eye, EyeOff, X } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import type { NotionConfig } from '@/types';

export function NotionSettingsModal() {
  const {
    notionConfig,
    setNotionConfig,
    showNotionSettings,
    setShowNotionSettings,
  } = useAppStore();

  if (!showNotionSettings) return null;

  return (
    <NotionSettingsModalContent
      notionConfig={notionConfig}
      setNotionConfig={setNotionConfig}
      setShowNotionSettings={setShowNotionSettings}
    />
  );
}

function NotionSettingsModalContent({
  notionConfig,
  setNotionConfig,
  setShowNotionSettings,
}: {
  notionConfig: NotionConfig;
  setNotionConfig: (config: NotionConfig) => void;
  setShowNotionSettings: (show: boolean) => void;
}) {
  const [localConfig, setLocalConfig] = useState<NotionConfig>({
    ...notionConfig,
  });
  const [showKey, setShowKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const updateField = (key: keyof NotionConfig, value: string) => {
    setLocalConfig((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    setNotionConfig(localConfig);
    setSaved(true);
    setStatus('Connection saved');
    setTimeout(() => {
      setShowNotionSettings(false);
      setSaved(false);
    }, 800);
  };

  const handleTest = async () => {
    setIsTesting(true);
    setStatus('');
    setError('');

    try {
      const apiKey = localConfig.apiKey?.trim();
      const databaseId = localConfig.databaseId?.trim();
      const headers: Record<string, string> = {};
      if (apiKey) headers['x-notion-api-key'] = apiKey;
      if (databaseId) headers['x-notion-database-id'] = databaseId;

      const res = await fetch('/api/notion', { headers });
      const data = await res.json();

      if (!res.ok || !data.connected) {
        throw new Error(data.error || 'Could not connect to Notion');
      }

      setStatus(`Connected to ${data.databaseName || 'Notion database'}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not connect to Notion');
    } finally {
      setIsTesting(false);
    }
  };

  const canSave =
    !!localConfig.apiKey?.trim() && !!localConfig.databaseId?.trim();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={() => setShowNotionSettings(false)}
      />

      <div className="relative w-full max-w-lg mx-4 bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <Database className="w-5 h-5 text-zinc-400" />
            <div>
              <h2 className="text-lg font-semibold text-white">Connect Notion</h2>
              <p className="text-xs text-zinc-500">
                Add your integration secret and database ID.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowNotionSettings(false)}
            aria-label="Close Notion settings"
            className="p-1.5 text-zinc-500 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-4 space-y-4">
          <div>
            <div className="flex items-center justify-between gap-4 mb-1.5">
              <label className="text-sm font-medium text-zinc-300">
                Notion integration secret
              </label>
              <a
                href="https://www.notion.so/my-integrations"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                Create integration
              </a>
            </div>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={localConfig.apiKey || ''}
                onChange={(e) => updateField('apiKey', e.target.value)}
                placeholder="ntn_..."
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 pr-10 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 font-mono transition-all"
              />
              <button
                onClick={() => setShowKey((value) => !value)}
                aria-label={showKey ? 'Hide Notion key' : 'Show Notion key'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                {showKey ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="block mb-1.5 text-sm font-medium text-zinc-300">
              Notion database ID
            </label>
            <input
              type="text"
              value={localConfig.databaseId || ''}
              onChange={(e) => updateField('databaseId', e.target.value)}
              placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 font-mono transition-all"
            />
          </div>

          {status && (
            <div className="px-4 py-3 bg-green-950/50 border border-green-900 rounded-lg text-green-400 text-sm">
              {status}
            </div>
          )}
          {error && (
            <div className="px-4 py-3 bg-red-950/50 border border-red-900 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-zinc-800 bg-zinc-900/50">
          <button
            onClick={handleTest}
            disabled={isTesting}
            className="px-4 py-2 text-sm text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 disabled:opacity-60 transition-all"
          >
            {isTesting ? 'Testing...' : 'Test Connection'}
          </button>
          <button
            onClick={handleSave}
            disabled={!canSave || saved}
            className="flex items-center gap-2 px-5 py-2 text-sm font-medium bg-white text-black rounded-lg hover:bg-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {saved && <Check className="w-3.5 h-3.5" />}
            {saved ? 'Saved' : 'Save Connection'}
          </button>
        </div>
      </div>
    </div>
  );
}
