/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  output: process.env.BUILD_STANDALONE === "1" ? "standalone" : undefined,
  eslint: { ignoreDuringBuilds: true },
  experimental: {
    serverComponentsExternalPackages: ["sharp", "mongoose", "bcryptjs", "nodemailer", "exceljs"],
  },
  async headers() {
    // Next.js needs inline scripts/styles; everything else is locked to our own origin + Cloudinary + Google Fonts.
    const dev = process.env.NODE_ENV !== "production";
    const csp = [
      "default-src 'self'",
      `script-src 'self' 'unsafe-inline'${dev ? " 'unsafe-eval'" : ""}`,
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: blob: https://res.cloudinary.com",
      "media-src 'self'",
      `connect-src 'self'${dev ? " ws: wss:" : ""}`,
      "frame-ancestors 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; ");
    const security = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "SAMEORIGIN" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
      { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
      { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
      { key: "X-DNS-Prefetch-Control", value: "on" },
      { key: "Content-Security-Policy", value: csp },
    ];
    return [
      { source: "/:path*", headers: security },
      { source: "/admin/:path*", headers: [{ key: "Cache-Control", value: "no-store" }, { key: "X-Robots-Tag", value: "noindex" }] },
      // Private/dynamic endpoints are never cached. (The public read-only ones set their own cache headers.)
      ...["/api/admin/:path*", "/api/otp/:path*", "/api/enquiry", "/api/track/:path*", "/api/health"].map((source) => ({
        source,
        headers: [{ key: "Cache-Control", value: "no-store" }],
      })),
    ];
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com" }],
  },
};

export default nextConfig;
