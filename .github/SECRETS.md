# GitHub Secrets Required for FMSD CI/CD

## Settings → Secrets and variables → Actions → New repository secret

| Secret Name               | Value                                     | ใช้ใน |
|---------------------------|-------------------------------------------|--------|
| `VPS_HOST`                | `192.168.1.149`                           | CD deploy |
| `VPS_USER`                | Windows username                          | CD deploy |
| `VPS_PASSWORD`            | Windows/SSH password                      | CD deploy |
| `JWT_SECRET`              | random string 64+ ตัวอักษร               | server env |
| `ADMIN_PASSWORD`          | รหัสผ่าน admin                            | server env |
| `POSTGRES_PASSWORD`       | รหัสผ่าน PostgreSQL                       | server + postgres |
| `DEPLOY_NOTIFY_BOT_TOKEN` | Telegram bot token (แจ้งเตือน deploy)    | cd.yml |
| `DEPLOY_NOTIFY_CHAT_ID`   | Telegram chat ID                          | cd.yml |

## Variables

| Variable Name  | Value                                                        |
|----------------|--------------------------------------------------------------|
| `CORS_ORIGIN`  | `http://192.168.1.149:5174,http://localhost:5174`            |

---

## Production Server Setup (ทำครั้งเดียวบนเครื่อง 192.168.1.149)

```powershell
# PowerShell as Administrator

# 1. OpenSSH Server
Add-WindowsCapability -Online -Name OpenSSH.Server~~~~0.0.1.0
Start-Service sshd
Set-Service -Name sshd -StartupType Automatic
New-NetFirewallRule -Name "FMSD-SSH" -DisplayName "FMSD - SSH" `
  -Enabled True -Direction Inbound -Protocol TCP -Action Allow -LocalPort 22

# 2. Firewall
New-NetFirewallRule -Name "FMSD-Dashboard" -DisplayName "FMSD - Dashboard 5174" `
  -Enabled True -Direction Inbound -Protocol TCP -Action Allow -LocalPort 5174
New-NetFirewallRule -Name "FMSD-API" -DisplayName "FMSD - API 3001" `
  -Enabled True -Direction Inbound -Protocol TCP -Action Allow -LocalPort 3001

# 3. Folders
New-Item -ItemType Directory -Force -Path "C:\opt\fmsd\postgresql"
New-Item -ItemType Directory -Force -Path "C:\opt\fmsd\backup"

# 4. GHCR Login
docker login ghcr.io -u manggachon -p <GitHub PAT (read:packages)>
```

## เข้าถึงระบบ

| Service   | URL                              |
|-----------|----------------------------------|
| Dashboard | http://192.168.1.149:5174        |
| API       | http://192.168.1.149:3001        |
| Health    | http://192.168.1.149:3001/health |
