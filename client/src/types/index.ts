// ===========================
// AUTH
// ===========================
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'MANAGER' | 'DRIVER' | 'MECHANIC' | 'VIEWER';
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

// ===========================
// VEHICLE
// ===========================
export type VehicleStatus = 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE' | 'INACTIVE';
export type VehicleType = 'CAR' | 'VAN' | 'TRUCK' | 'MOTORCYCLE' | 'BUS';
export type FuelType = 'GASOLINE' | 'DIESEL' | 'ELECTRIC' | 'HYBRID';

export interface Vehicle {
  id: string;
  licensePlate: string;
  brand: string;
  model: string;
  year: number;
  color?: string;
  vehicleType: VehicleType;
  fuelType: FuelType;
  mileage: number;
  status: VehicleStatus;
  insuranceExpiry?: string;
  taxExpiry?: string;
  imageUrl?: string;
  notes?: string;
  currentDriver?: Pick<Driver, 'id' | 'name'> | null;
  createdAt: string;
  updatedAt: string;
}

export interface VehicleStats {
  total: number;
  available: number;
  inUse: number;
  maintenance: number;
  inactive: number;
}

// ===========================
// DRIVER
// ===========================
export type DriverStatus = 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE' | 'SUSPENDED';

export interface Driver {
  id: string;
  employeeId: string;
  name: string;
  phone: string;
  email?: string;
  licenseNumber: string;
  licenseType: string;
  licenseExpiry: string;
  address?: string;
  status: DriverStatus;
  imageUrl?: string;
  currentVehicle?: Pick<Vehicle, 'id' | 'licensePlate' | 'brand' | 'model'> | null;
  createdAt: string;
  updatedAt: string;
}

// ===========================
// TRIP
// ===========================
export type TripStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface Trip {
  id: string;
  origin: string;
  destination: string;
  purpose?: string;
  status: TripStatus;
  scheduledStart: string;
  startTime?: string;
  endTime?: string;
  startMileage?: number;
  endMileage?: number;
  distance?: number;
  fuelUsed?: number;
  notes?: string;
  vehicle: Pick<Vehicle, 'id' | 'licensePlate' | 'brand' | 'model'>;
  driver: Pick<Driver, 'id' | 'name' | 'employeeId'>;
  createdAt: string;
  updatedAt: string;
}

// ===========================
// MAINTENANCE
// ===========================
export type MaintenanceType = 'ROUTINE' | 'REPAIR' | 'INSPECTION' | 'EMERGENCY';
export type MaintenanceStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface MaintenanceRecord {
  id: string;
  type: MaintenanceType;
  description: string;
  status: MaintenanceStatus;
  scheduledDate: string;
  completedDate?: string;
  estimatedCost?: number;
  actualCost?: number;
  serviceProvider?: string;
  notes?: string;
  vehicle: Pick<Vehicle, 'id' | 'licensePlate' | 'brand' | 'model'>;
  createdAt: string;
  updatedAt: string;
}

// ===========================
// API RESPONSE
// ===========================
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}
