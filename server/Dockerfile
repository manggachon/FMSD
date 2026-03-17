FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

# ── Runner ─────────────────────────────────────────────────────────────────
FROM node:20-alpine AS runner

# Install OpenSSL + dumb-init for Alpine (required by Prisma engine)
RUN apk add --no-cache openssl dumb-init

WORKDIR /app

# Install prod dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy build artifacts + prisma
COPY --from=builder /app/dist          ./dist
COPY --from=builder /app/prisma        ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 3001
CMD ["dumb-init", "sh", "-c", "npx prisma migrate deploy && node dist/app.js"]
