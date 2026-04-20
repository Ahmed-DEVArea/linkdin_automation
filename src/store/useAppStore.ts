// ============================================
// Zustand Store — App State Management
// ============================================

import { create } from 'zustand';
import type { AppState, ContentIdea, LinkedInPost, LLMProvider, UserApiKeys } from '@/types';

// Load API keys from localStorage
function loadApiKeys(): UserApiKeys {
  if (typeof window === 'undefined') return {};
  try {
    const stored = localStorage.getItem('content-engine-api-keys');
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

// Save API keys to localStorage
function saveApiKeys(keys: UserApiKeys) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('content-engine-api-keys', JSON.stringify(keys));
  } catch {
    // silently fail
  }
}

export const useAppStore = create<AppState>((set, get) => ({
  // Workflow step
  step: 'input',

  // Topic
  topic: '',
  setTopic: (topic: string) => set({ topic }),

  // Ideas
  ideas: [],
  setIdeas: (ideas: ContentIdea[]) => set({ ideas }),
  selectedIdea: null,
  selectIdea: (idea: ContentIdea) => set({ selectedIdea: idea }),

  // Post
  currentPost: null,
  setCurrentPost: (post: LinkedInPost | null) => set({ currentPost: post }),
  updatePostContent: (content: string) =>
    set((state) => ({
      currentPost: state.currentPost
        ? { ...state.currentPost, content }
        : null,
    })),

  // Settings
  llmProvider: 'kimi',
  setLLMProvider: (provider: LLMProvider) => set({ llmProvider: provider }),

  // API Keys
  apiKeys: loadApiKeys(),
  setApiKey: (provider: keyof UserApiKeys, key: string) => {
    const newKeys = { ...get().apiKeys, [provider]: key || undefined };
    saveApiKeys(newKeys);
    set({ apiKeys: newKeys });
  },

  // Settings modal
  showSettings: false,
  setShowSettings: (show: boolean) => set({ showSettings: show }),

  // Loading states
  isGeneratingIdeas: false,
  isGeneratingPost: false,
  isGeneratingCarousel: false,
  isGeneratingImage: false,
  isSavingToNotion: false,
  setLoading: (key: string, value: boolean) =>
    set({ [key]: value } as Partial<AppState>),

  // Navigation
  setStep: (step: AppState['step']) => set({ step }),
  reset: () =>
    set({
      step: 'input',
      topic: '',
      ideas: [],
      selectedIdea: null,
      currentPost: null,
      isGeneratingIdeas: false,
      isGeneratingPost: false,
      isGeneratingCarousel: false,
      isGeneratingImage: false,
      isSavingToNotion: false,
    }),
}));
