import { Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth.middleware';
import { createError } from '../middleware/error.middleware';

const prisma = new PrismaClient();

const vehicleSchema = z.object({
  licensePlate: z.string().min(1),
  brand: z.string().min(1),
  model: z.string().min(1),
  year: z.number().int().min(1900).max(2100),
  color: z.string().optional(),
  vehicleType: z.enum(['CAR', 'VAN', 'TRUCK', 'MOTORCYCLE', 'BUS']),
  fuelType: z.enum(['GASOLINE', 'DIESEL', 'ELECTRIC', 'HYBRID']),
  mileage: z.number().min(0).optional(),
  insuranceExpiry: z.string().datetime().optional(),
  taxExpiry: z.string().datetime().optional(),
});

export async function getVehicles(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { status, type, page = '1', limit = '20' } = req.query;

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (type) where.vehicleType = type;

    const skip = (Number(page) - 1) * Number(limit);

    const [vehicles, total] = await Promise.all([
      prisma.vehicle.findMany({
        where,
        skip,
        take: Number(limit),
        include: { currentDriver: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.vehicle.count({ where }),
    ]);

    res.json({
      success: true,
      data: vehicles,
      pagination: { page: Number(page), limit: Number(limit), total },
    });
  } catch (err) {
    next(err);
  }
}

export async function getVehicle(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: req.params.id },
      include: {
        currentDriver: true,
        trips: { take: 10, orderBy: { startTime: 'desc' } },
        maintenanceRecords: { take: 5, orderBy: { scheduledDate: 'desc' } },
      },
    });

    if (!vehicle) throw createError('Vehicle not found', 404);
    res.json({ success: true, data: vehicle });
  } catch (err) {
    next(err);
  }
}

export async function createVehicle(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = vehicleSchema.parse(req.body);
    const vehicle = await prisma.vehicle.create({ data });
    res.status(201).json({ success: true, data: vehicle });
  } catch (err) {
    next(err);
  }
}

export async function updateVehicle(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = vehicleSchema.partial().parse(req.body);
    const vehicle = await prisma.vehicle.update({
      where: { id: req.params.id },
      data,
    });
    res.json({ success: true, data: vehicle });
  } catch (err) {
    next(err);
  }
}

export async function deleteVehicle(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    await prisma.vehicle.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Vehicle deleted successfully' });
  } catch (err) {
    next(err);
  }
}

export async function getVehicleStats(_req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const [total, available, inUse, maintenance, inactive] = await Promise.all([
      prisma.vehicle.count(),
      prisma.vehicle.count({ where: { status: 'AVAILABLE' } }),
      prisma.vehicle.count({ where: { status: 'IN_USE' } }),
      prisma.vehicle.count({ where: { status: 'MAINTENANCE' } }),
      prisma.vehicle.count({ where: { status: 'INACTIVE' } }),
    ]);

    res.json({ success: true, data: { total, available, inUse, maintenance, inactive } });
  } catch (err) {
    next(err);
  }
}
