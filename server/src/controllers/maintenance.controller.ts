import { Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth.middleware';
import { createError } from '../middleware/error.middleware';

const prisma = new PrismaClient();

const maintenanceSchema = z.object({
  vehicleId: z.string(),
  type: z.enum(['ROUTINE', 'REPAIR', 'INSPECTION', 'EMERGENCY']),
  description: z.string().min(1),
  scheduledDate: z.string().datetime(),
  estimatedCost: z.number().min(0).optional(),
  serviceProvider: z.string().optional(),
});

const updateMaintenanceSchema = maintenanceSchema.partial().extend({
  status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
  actualCost: z.number().min(0).optional(),
  completedDate: z.string().datetime().optional(),
  notes: z.string().optional(),
});

export async function getMaintenanceRecords(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { vehicleId, status, type, page = '1', limit = '20' } = req.query;
    const where: Record<string, unknown> = {};
    if (vehicleId) where.vehicleId = vehicleId;
    if (status) where.status = status;
    if (type) where.type = type;

    const skip = (Number(page) - 1) * Number(limit);
    const [records, total] = await Promise.all([
      prisma.maintenanceRecord.findMany({
        where,
        skip,
        take: Number(limit),
        include: { vehicle: { select: { id: true, licensePlate: true, brand: true, model: true } } },
        orderBy: { scheduledDate: 'desc' },
      }),
      prisma.maintenanceRecord.count({ where }),
    ]);

    res.json({ success: true, data: records, pagination: { page: Number(page), limit: Number(limit), total } });
  } catch (err) {
    next(err);
  }
}

export async function getMaintenanceRecord(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const record = await prisma.maintenanceRecord.findUnique({
      where: { id: req.params.id },
      include: { vehicle: true },
    });
    if (!record) throw createError('Maintenance record not found', 404);
    res.json({ success: true, data: record });
  } catch (err) {
    next(err);
  }
}

export async function createMaintenanceRecord(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = maintenanceSchema.parse(req.body);
    const record = await prisma.maintenanceRecord.create({
      data: { ...data, status: 'SCHEDULED' },
    });
    res.status(201).json({ success: true, data: record });
  } catch (err) {
    next(err);
  }
}

export async function updateMaintenanceRecord(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = updateMaintenanceSchema.parse(req.body);

    // If completing maintenance, update vehicle status back to available
    if (data.status === 'COMPLETED') {
      const record = await prisma.maintenanceRecord.findUnique({ where: { id: req.params.id } });
      if (record) {
        await prisma.vehicle.update({
          where: { id: record.vehicleId },
          data: { status: 'AVAILABLE' },
        });
      }
    }

    const record = await prisma.maintenanceRecord.update({
      where: { id: req.params.id },
      data,
    });
    res.json({ success: true, data: record });
  } catch (err) {
    next(err);
  }
}

export async function getUpcomingMaintenance(_req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const records = await prisma.maintenanceRecord.findMany({
      where: {
        status: 'SCHEDULED',
        scheduledDate: { lte: thirtyDaysFromNow },
      },
      include: { vehicle: { select: { id: true, licensePlate: true, brand: true, model: true } } },
      orderBy: { scheduledDate: 'asc' },
    });

    res.json({ success: true, data: records });
  } catch (err) {
    next(err);
  }
}
