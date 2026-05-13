import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import path from 'path';
import { config } from './config';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';
import { generalLimiter } from './middleware/rateLimiter';
import { ensureUploadDir } from './services/image.service';
import { connectDatabase, disconnectDatabase } from './lib/prisma';
import logger from './utils/logger';

const app = express();

// Ensure upload directory exists
ensureUploadDir();

// Security
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// CORS — parse comma-separated list of allowed origins
const allowedOrigins = config.frontendUrl
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: Origin "${origin}" not allowed`));
  },
  credentials: true,
}));

// Compression
app.use(compression());

// Logging
app.use(morgan('combined', {
  stream: { write: (message: string) => logger.info(message.trim()) },
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
app.use(generalLimiter);

// Static files (uploaded images)
app.use('/uploads', express.static(path.resolve(config.storage.uploadDir)));

// API routes
app.use('/api', routes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
  });
});

// Global error handler
app.use(errorHandler);

// Start server with database connection
async function startServer() {
  try {
    await connectDatabase();
    logger.info('✅ Database connected');
  } catch (error: any) {
    logger.warn(`⚠️ Database connection failed: ${error.message}. Server will start without DB.`);
  }

  const server = app.listen(config.port, () => {
    logger.info(`🚀 Server running on port ${config.port} in ${config.nodeEnv} mode`);
    logger.info(`📁 Upload dir: ${path.resolve(config.storage.uploadDir)}`);
    logger.info(`🔗 Health check: http://localhost:${config.port}/api/health`);
  });

  return server;
}

const serverPromise = startServer();
let server: ReturnType<typeof app.listen>;
serverPromise.then((s) => { server = s; });

// Graceful shutdown to prevent EADDRINUSE on restart
const shutdown = async () => {
  await disconnectDatabase();
  if (server) {
    server.close(() => {
      logger.info('Server closed gracefully');
      process.exit(0);
    });
  }
  setTimeout(() => process.exit(1), 5000);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
if (process.platform !== 'win32') {
  process.on('SIGUSR2', async () => {
    await disconnectDatabase();
    if (server) server.close(() => process.exit(0));
  });
}

export default app;
