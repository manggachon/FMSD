import { Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth.middleware';
import { createError } from '../middleware/error.middleware';

const prisma = new PrismaClient();

const driverSchema = z.object({
  name: z.string().min(1),
  employeeId: z.string().min(1),
  phone: z.string().min(10),
  email: z.string().email().optional(),
  licenseNumber: z.string().min(1),
  licenseType: z.string().min(1),
  licenseExpiry: z.string().datetime(),
  address: z.string().optional(),
});

export async function getDrivers(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { status, page = '1', limit = '20' } = req.query;
    const where: Record<string, unknown> = {};
    if (status) where.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const [drivers, total] = await Promise.all([
      prisma.driver.findMany({
        where,
        skip,
        take: Number(limit),
        include: { currentVehicle: { select: { id: true, licensePlate: true, brand: true, model: true } } },
        orderBy: { name: 'asc' },
      }),
      prisma.driver.count({ where }),
    ]);

    res.json({ success: true, data: drivers, pagination: { page: Number(page), limit: Number(limit), total } });
  } catch (err) {
    next(err);
  }
}

export async function getDriver(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const driver = await prisma.driver.findUnique({
      where: { id: req.params.id },
      include: {
        currentVehicle: true,
        trips: { take: 10, orderBy: { startTime: 'desc' } },
      },
    });

    if (!driver) throw createError('Driver not found', 404);
    res.json({ success: true, data: driver });
  } catch (err) {
    next(err);
  }
}

export async function createDriver(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = driverSchema.parse(req.body);
    const driver = await prisma.driver.create({ data });
    res.status(201).json({ success: true, data: driver });
  } catch (err) {
    next(err);
  }
}

export async function updateDriver(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = driverSchema.partial().parse(req.body);
    const driver = await prisma.driver.update({
      where: { id: req.params.id },
      data,
    });
    res.json({ success: true, data: driver });
  } catch (err) {
    next(err);
  }
}

export async function deleteDriver(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    await prisma.driver.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Driver deleted successfully' });
  } catch (err) {
    next(err);
  }
}
