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

FROM node:22-alpine AS builder
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_FB_PIXEL_ID
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_FB_PIXEL_ID=$NEXT_PUBLIC_FB_PIXEL_ID
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN cd apps/marketing && npx next build

FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV HOSTNAME="0.0.0.0"
ENV PORT=4001

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/marketing/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/apps/marketing/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/marketing/.next/static ./.next/static

USER nextjs
EXPOSE 4001

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:4001/ || exit 1

CMD ["node", "apps/marketing/server.js"]
