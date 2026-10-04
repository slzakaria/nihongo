# syntax=docker/dockerfile:1

FROM node:24-alpine AS base
RUN corepack enable

# --- deps: install dependencies only (cached unless lockfile changes) ---
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# --- builder: build the app ---
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Build-time env vars that must be baked in go here, e.g.:
# ARG CLAUDE_API_KEY
RUN pnpm build

# --- runner: minimal production image ---
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Runtime secrets (CLAUDE_API_KEY, ELEVENLABS_API_KEY, ELEVENLABS_VOICE_ID) must be
# passed via `docker run -e` / `--env-file`, never baked into the image.
CMD ["node", "server.js"]
