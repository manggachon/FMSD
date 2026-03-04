import { Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

export async function getFleetSummary(_req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const [vehicles, drivers, activeTrips, pendingMaintenance] = await Promise.all([
      prisma.vehicle.groupBy({ by: ['status'], _count: { id: true } }),
      prisma.driver.groupBy({ by: ['status'], _count: { id: true } }),
      prisma.trip.count({ where: { status: 'IN_PROGRESS' } }),
      prisma.maintenanceRecord.count({ where: { status: 'SCHEDULED' } }),
    ]);

    res.json({
      success: true,
      data: { vehicles, drivers, activeTrips, pendingMaintenance },
    });
  } catch (err) {
    next(err);
  }
}

export async function getVehicleUtilization(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { startDate, endDate } = req.query;
    const where: Record<string, unknown> = { status: 'COMPLETED' };
    if (startDate || endDate) {
      where.startTime = {};
      if (startDate) (where.startTime as Record<string, unknown>).gte = new Date(startDate as string);
      if (endDate) (where.startTime as Record<string, unknown>).lte = new Date(endDate as string);
    }

    const trips = await prisma.trip.groupBy({
      by: ['vehicleId'],
      _count: { id: true },
      _sum: { distance: true, fuelUsed: true },
      where,
    });

    res.json({ success: true, data: trips });
  } catch (err) {
    next(err);
  }
}

export async function getFuelReport(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { startDate, endDate, vehicleId } = req.query;
    const where: Record<string, unknown> = { status: 'COMPLETED' };
    if (vehicleId) where.vehicleId = vehicleId;
    if (startDate || endDate) {
      where.endTime = {};
      if (startDate) (where.endTime as Record<string, unknown>).gte = new Date(startDate as string);
      if (endDate) (where.endTime as Record<string, unknown>).lte = new Date(endDate as string);
    }

    const fuelData = await prisma.trip.aggregate({
      _sum: { fuelUsed: true, distance: true },
      _avg: { fuelUsed: true },
      _count: { id: true },
      where,
    });

    res.json({ success: true, data: fuelData });
  } catch (err) {
    next(err);
  }
}

export async function getMaintenanceCostReport(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { startDate, endDate } = req.query;
    const where: Record<string, unknown> = { status: 'COMPLETED' };
    if (startDate || endDate) {
      where.completedDate = {};
      if (startDate) (where.completedDate as Record<string, unknown>).gte = new Date(startDate as string);
      if (endDate) (where.completedDate as Record<string, unknown>).lte = new Date(endDate as string);
    }

    const costData = await prisma.maintenanceRecord.aggregate({
      _sum: { actualCost: true, estimatedCost: true },
      _avg: { actualCost: true },
      _count: { id: true },
      where,
    });

    const byType = await prisma.maintenanceRecord.groupBy({
      by: ['type'],
      _sum: { actualCost: true },
      _count: { id: true },
      where,
    });

    res.json({ success: true, data: { summary: costData, byType } });
  } catch (err) {
    next(err);
  }
}
