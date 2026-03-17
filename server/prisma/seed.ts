import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@asios.com' },
    update: {},
    create: {
      email: 'admin@asios.com',
      password: adminPassword,
      name: 'System Admin',
      role: 'ADMIN',
    },
  });
  console.log(`✅ Admin user created: ${admin.email}`);

  // Create manager user
  const managerPassword = await bcrypt.hash('manager123', 10);
  const manager = await prisma.user.upsert({
    where: { email: 'manager@asios.com' },
    update: {},
    create: {
      email: 'manager@asios.com',
      password: managerPassword,
      name: 'Fleet Manager',
      role: 'MANAGER',
    },
  });
  console.log(`✅ Manager user created: ${manager.email}`);

  // Create sample vehicles
  const vehicles = await Promise.all([
    prisma.vehicle.upsert({
      where: { licensePlate: 'กข 1234' },
      update: {},
      create: {
        licensePlate: 'กข 1234',
        brand: 'Toyota',
        model: 'Fortuner',
        year: 2023,
        color: 'White',
        vehicleType: 'CAR',
        fuelType: 'DIESEL',
        mileage: 15000,
        status: 'AVAILABLE',
      },
    }),
    prisma.vehicle.upsert({
      where: { licensePlate: 'กค 5678' },
      update: {},
      create: {
        licensePlate: 'กค 5678',
        brand: 'Isuzu',
        model: 'D-Max',
        year: 2022,
        color: 'Silver',
        vehicleType: 'TRUCK',
        fuelType: 'DIESEL',
        mileage: 32000,
        status: 'AVAILABLE',
      },
    }),
    prisma.vehicle.upsert({
      where: { licensePlate: 'กง 9012' },
      update: {},
      create: {
        licensePlate: 'กง 9012',
        brand: 'Honda',
        model: 'Civic',
        year: 2024,
        color: 'Black',
        vehicleType: 'CAR',
        fuelType: 'GASOLINE',
        mileage: 5000,
        status: 'AVAILABLE',
      },
    }),
  ]);
  console.log(`✅ ${vehicles.length} vehicles created`);

  // Create sample drivers
  const drivers = await Promise.all([
    prisma.driver.upsert({
      where: { employeeId: 'DRV001' },
      update: {},
      create: {
        employeeId: 'DRV001',
        name: 'สมชาย ใจดี',
        phone: '0812345678',
        email: 'somchai@asios.com',
        licenseNumber: 'DL123456789',
        licenseType: '2',
        licenseExpiry: new Date('2026-12-31'),
        status: 'ACTIVE',
      },
    }),
    prisma.driver.upsert({
      where: { employeeId: 'DRV002' },
      update: {},
      create: {
        employeeId: 'DRV002',
        name: 'สมหญิง รักงาน',
        phone: '0898765432',
        email: 'somying@asios.com',
        licenseNumber: 'DL987654321',
        licenseType: '1',
        licenseExpiry: new Date('2025-06-30'),
        status: 'ACTIVE',
      },
    }),
  ]);
  console.log(`✅ ${drivers.length} drivers created`);

  console.log('✅ Database seeding completed!');
  console.log('\n📋 Default credentials:');
  console.log('  Admin: admin@asios.com / admin123');
  console.log('  Manager: manager@asios.com / manager123');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
