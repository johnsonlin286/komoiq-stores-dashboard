import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    const isDev = process.env.NODE_ENV === "development";
    // `upgrade-insecure-requests` and HSTS both assume every request already
    // arrives over TLS — they tell the browser to rewrite every same-origin
    // http:// asset request to https:// (HSTS also caches that instruction
    // for 2 years). That's correct once this sits behind a real domain +
    // reverse proxy/ELB terminating TLS, but it breaks a plain-HTTP
    // deployment (e.g. hitting an ECS box directly by IP:port) completely:
    // the browser tries to fetch CSS/JS over https on a port that only
    // speaks HTTP and every asset fails with ERR_SSL_PROTOCOL_ERROR.
    // Only turn this on once TLS is actually terminated in front of the app.
    // Note: this is read while `next build` prerenders static pages, so it's
    // effectively a build-time flag — see the ENABLE_SECURE_HEADERS build
    // arg in the Dockerfile. Setting it as a `docker run` env var instead
    // would silently have no effect on statically prerendered routes.
    const httpsTerminated = process.env.ENABLE_SECURE_HEADERS === "true";

    const contentSecurityPolicy = [
      "default-src 'self'",
      `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' blob: data:",
      "font-src 'self'",
      "connect-src 'self' https://identitytoolkit.googleapis.com https://securetoken.googleapis.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "frame-src 'none'",
      ...(httpsTerminated ? ["upgrade-insecure-requests"] : []),
    ].join("; ");

    const securityHeaders = [
      { key: "Content-Security-Policy", value: contentSecurityPolicy },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "X-Frame-Options", value: "DENY" },
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=(), payment=()",
      },
      { key: "X-DNS-Prefetch-Control", value: "off" },
      ...(httpsTerminated
        ? [
            {
              key: "Strict-Transport-Security",
              value: "max-age=63072000; includeSubDomains; preload",
            },
          ]
        : []),
    ];

    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;
