FROM oven/bun:1.2 AS base
WORKDIR /app

FROM base AS deps
COPY package.json bun.lock ./
COPY apps/server/package.json ./apps/server/package.json
COPY packages/types/package.json ./packages/types/package.json
COPY packages/typescript-config/package.json ./packages/typescript-config/package.json
COPY packages/eslint-config/package.json ./packages/eslint-config/package.json
COPY packages/api-client/package.json ./packages/api-client/package.json
COPY packages/i18n/package.json ./packages/i18n/package.json
COPY packages/ui/package.json ./packages/ui/package.json
RUN bun install

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/server/node_modules ./apps/server/node_modules
COPY --from=deps /app/packages/*/node_modules ./packages/*/node_modules
COPY . .
RUN cd apps/server && bunx prisma generate
RUN cd apps/server && bun build src/index.ts --outdir dist --target bun

FROM oven/bun:1.2-slim AS runner
WORKDIR /app
COPY --from=builder /app/package.json /app/bun.lock ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/server ./apps/server

WORKDIR /app/apps/server
ENV NODE_ENV=production
EXPOSE 3001
CMD ["bun", "run", "dist/index.js"]
