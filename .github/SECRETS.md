# GitHub Secrets Required for FMSD CI/CD

## Settings → Secrets and variables → Actions → New repository secret

| Secret Name               | Value                                     | ใช้ใน |
|---------------------------|-------------------------------------------|--------|
| `VPS_HOST`                | `187.77.136.29`                           | CD deploy |
| `VPS_USER`                | Linux username (เช่น `root` หรือ `ubuntu`) | CD deploy |
| `VPS_PASSWORD`            | SSH password                              | CD deploy |
| `JWT_SECRET`              | random string 64+ ตัวอักษร               | server env |
| `ADMIN_PASSWORD`          | รหัสผ่าน admin dashboard                  | server env |
| `POSTGRES_PASSWORD`       | รหัสผ่าน PostgreSQL                       | server + postgres |
| `DEPLOY_NOTIFY_BOT_TOKEN` | Telegram bot token (แจ้งเตือน deploy)    | cd.yml |
| `DEPLOY_NOTIFY_CHAT_ID`   | Telegram chat ID                          | cd.yml |

## Variables

| Variable Name  | Value                                                        |
|----------------|--------------------------------------------------------------|
| `CORS_ORIGIN`  | `http://187.77.136.29:5174,http://localhost:5174`            |

> **สร้าง JWT_SECRET แบบ random:**
> ```bash
> openssl rand -base64 48
> ```

---

## Production VPS Setup (ทำครั้งเดียวบน 187.77.136.29)

```bash
# SSH เข้า VPS
ssh root@187.77.136.29

# 1. Install Docker
curl -fsSL https://get.docker.com | sh
systemctl enable docker && systemctl start docker

# 2. Install Docker Compose plugin
apt-get install -y docker-compose-plugin

# 3. Create deploy directory
mkdir -p /opt/fmsd
cd /opt/fmsd

# 4. Login to GHCR
docker login ghcr.io -u manggachon -p <GitHub PAT (read:packages)>

# 5. First deploy (หลัง set GitHub Secrets แล้ว)
# จะถูก run อัตโนมัติผ่าน cd.yml เมื่อ push to main
```

## เข้าถึงระบบ

| Service   | URL                             |
|-----------|---------------------------------|
| Dashboard | http://187.77.136.29:5174       |
| API       | http://187.77.136.29:3001       |
| Health    | http://187.77.136.29:3001/health |
