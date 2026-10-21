# Build from the repo root.
# APP_ENV selects which .env file is baked in at build time (NEXT_PUBLIC_*
# only — see DOCKER.md for why runtime secrets are handled separately).
#
#   cp .env.dev.example .env.dev    # fill values (nonprod Firebase project)
#   cp .env.prod.example .env.prod  # fill values (prod Firebase project)
#
#   docker build --build-arg APP_ENV=dev  -t komoiq-stores-dashboard-web:dev-<tag>  .
#   docker build --build-arg APP_ENV=prod -t komoiq-stores-dashboard-web:prod-<tag> .
#
# Every image this produces runs the compiled standalone server
# (`node server.js`) — there is no "hot reload" build. "dev" only means
# "built against the dev Firebase project", so it's safe to run on a shared
# ECS box for QA to reach over the network.
#
# ENABLE_SECURE_HEADERS must ALSO be a build arg, not a `docker run` env var:
# Next.js resolves next.config.ts's headers() (which is where this is read)
# while prerendering static pages during `next build`, so setting it later at
# `docker run` time has no effect. Leave it unset/false for a deployment
# served directly over HTTP (e.g. hitting an ECS box by IP:port) — pass
# `--build-arg ENABLE_SECURE_HEADERS=true` only once this image will sit
# behind a reverse proxy/ELB that actually terminates real TLS on a domain.
# See next.config.ts for what it toggles (HSTS + CSP upgrade-insecure-requests).
ARG APP_ENV=dev
ARG ENABLE_SECURE_HEADERS=false

FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS builder
ARG APP_ENV=dev
ARG ENABLE_SECURE_HEADERS=false
WORKDIR /app

RUN if [ "$APP_ENV" != "dev" ] && [ "$APP_ENV" != "prod" ]; then \
      echo "APP_ENV must be 'dev' or 'prod' (got: $APP_ENV)" >&2; \
      exit 1; \
    fi

ENV APP_ENV=${APP_ENV}
ENV ENABLE_SECURE_HEADERS=${ENABLE_SECURE_HEADERS}
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Required for some native npm deps (e.g. lightningcss, used by Tailwind v4)
# to resolve correctly on Alpine's musl libc.
RUN apk add --no-cache libc6-compat

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js loads .env.production during production builds — this is how the
# chosen profile's NEXT_PUBLIC_* values get inlined into the client bundle.
COPY .env.${APP_ENV} ./.env.production

RUN test -f .env.production || (echo "Missing .env.${APP_ENV} — copy from .env.${APP_ENV}.example" >&2 && exit 1)
RUN npm run build

FROM node:22-alpine AS runner
ARG APP_ENV=dev
ARG ENABLE_SECURE_HEADERS=false
WORKDIR /app

ENV APP_ENV=${APP_ENV}
ENV ENABLE_SECURE_HEADERS=${ENABLE_SECURE_HEADERS}
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup -S nodejs && adduser -S nextjs -G nodejs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Runtime-only secrets (SESSION_SECRET, AUTH_EMAIL/PASSWORD/NAME) are never
# baked in here — unlike the NEXT_PUBLIC_* profile above, pass them with
# `docker run --env-file` at deploy time (see DOCKER.md). This lets the same
# dev or prod image be redeployed with rotated secrets without a rebuild.

LABEL app.profile="${APP_ENV}" \
      org.opencontainers.image.title="komoiq-stores-dashboard" \
      org.opencontainers.image.description="Inventory Optimizer (${APP_ENV})"

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
