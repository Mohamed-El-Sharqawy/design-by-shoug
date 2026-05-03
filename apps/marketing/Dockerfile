FROM oven/bun:1.2 AS base
WORKDIR /app

FROM base AS deps
COPY package.json bun.lock ./
COPY apps/marketing/package.json ./apps/marketing/package.json
COPY packages/types/package.json ./packages/types/package.json
COPY packages/typescript-config/package.json ./packages/typescript-config/package.json
COPY packages/eslint-config/package.json ./packages/eslint-config/package.json
COPY packages/api-client/package.json ./packages/api-client/package.json
COPY packages/i18n/package.json ./packages/i18n/package.json
COPY packages/ui/package.json ./packages/ui/package.json
RUN bun install

FROM base AS builder
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/marketing/node_modules ./apps/marketing/node_modules
COPY --from=deps /app/packages/*/node_modules ./packages/*/node_modules
COPY . .
RUN cd apps/marketing && bun run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/marketing/public ./apps/marketing/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/marketing/.next/standalone ./
COPY --from=builder /app/apps/marketing/.next/static ./apps/marketing/.next/static

USER nextjs
EXPOSE 4001
ENV PORT=4001
CMD ["node", "apps/marketing/server.js"]
