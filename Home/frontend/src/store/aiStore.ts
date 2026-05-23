import { create } from 'zustand';
import { SERVER_URL } from '../api/client.js';

const AI_BASE = `${SERVER_URL}/api/ai`;

// Only Gemini models
export type ChatModel = 'gemini-flash' | 'gemini-pro';

export interface RoomAnalysis {
  roomType: string;
  currentStyle: string;
  dimensions: string;
  lighting: string;
  colors: string[];
  strengths: string[];
  improvements: string[];
  overallScore: number;
}

export interface StyleScore {
  name: string;
  displayName: string;
  score: number;
  reason: string;
}

export interface GeneratedPrompt {
  mainPrompt: string;
  styleDetails: string;
  colorSuggestions: string;
  fullPrompt: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface AIState {
  chatModel: ChatModel;
  analysis: RoomAnalysis | null;
  styleScores: StyleScore[];
  generatedPrompt: GeneratedPrompt | null;
  chatMessages: ChatMessage[];
  isAnalyzing: boolean;
  isRecommending: boolean;
  isGeneratingPrompt: boolean;
  isChatting: boolean;
  error: string | null;
  setChatModel: (model: ChatModel) => void;
  analyzeRoom: (imageUrl: string) => Promise<void>;
  recommendStyles: (imageUrl: string) => Promise<void>;
  generatePrompt: (imageUrl: string, selectedStyle?: string, userInstructions?: string) => Promise<void>;
  sendChatMessage: (imageUrl: string, message: string) => Promise<void>;
  clearChat: () => void;
  clearError: () => void;
  reset: () => void;
}

async function aiPost<T>(endpoint: string, body: object): Promise<T> {
  const response = await fetch(`${AI_BASE}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.error || `AI request failed: ${response.status}`);
  }
  return data.data as T;
}

export const useAIStore = create<AIState>((set, get) => ({
  chatModel: 'gemini-flash',
  analysis: null,
  styleScores: [],
  generatedPrompt: null,
  chatMessages: [],
  isAnalyzing: false,
  isRecommending: false,
  isGeneratingPrompt: false,
  isChatting: false,
  error: null,

  setChatModel: (model) => set({ chatModel: model }),

  analyzeRoom: async (imageUrl: string) => {
    set({ isAnalyzing: true, error: null });
    try {
      const analysis = await aiPost<RoomAnalysis>('/analyze', { imageUrl });
      set({ analysis, isAnalyzing: false });
    } catch (error: any) {
      set({ error: error.message, isAnalyzing: false });
    }
  },

  recommendStyles: async (imageUrl: string) => {
    set({ isRecommending: true, error: null });
    try {
      const styleScores = await aiPost<StyleScore[]>('/recommend-styles', { imageUrl });
      set({ styleScores, isRecommending: false });
    } catch (error: any) {
      set({ error: error.message, isRecommending: false });
    }
  },

  generatePrompt: async (imageUrl: string, selectedStyle?: string, userInstructions?: string) => {
    set({ isGeneratingPrompt: true, error: null });
    try {
      const { chatModel } = get();
      const generatedPrompt = await aiPost<GeneratedPrompt>('/generate-prompt', {
        imageUrl,
        selectedStyle,
        userInstructions,
        modelName: chatModel,
      });
      set({ generatedPrompt, isGeneratingPrompt: false });
    } catch (error: any) {
      set({ error: error.message, isGeneratingPrompt: false });
    }
  },

  sendChatMessage: async (imageUrl: string, message: string) => {
    const userMsg: ChatMessage = { role: 'user', content: message, timestamp: Date.now() };
    set((s) => ({
      chatMessages: [...s.chatMessages, userMsg],
      isChatting: true,
      error: null,
    }));

    try {
      const { chatMessages, chatModel } = get();
      const history = chatMessages.slice(0, -1).map(({ role, content }) => ({ role, content }));
      const reply = await aiPost<{ reply: string }>('/chat', {
        imageUrl,
        messages: history,
        newMessage: message,
        modelName: chatModel,
      });

      const assistantMsg: ChatMessage = { role: 'assistant', content: reply.reply, timestamp: Date.now() };
      set((s) => ({ chatMessages: [...s.chatMessages, assistantMsg], isChatting: false }));
    } catch (error: any) {
      set((s) => ({
        chatMessages: s.chatMessages.slice(0, -1),
        error: error.message,
        isChatting: false,
      }));
    }
  },

  clearChat: () => set({ chatMessages: [] }),
  clearError: () => set({ error: null }),
  reset: () => set({
    analysis: null,
    styleScores: [],
    generatedPrompt: null,
    chatMessages: [],
    error: null,
  }),
}));
