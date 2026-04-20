// ============================================
// Zustand Store — App State Management
// ============================================

import { create } from 'zustand';
import type { AppState, ContentIdea, LinkedInPost, LLMProvider } from '@/types';

export const useAppStore = create<AppState>((set) => ({
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
  llmProvider: 'claude',
  setLLMProvider: (provider: LLMProvider) => set({ llmProvider: provider }),

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
