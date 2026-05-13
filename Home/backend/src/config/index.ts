import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '4000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',

  jwt: {
    secret: process.env.JWT_SECRET || 'fallback-secret-CHANGE-IN-PRODUCTION',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  // ─── Multi-Provider AI ────────────────────────────────────────────────
  // Options: 'mock' | 'fal' | 'huggingface' | 'replicate' | 'gemini' | 'segmind'
  activeAiProvider: process.env.ACTIVE_AI_PROVIDER || 'mock',

  // Replicate AI (paid)
  replicate: {
    // Backward compatibility: support both REPLICATE_API_TOKEN and legacy REPLICATE_API
    apiToken: (process.env.REPLICATE_API_TOKEN || process.env.REPLICATE_API || '').trim(),
  },

  // HuggingFace AI (free, text-to-image only)
  huggingface: {
    apiToken: (process.env.HUGGINGFACE_API_TOKEN || '').trim(),
  },

  // Google Gemini AI (free tier, TRUE img2img — keeps room structure)
  gemini: {
    apiKey: (process.env.GEMINI_API_KEY || '').trim(),
  },

  // fal.ai (high quality ControlNet img2img)
  fal: {
    apiKey: (process.env.FAL_KEY || '').trim(),
  },

  // Segmind (img2img endpoint)
  segmind: {
    apiKey: (process.env.SEGMIND_API_KEY || '').trim(),
    endpoint: (process.env.SEGMIND_API_URL || 'https://api.segmind.com/v1/sd1.5-img2img').trim(),
  },

  // Groq (fast chat and vision fallback)
  groq: {
    apiKey: (process.env.GROQ_API_KEY || '').trim(),
  },

  // Legacy flag — derived from activeAiProvider for backward compatibility
  get useMockAi() {
    return this.activeAiProvider === 'mock';
  },

  // Cloudinary — image storage
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
    url: process.env.CLOUDINARY_URL || '',
  },

  // Database
  databaseUrl: process.env.DATABASE_URL || '',

  storage: {
    uploadDir: process.env.UPLOAD_DIR || './uploads',
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10),
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  },

  // CORS — comma-separated list of allowed origins
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
};
