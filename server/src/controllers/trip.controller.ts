import { Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth.middleware';
import { createError } from '../middleware/error.middleware';

const prisma = new PrismaClient();

const createTripSchema = z.object({
  vehicleId: z.string(),
  driverId: z.string(),
  origin: z.string().min(1),
  destination: z.string().min(1),
  purpose: z.string().optional(),
  scheduledStart: z.string().datetime(),
});

const endTripSchema = z.object({
  endMileage: z.number().min(0),
  fuelUsed: z.number().min(0).optional(),
  notes: z.string().optional(),
});

export async function getTrips(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { vehicleId, driverId, status, page = '1', limit = '20' } = req.query;
    const where: Record<string, unknown> = {};
    if (vehicleId) where.vehicleId = vehicleId;
    if (driverId) where.driverId = driverId;
    if (status) where.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const [trips, total] = await Promise.all([
      prisma.trip.findMany({
        where,
        skip,
        take: Number(limit),
        include: {
          vehicle: { select: { id: true, licensePlate: true, brand: true, model: true } },
          driver: { select: { id: true, name: true, employeeId: true } },
        },
        orderBy: { startTime: 'desc' },
      }),
      prisma.trip.count({ where }),
    ]);

    res.json({ success: true, data: trips, pagination: { page: Number(page), limit: Number(limit), total } });
  } catch (err) {
    next(err);
  }
}

export async function getTrip(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const trip = await prisma.trip.findUnique({
      where: { id: req.params.id },
      include: { vehicle: true, driver: true },
    });
    if (!trip) throw createError('Trip not found', 404);
    res.json({ success: true, data: trip });
  } catch (err) {
    next(err);
  }
}

export async function createTrip(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = createTripSchema.parse(req.body);

    // Check if vehicle is available
    const vehicle = await prisma.vehicle.findUnique({ where: { id: data.vehicleId } });
    if (!vehicle || vehicle.status !== 'AVAILABLE') {
      throw createError('Vehicle is not available', 400);
    }

    const trip = await prisma.trip.create({
      data: {
        ...data,
        status: 'SCHEDULED',
        startMileage: vehicle.mileage,
      },
    });

    res.status(201).json({ success: true, data: trip });
  } catch (err) {
    next(err);
  }
}

export async function startTrip(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const trip = await prisma.trip.findUnique({ where: { id: req.params.id } });
    if (!trip) throw createError('Trip not found', 404);
    if (trip.status !== 'SCHEDULED') throw createError('Trip cannot be started', 400);

    const [updatedTrip] = await Promise.all([
      prisma.trip.update({
        where: { id: req.params.id },
        data: { status: 'IN_PROGRESS', startTime: new Date() },
      }),
      prisma.vehicle.update({
        where: { id: trip.vehicleId },
        data: { status: 'IN_USE', currentDriverId: trip.driverId },
      }),
    ]);

    res.json({ success: true, data: updatedTrip });
  } catch (err) {
    next(err);
  }
}

export async function endTrip(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { endMileage, fuelUsed, notes } = endTripSchema.parse(req.body);
    const trip = await prisma.trip.findUnique({ where: { id: req.params.id } });
    if (!trip) throw createError('Trip not found', 404);
    if (trip.status !== 'IN_PROGRESS') throw createError('Trip is not in progress', 400);

    const distance = trip.startMileage ? endMileage - trip.startMileage : 0;

    const [updatedTrip] = await Promise.all([
      prisma.trip.update({
        where: { id: req.params.id },
        data: { status: 'COMPLETED', endTime: new Date(), endMileage, distance, fuelUsed, notes },
      }),
      prisma.vehicle.update({
        where: { id: trip.vehicleId },
        data: { status: 'AVAILABLE', mileage: endMileage, currentDriverId: null },
      }),
    ]);

    res.json({ success: true, data: updatedTrip });
  } catch (err) {
    next(err);
  }
}
