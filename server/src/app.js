import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Import Routes
import authRoutes from './routes/auth.routes.js';
import aiRoutes from './routes/ai.routes.js';
import apiRoutes from './routes/api.js';

// Import Middleware
import { globalErrorHandler, notFoundHandler } from './middleware/errorHandler.middleware.js';

dotenv.config();

const app = express();
app.set('trust proxy', 1);

// Security & Base Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

// Health check endpoints
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'NexusAI Enterprise Backend API', timestamp: new Date().toISOString() }));
app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'NexusAI Enterprise Backend API', timestamp: new Date().toISOString() }));

// Register Modular API Endpoints (Support both /api/auth and /auth)
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);

app.use('/api/ai', aiRoutes);
app.use('/ai', aiRoutes);

app.use('/api', apiRoutes);
app.use('/', apiRoutes);

// 404 & Global Error Handling
app.use(notFoundHandler);
app.use(globalErrorHandler);

export default app;
