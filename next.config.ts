import dotenv from "dotenv";
dotenv.config();

import type { NextConfig } from "next";

const isDev = process.env.APP_ENV === "development";

const securityHeaders = [
  {
    key: "Permissions-Policy",
    value: [
      "accelerometer=()",
      "autoplay=()",
      "camera=()",
      "encrypted-media=()",
      "fullscreen=()",
      "geolocation=()",
      "gyroscope=()",
      "magnetometer=()",
      "microphone=()",
      "midi=()",
      "payment=()",
      "usb=()",
    ].join(", "),
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains; preload",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "X-Permitted-Cross-Domain-Policies",
    value: "none",
  },
  {
    key: "Cross-Origin-Embedder-Policy",
    value: "require-corp",
  },
  {
    key: "Cross-Origin-Opener-Policy",
    value: "same-origin",
  },
  {
    key: "Cross-Origin-Resource-Policy",
    value: "same-origin",
  },
  {
    key: "Origin-Agent-Cluster",
    value: "?1",
  },
  {
    key: "Expect-CT",
    value: "max-age=86400, enforce",
  },
];

const reportHeaders = [
  {
    key: "Report-To",
    value: JSON.stringify({
      group: "default",
      max_age: 31536000,
      endpoints: [{ url: "https://your-report-endpoint.com/report" }],
      include_subdomains: true,
    }),
  },
  {
    key: "NEL",
    value: JSON.stringify({
      report_to: "default",
      max_age: 31536000,
      include_subdomains: true,
    }),
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,

  experimental: {
    optimizeCss: true,
  },

  onDemandEntries: {
    maxInactiveAge: isDev ? 0 : 15_000,
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Powered-By",
            value: "", // Remove o header padrão
          },
        ],
      },
      {
        source: "/:path*",
        headers: [
          {
            key: "Cache-Control",
            value:
              "public, max-age=0, s-maxage=300, must-revalidate, stale-while-revalidate=60",
          },
          ...(isDev
            ? [
                {
                  key: "Cache-Control",
                  value: "no-store, no-cache, must-revalidate",
                },
                { key: "Pragma", value: "no-cache" },
                { key: "Expires", value: "0" },
              ]
            : [
                {
                  key: "Cache-Control",
                  value:
                    "public, max-age=0, s-maxage=0, must-revalidate, stale-while-revalidate=60",
                },
              ]),
          ...securityHeaders,
          ...reportHeaders,
        ],
      },
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/_next/image/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },

  webpack: (config) => {
    // Remove qualquer configuração incorreta relacionada ao React DevTools
    return config;
  },
};

export default nextConfig;
