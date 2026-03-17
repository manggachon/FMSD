import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.routes';
import vehicleRoutes from './routes/vehicle.routes';
import driverRoutes from './routes/driver.routes';
import tripRoutes from './routes/trip.routes';
import maintenanceRoutes from './routes/maintenance.routes';
import reportRoutes from './routes/report.routes';
import { errorHandler } from './middleware/error.middleware';
import { authenticateToken } from './middleware/auth.middleware';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Socket.io setup (Real-time GPS tracking)
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.on('vehicle:subscribe', (vehicleId: string) => {
    socket.join(`vehicle:${vehicleId}`);
  });

  socket.on('vehicle:location', (data: { vehicleId: string; lat: number; lng: number }) => {
    io.to(`vehicle:${data.vehicleId}`).emit('vehicle:location:update', data);
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Public routes
app.use('/api/auth', authRoutes);

// Protected routes
app.use('/api/vehicles', authenticateToken, vehicleRoutes);
app.use('/api/drivers', authenticateToken, driverRoutes);
app.use('/api/trips', authenticateToken, tripRoutes);
app.use('/api/maintenance', authenticateToken, maintenanceRoutes);
app.use('/api/reports', authenticateToken, reportRoutes);

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`🚀 ASIOS Fleet Management Server running on port ${PORT}`);
  console.log(`📡 Socket.io ready for real-time tracking`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
