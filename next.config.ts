import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // La géolocalisation n'est demandée qu'au clic sur « Ma position ».
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self)" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Les photos passent par des Server Actions (1 Mo par défaut) : 5 Mo par image, jusqu'à 8 images à la création d'un lieu.
  experimental: { serverActions: { bodySizeLimit: "45mb" } },
  images: {
    formats: ["image/avif", "image/webp"],
    // Photos Wikimedia Commons référencées directement (licences libres, crédits sur /credits-photos).
    remotePatterns: [{ protocol: "https", hostname: "upload.wikimedia.org", pathname: "/wikipedia/commons/**" }],
    deviceSizes: [360, 640, 828, 1080, 1280, 1600],
  },
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;
