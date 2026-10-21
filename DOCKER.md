# Docker

How this app is containerized, and how to build, push to Huawei SWR, and run
it on Huawei ECS — one image for the **dev** environment (nonprod Firebase,
reachable by QA on a shared ECS box) and one for **prod**.

This mirrors the same pattern already used in `komoiq-client/frontend`: a
single Dockerfile, no separate "hot reload" build. **"Dev" here means "built
against the dev/nonprod Firebase project", not "runs `next dev`."** Every
image — dev or prod — runs the compiled standalone server (`node server.js`),
so it behaves identically to production and is safe to leave up on a shared
box for QA to hit over the network.

> If you previously had `docker-compose.dev.yml` / `docker-compose.prod.yml`
> from an earlier version of this setup: those are gone. That setup ran
> `next dev` for the "dev" image, which is why QA saw `_next/hmr` WebSocket
> errors when it was deployed to ECS — `next dev`'s hot-reload client doesn't
> work across a network like that, and was never meant to be deployed at all.
> The structural fix is that no build target runs `next dev` anymore.

## The two kinds of env vars (read this first)

Next.js inlines `NEXT_PUBLIC_*` vars into the client JS bundle **at build
time**. Every other var (`SESSION_SECRET`, `AUTH_EMAIL`, `AUTH_PASSWORD`,
`AUTH_NAME`) is read from `process.env` **at runtime** (in Server
Actions/middleware), so it must never be baked into the image.

- `NEXT_PUBLIC_FIREBASE_*` → live in **`.env.dev`** / **`.env.prod`**, and get
  baked in via the `APP_ENV` build arg (`.env.dev` → `dev` images, `.env.prod`
  → `prod` images). This is *only* client-safe values — see `.env.dev.example`
  / `.env.prod.example`.
- `SESSION_SECRET`, `AUTH_EMAIL`, `AUTH_PASSWORD`, `AUTH_NAME` → passed at
  **`docker run`** time with `--env-file`, never put in `.env.dev`/`.env.prod`.
  This lets you rotate `SESSION_SECRET` or disable the demo super-admin login
  (leave `AUTH_*` empty) by restarting the container — no rebuild needed.

## Building the images

```bash
cp .env.dev.example .env.dev    # fill in (nonprod Firebase project)
cp .env.prod.example .env.prod  # fill in (prod Firebase project, once it exists)

docker build --build-arg APP_ENV=dev  -t komoiq-stores-dashboard-web:dev-0.1.0  .
docker build --build-arg APP_ENV=prod -t komoiq-stores-dashboard-web:prod-0.1.0 .
```

Tag with a real version per release (`dev-0.1.0`, `prod-0.1.0`, a git short
SHA, etc.) rather than only `:latest`, so you can roll back on ECS by tag.

### HTTPS-only security headers (HSTS, `upgrade-insecure-requests`)

By default the image does **not** send `Strict-Transport-Security` or the
`upgrade-insecure-requests` CSP directive, because those tell the browser
"always use HTTPS for this host" — correct once this sits behind a reverse
proxy/ELB that terminates real TLS on a domain, but fatal if you hit the
container directly over plain HTTP (e.g. `http://<ecs-ip>:3600`): the browser
tries to fetch every CSS/JS asset over `https://` on a port that only speaks
HTTP, and the page loads unstyled with `ERR_SSL_PROTOCOL_ERROR` in the
console. This is exactly what happened the first time this was deployed to
the dev ECS box.

Once a deployment is genuinely behind TLS, rebuild with:

```bash
docker build --build-arg APP_ENV=prod --build-arg ENABLE_SECURE_HEADERS=true \
  -t komoiq-stores-dashboard-web:prod-0.1.0 .
```

This **must** be a build arg, not a `docker run` env var — Next.js resolves
`next.config.ts`'s `headers()` while prerendering static pages during
`next build`, so setting it later has no effect on those routes.

`.env.dev` / `.env.prod` are gitignored (same as `.env.local`) — only the
`.example` files are committed. `.dockerignore` explicitly un-ignores
`.env.dev` and `.env.prod` so Docker's build context can see them (they're
still excluded from git).

