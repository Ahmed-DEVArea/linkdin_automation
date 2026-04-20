// ============================================
// LinkedIn Automation - Core Types
// ============================================

export type LLMProvider = 'claude' | 'openai' | 'gemini' | 'kimi';

export interface LLMConfig {
  provider: LLMProvider;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

// User-provided API keys (stored client-side in localStorage)
export interface UserApiKeys {
  anthropic?: string;
  openai?: string;
  gemini?: string;
  kimi?: string;
}

export interface ContentIdea {
  id: string;
  title: string;
  description: string;
  angle: string;
  hook: string;
  selected?: boolean;
}

export interface LinkedInPost {
  id: string;
  topic: string;
  content: string;
  hook: string;
  carousel?: CarouselData;
  imageUrl?: string;
  imagePrompt?: string;
  status: 'draft' | 'generated' | 'reviewed' | 'saved';
  createdAt: string;
  notionPageId?: string;
}

export interface CarouselSlide {
  slideNumber: number;
  headline: string;
  body: string;
  footer?: string;
}

export interface CarouselData {
  title: string;
  slides: CarouselSlide[];
  htmlContent?: string;
  pdfUrl?: string;
}

export interface ImageGenerationRequest {
  postContent: string;
  sceneDescription: string;
  characterReference?: string;
  style?: string;
}

export interface NotionEntry {
  topic: string;
  content: string;
  carouselHtml?: string;
  carouselPdfUrl?: string;
  imageUrl?: string;
  status: string;
  date: string;
}

// API Request/Response types
export interface GenerateIdeasRequest {
  topic: string;
  count?: number;
  provider?: LLMProvider;
  demo?: boolean;
  apiKey?: string;
}

export interface GenerateIdeasResponse {
  ideas: ContentIdea[];
}

export interface GeneratePostRequest {
  idea: ContentIdea;
  provider?: LLMProvider;
  customInstructions?: string;
  demo?: boolean;
  apiKey?: string;
}

export interface GeneratePostResponse {
  post: LinkedInPost;
}

export interface GenerateCarouselRequest {
  post: LinkedInPost;
  slideCount?: number;
  provider?: LLMProvider;
  demo?: boolean;
  apiKey?: string;
}

export interface GenerateCarouselResponse {
  carousel: CarouselData;
}

export interface GenerateImageRequest {
  postContent: string;
  sceneDescription?: string;
}

export interface GenerateImageResponse {
  imageUrl: string;
  prompt: string;
}

export interface SaveToNotionRequest {
  post: LinkedInPost;
}

export interface SaveToNotionResponse {
  pageId: string;
  url: string;
}

// App State
export interface AppState {
  // Current workflow step
  step: 'input' | 'ideas' | 'editor' | 'saved';
  
  // Topic input
  topic: string;
  setTopic: (topic: string) => void;
  
  // Ideas
  ideas: ContentIdea[];
  setIdeas: (ideas: ContentIdea[]) => void;
  selectedIdea: ContentIdea | null;
  selectIdea: (idea: ContentIdea) => void;
  
  // Post
  currentPost: LinkedInPost | null;
  setCurrentPost: (post: LinkedInPost | null) => void;
  updatePostContent: (content: string) => void;
  
  // Settings
  llmProvider: LLMProvider;
  setLLMProvider: (provider: LLMProvider) => void;
  
  // API Keys (user-provided, stored in localStorage)
  apiKeys: UserApiKeys;
  setApiKey: (provider: keyof UserApiKeys, key: string) => void;
  
  // Settings modal
  showSettings: boolean;
  setShowSettings: (show: boolean) => void;
  
  // Loading states
  isGeneratingIdeas: boolean;
  isGeneratingPost: boolean;
  isGeneratingCarousel: boolean;
  isGeneratingImage: boolean;
  isSavingToNotion: boolean;
  setLoading: (key: string, value: boolean) => void;
  
  // Navigation
  setStep: (step: AppState['step']) => void;
  reset: () => void;
}
