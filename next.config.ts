import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

// Security headers for every response (formerly in vercel.json — the app is
// self-hosted now, so Next.js itself must apply them; Caddy only proxies).
const SECURITY_HEADERS = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
];

// Legacy /pages/* URL shapes from the pre-App-Router site (formerly vercel.json).
const LEGACY_REDIRECTS = [
  { source: "/pages/finanzen", destination: "/finanzen" },
  { source: "/pages/kennzahlen", destination: "/wirkung" },
  { source: "/kennzahlen", destination: "/wirkung" },
  { source: "/pages/wirkung", destination: "/wirkung" },
  { source: "/pages/methodik", destination: "/methodik" },
  { source: "/pages/transparenz", destination: "/methodik" },
  { source: "/transparenz", destination: "/methodik" },
  { source: "/pages/preismodell", destination: "/preismodell" },
  { source: "/pages/strategie", destination: "/strategie" },
  { source: "/pages/team", destination: "/team" },
  { source: "/pages/operations", destination: "/operations" },
  { source: "/pages/dokumente", destination: "/dokumente" },
  { source: "/pages/fundraising", destination: "/fundraising" },
  { source: "/pages/fundraising/stiftungen", destination: "/fundraising/stiftungen" },
  { source: "/pages/fundraising/stiftungen/:slug", destination: "/fundraising/stiftungen/:slug" },
  { source: "/en/platform", destination: "/plattform" },
].map((r) => ({ ...r, permanent: true }));

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["pg"],
  turbopack: {
    root: __dirname,
  },
  async headers() {
    return [{ source: "/(.*)", headers: SECURITY_HEADERS }];
  },
  async redirects() {
    return LEGACY_REDIRECTS;
  },
};

export default withNextIntl(nextConfig);