## Pushing to Huawei SWR

Replace `<region>` and `<organization>` below. `<region>` is your SWR region
endpoint (e.g. `ap-southeast-3`); `<organization>` is the SWR organization —
e.g. `komoverse`, matching the image path you've already been using
(`swr.ap-southeast-3.myhuaweicloud.com/komoverse/komoiq-stores-dashboard-web`).

```bash
docker tag komoiq-stores-dashboard-web:dev-0.1.0 \
  swr.<region>.myhuaweicloud.com/<organization>/komoiq-stores-dashboard-web:dev-0.1.0
docker tag komoiq-stores-dashboard-web:prod-0.1.0 \
  swr.<region>.myhuaweicloud.com/<organization>/komoiq-stores-dashboard-web:prod-0.1.0
```

Log in (SWR console → your organization → **"Generate Login Command"** gives
a one-line `docker login` with a temporary token, valid 24h):

```bash
docker login -u <region>@<temporary-access-key> -p <temporary-token> swr.<region>.myhuaweicloud.com
```

Push:

```bash
docker push swr.<region>.myhuaweicloud.com/<organization>/komoiq-stores-dashboard-web:dev-0.1.0
docker push swr.<region>.myhuaweicloud.com/<organization>/komoiq-stores-dashboard-web:prod-0.1.0
```

## Pulling and running on Huawei ECS

Same idea for both environments — they can run as two containers on the same
ECS instance (different host ports) or on separate instances; pick whichever
matches how QA/users actually reach it.

1. Log in to SWR from the ECS instance (same `docker login` as above).

2. Pull the tag you want:

   ```bash
   docker pull swr.<region>.myhuaweicloud.com/<organization>/komoiq-stores-dashboard-web:dev-0.1.0
   ```

3. Create the **runtime** env file — just the server secrets, never the
   `NEXT_PUBLIC_*` ones (those are already baked in):

   ```bash
   cat > /etc/komoiq/dev.env <<'EOF'
   SESSION_SECRET=replace-with-at-least-32-random-characters
   AUTH_EMAIL=
   AUTH_PASSWORD=
   AUTH_NAME=
   EOF
   ```

   Leave `AUTH_EMAIL`/`AUTH_PASSWORD`/`AUTH_NAME` empty to disable the demo
   super-admin login in that environment. Use a **different** `SESSION_SECRET`
   per environment (dev vs. prod) — they're independent deployments.

4. Run it:

   ```bash
   docker run -d \
     --name komoiq-stores-dashboard-dev \
     --restart unless-stopped \
     -p 3600:3000 \
     --env-file /etc/komoiq/dev.env \
     swr.<region>.myhuaweicloud.com/<organization>/komoiq-stores-dashboard-web:dev-0.1.0
   ```

   Repeat for prod with its own container name, port, env file, and image tag
   (e.g. `--name komoiq-stores-dashboard-prod`, `-p 3000:3000`,
   `/etc/komoiq/prod.env`, `:prod-0.1.0`).

   Put a reverse proxy (nginx or Huawei ELB) in front for TLS/domains — the
   container itself only serves plain HTTP on port 3000 internally.

5. **Releasing a new version:** pull the new tag, then swap the container:

   ```bash
   docker pull swr.<region>.myhuaweicloud.com/<organization>/komoiq-stores-dashboard-web:dev-0.2.0
   docker stop komoiq-stores-dashboard-dev && docker rm komoiq-stores-dashboard-dev
   docker run -d \
     --name komoiq-stores-dashboard-dev \
     --restart unless-stopped \
     -p 3600:3000 \
     --env-file /etc/komoiq/dev.env \
     swr.<region>.myhuaweicloud.com/<organization>/komoiq-stores-dashboard-web:dev-0.2.0
   ```

### Checking it's up

```bash
docker logs -f komoiq-stores-dashboard-dev
curl -I http://localhost:3600
docker inspect --format='{{json .Config.Labels}}' komoiq-stores-dashboard-dev
# {"app.profile":"dev", ...} — confirms which profile this container was built with
```

