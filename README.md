# ASIOS - Fleet Management System

ระบบบริหารจัดการยานพาหนะ (Fleet Management System) สำหรับองค์กร

## ภาพรวมระบบ

ASIOS เป็นระบบบริหารจัดการยานพาหนะแบบครบวงจร ช่วยองค์กรในการติดตาม ดูแล และบริหารยานพาหนะได้อย่างมีประสิทธิภาพ

## คุณสมบัติหลัก

| โมดูล | รายละเอียด |
|-------|-----------|
| **Vehicle Management** | จัดการข้อมูลยานพาหนะ, ทะเบียน, สถานะ |
| **Driver Management** | ข้อมูลผู้ขับขี่, ใบอนุญาต, การมอบหมายงาน |
| **Trip Management** | บันทึกการเดินทาง, เส้นทาง, ระยะทาง, เชื้อเพลิง |
| **Maintenance** | ตารางซ่อมบำรุง, ประวัติการซ่อม, แจ้งเตือน |
| **GPS Tracking** | ติดตามตำแหน่งแบบ Real-time |
| **Reports & Analytics** | รายงานการใช้งาน, ต้นทุน, ประสิทธิภาพ |
| **Alerts & Notifications** | แจ้งเตือนซ่อมบำรุง, ใบขับขี่หมดอายุ |

## สถาปัตยกรรมระบบ

```
┌─────────────────────────────────────────────────────┐
│                    Client (Browser)                  │
│         React + TypeScript + Tailwind CSS            │
└──────────────────────┬──────────────────────────────┘
                       │ HTTP/WebSocket
┌──────────────────────▼──────────────────────────────┐
│                  Backend API Server                   │
│          Node.js + Express + TypeScript               │
│  ┌───────────┐ ┌──────────┐ ┌──────────────────────┐ │
│  │   REST    │ │ Socket.io │ │     JWT Auth         │ │
│  │   API     │ │ (Live)    │ │     Middleware        │ │
│  └───────────┘ └──────────┘ └──────────────────────┘ │
└──────────────────────┬──────────────────────────────┘
                       │ Prisma ORM
┌──────────────────────▼──────────────────────────────┐
│                    PostgreSQL                         │
│   Vehicles | Drivers | Trips | Maintenance | Users   │
└─────────────────────────────────────────────────────┘
```

## Tech Stack

### Backend
- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Language**: TypeScript
- **ORM**: Prisma
- **Database**: PostgreSQL 15
- **Authentication**: JWT (JSON Web Token)
- **Real-time**: Socket.io
- **Validation**: Zod

### Frontend
- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Charts**: Recharts
- **Maps**: Leaflet.js

### DevOps
- **Containerization**: Docker + Docker Compose
- **Environment**: .env files

## โครงสร้างโปรเจค

```
ASIOS/
├── client/                         # Frontend Application
│   ├── src/
│   │   ├── components/             # Reusable UI components
│   │   │   ├── common/             # Button, Input, Modal, etc.
│   │   │   ├── layout/             # Navbar, Sidebar, Footer
│   │   │   └── modules/            # Feature-specific components
│   │   ├── pages/                  # Page components
│   │   │   ├── Dashboard/
│   │   │   ├── Vehicles/
│   │   │   ├── Drivers/
│   │   │   ├── Trips/
│   │   │   ├── Maintenance/
│   │   │   ├── Tracking/
│   │   │   └── Reports/
│   │   ├── hooks/                  # Custom React hooks
│   │   ├── services/               # API service functions
│   │   ├── store/                  # Zustand state management
│   │   ├── types/                  # TypeScript interfaces
│   │   └── utils/                  # Helper functions
│   ├── public/
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── server/                         # Backend Application
│   ├── src/
│   │   ├── controllers/            # Route handlers
│   │   ├── middleware/             # Auth, validation, etc.
│   │   ├── routes/                 # Express route definitions
│   │   ├── services/               # Business logic
│   │   ├── utils/                  # Helper utilities
│   │   └── app.ts                  # Express app setup
│   ├── prisma/
│   │   ├── schema.prisma           # Database schema
│   │   └── migrations/             # Database migrations
│   ├── package.json
│   └── tsconfig.json
│
├── docker-compose.yml              # Docker services
├── docker-compose.dev.yml          # Development overrides
└── README.md
```

## การติดตั้งและรัน

### ต้องการ
- Node.js 20+
- Docker & Docker Compose
- PostgreSQL 15 (หรือใช้ Docker)

### Development Mode

```bash
# Clone repository
git clone <repo-url>
cd ASIOS

# Start database
docker-compose -f docker-compose.dev.yml up -d postgres

# Backend setup
cd server
cp .env.example .env
npm install
npx prisma migrate dev
npm run dev

# Frontend setup (terminal ใหม่)
cd ../client
npm install
npm run dev
```

### Production Mode (Docker)

```bash
docker-compose up -d
```

### Access
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **API Docs**: http://localhost:3000/api-docs

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | เข้าสู่ระบบ |
| POST | `/api/auth/logout` | ออกจากระบบ |
| GET | `/api/auth/me` | ข้อมูลผู้ใช้ปัจจุบัน |

### Vehicles
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/vehicles` | รายการยานพาหนะทั้งหมด |
| POST | `/api/vehicles` | เพิ่มยานพาหนะใหม่ |
| GET | `/api/vehicles/:id` | ข้อมูลยานพาหนะ |
| PUT | `/api/vehicles/:id` | แก้ไขข้อมูลยานพาหนะ |
| DELETE | `/api/vehicles/:id` | ลบยานพาหนะ |

### Drivers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/drivers` | รายการผู้ขับขี่ทั้งหมด |
| POST | `/api/drivers` | เพิ่มผู้ขับขี่ใหม่ |
| GET | `/api/drivers/:id` | ข้อมูลผู้ขับขี่ |
| PUT | `/api/drivers/:id` | แก้ไขข้อมูลผู้ขับขี่ |

### Trips
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/trips` | รายการการเดินทาง |
| POST | `/api/trips` | สร้างการเดินทางใหม่ |
| PUT | `/api/trips/:id/end` | จบการเดินทาง |

### Maintenance
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/maintenance` | รายการซ่อมบำรุง |
| POST | `/api/maintenance` | สร้างรายการซ่อมบำรุง |
| PUT | `/api/maintenance/:id` | อัปเดตสถานะ |

## License
MIT
