# Multi-stage build for Next.js admin-dashboard
FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /usr/src/app

FROM base AS builder
COPY . .
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm --filter admin-dashboard build
RUN pnpm prune --prod

FROM base AS runner
ENV NODE_ENV=production
COPY --from=builder /usr/src/app /usr/src/app
EXPOSE 3002
CMD ["pnpm", "--filter", "admin-dashboard", "start", "--", "-p", "3002"]