## Troubleshooting: page loads unstyled, console shows `ERR_SSL_PROTOCOL_ERROR`

**Symptom:** the page opens but has no CSS, and the browser console shows
something like `Failed to load resource: net::ERR_SSL_PROTOCOL_ERROR` and/or
`Unsafe attempt to load URL https://<host>/... from frame with URL
http://<host>/...`.

This means the image was built with `ENABLE_SECURE_HEADERS=true` (or an
older image predating the default-off fix) while actually being served over
plain HTTP — see [HTTPS-only security headers](#https-only-security-headers-hsts-upgrade-insecure-requests)
above. Fix: rebuild **without** that build arg (it defaults to off), push,
and redeploy:

```bash
docker build --build-arg APP_ENV=dev \
  -t swr.<region>.myhuaweicloud.com/<organization>/komoiq-stores-dashboard-web:dev-0.1.1 .

# verify before pushing — this must print nothing:
docker inspect --format='{{json .Config.Cmd}}' swr.<region>.myhuaweicloud.com/<organization>/komoiq-stores-dashboard-web:dev-0.1.1
docker run --rm -p 3600:3000 --env-file /etc/komoiq/dev.env -d --name verify-headers \
  swr.<region>.myhuaweicloud.com/<organization>/komoiq-stores-dashboard-web:dev-0.1.1
curl -sI http://localhost:3600/ | grep -Ei "strict-transport|upgrade-insecure"
docker rm -f verify-headers
```

If `Strict-Transport-Security` had already reached a real browser once
(not just `curl`), that browser may have cached the HSTS policy for that
exact host for up to 2 years and keep refusing plain HTTP to it even after
you fix and redeploy. Verify the fix with `curl` (shown above) or a fresh
browser profile first; if a specific browser is still stuck, clear its HSTS
entry for that host (Chrome: `chrome://net-internals/#hsts` → delete under
"Delete domain security policies") or just use a different browser/profile.

## Troubleshooting: login always bounces back to the login page, no error

**Symptom:** submitting the login form (Firebase account or the
`AUTH_EMAIL`/`AUTH_PASSWORD` demo account) appears to succeed for a moment,
then you land back on `/` with no error message anywhere.

Same root cause as above: the session cookie is set with the `Secure`
attribute whenever `ENABLE_SECURE_HEADERS` isn't `true`... except it used to
be tied to `NODE_ENV === "production"` instead, which is **always** true in
this image regardless of TLS. A `Secure` cookie is silently dropped by the
browser over plain HTTP — no error anywhere, the `Set-Cookie` header is just
ignored — so the login server action "succeeds" and redirects, but the next
request has no session cookie and the middleware bounces it back to `/`.

This is fixed as of the version that introduced `ENABLE_SECURE_HEADERS` (see
`src/server/session.ts`). Unlike the HSTS/CSP headers, this one **is** read
at request time, not baked at build — so if you're still seeing this on an
image built before the fix, pulling a rebuilt image (same command as the
troubleshooting section above) and redeploying is enough; no new build arg
juggling needed for this specific part.

## Notes

- The image runs as a non-root user (`nextjs`) — standard Docker hardening
  practice.
- `output: "standalone"` (in `next.config.ts`) is what makes the image small:
  it copies only the traced runtime dependencies into `.next/standalone`,
  not the full `node_modules` tree.
- Tailwind v4's `lightningcss` ships prebuilt native binaries. The lockfile
  already includes the `linux-x64-musl` build, so `npm ci` resolves correctly
  on Alpine without extra setup.
- `.env.dev` / `.env.prod` are copied into the image as `.env.production`
  during the build — this is how Next.js's production build picks up the
  chosen profile's `NEXT_PUBLIC_*` values. Never put `SESSION_SECRET` or
  `AUTH_*` in those files.

## Local development without Docker

Docker here is for deploying to ECS, not for day-to-day coding — use
`npm run dev` locally (see the main `README.md`). `cp .env.example .env.local`
still works as before and is unrelated to `.env.dev` / `.env.prod`.
