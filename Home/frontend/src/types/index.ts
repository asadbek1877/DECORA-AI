export interface User {
  id: string;
  email: string;
  username: string;
  credits: number;
  avatarUrl?: string;
  role?: string;
  createdAt?: string;
}

export interface AIModel {
  id: string;
  displayName: string;
  description: string;
  provider: string;
  creditCost: number;
  speed: 'fast' | 'medium' | 'slow';
  quality: 'good' | 'excellent' | 'premium';
  icon?: string;
}

export interface AuthResult {
  user: User;
  token: string;
}

export interface DesignStyle {
  name: string;
  displayName: string;
  description: string;
  colorPalette: string[];
  materials: string[];
}

export interface PreviewImage {
  id: string;
  styleName: string;
  imageUrl: string;
}

export interface Project {
  id: string;
  originalImageUrl: string;
  finalImageUrl?: string;
  style?: string;
  styleName?: string;
  roomType?: string;
  status: 'uploaded' | 'previewing' | 'generating' | 'completed' | 'failed' | 'UPLOADED' | 'PREVIEWING' | 'GENERATING' | 'COMPLETED' | 'FAILED';
  previewCount: number;
  previewImages?: PreviewImage[];
  finalImage?: { id: string; imageUrl: string; prompt?: string } | null;
  lastPrompt?: string | null;
  isLiked?: boolean;
  likeCount?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface ProjectDetail extends Project {
  previewImages: PreviewImage[];
  likeCount?: number;
  isLiked?: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface UploadResult {
  projectId: string | null;
  originalImageUrl: string;
  status: string;
  guestMode?: boolean;
}

export interface PreviewResult {
  projectId: string;
  previews: PreviewImage[];
}

export interface GeneratedPrompt {
  mainPrompt: string;
  styleDetails: string;
  colorSuggestions: string;
  fullPrompt: string;
}

export interface FinalResult {
  projectId: string;
  styleName: string;
  finalImageUrl: string;
  originalImageUrl: string;
  status: string;
}

export interface ShareResult {
  shareUrl: string;
  shareToken: string;
  projectId: string;
  imageUrl: string;
}

export interface CreditsResult {
  credits: number;
  freeCredits?: number;
  paidCredits?: number;
  possibleGenerations?: number;
  nextRefillAt?: string;
}

export interface CommunityProject {
  id: string;
  originalImageUrl: string;
  finalImageUrl: string | null;
  style: string | null;
  author: string;
  createdAt: string;
}

export interface AIModelConfig {
  id: string;
  displayName: string;
  description: string;
  apiModelName: string;
  provider: string;
  creditCost: number;
  speed: 'fast' | 'medium' | 'slow';
  quality: 'good' | 'excellent' | 'premium';
  icon?: string;
}

// ───────── NEW: Advanced Design Control Types ─────────────
export interface ColorPalette {
  id: string;
  name: string;
  colors: string[]; // Hex color codes
  category?: 'warm' | 'cool' | 'neutral' | 'vibrant' | 'pastel';
  likes?: number;
  createdAt?: string;
}

export interface RemovalOptions {
  furniture: boolean;
  decor: boolean;
  electronics: boolean;
  emptyRoom: boolean;
}

export interface StyleParameters {
  intensity: number; // 0-100%
  colorPalette?: ColorPalette | null;
  customColors?: string[]; // User-selected custom hex colors
  removals: RemovalOptions;
}

export interface ColorAnalysis {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  palette: string[];
  hexCodes: { [key: string]: string };
  rgbCodes?: { [key: string]: { r: number; g: number; b: number } };
}

export interface PromptGeneratorRequest {
  style: DesignStyle;
  intensity: number;
  colorPalette?: ColorPalette | null;
  removals: RemovalOptions;
  roomType?: string;
  additionalContext?: string;
}

export interface AIGeneratedPrompt {
  mainPrompt: string;
  styleDetails: string;
  colorDescription: string;
  removalInstructions?: string;
  fullPrompt: string;
  strength: number; // Based on intensity
}


