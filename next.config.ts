import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";
const isGitHubPages = process.env.GITHUB_PAGES === "true";

const nextConfig: NextConfig = {
  // Static export für GitHub Pages
  output: isGitHubPages ? "export" : undefined,

  // Base path für GitHub Pages (Repository-Name)
  basePath: isGitHubPages ? "/fluessiggasfest" : "",

  // Asset prefix für GitHub Pages
  assetPrefix: isGitHubPages ? "/fluessiggasfest/" : "",

  // Deaktiviere Image Optimization für static export
  images: {
    unoptimized: true,
  },

  // Trailing slashes für bessere Kompatibilität
  trailingSlash: true,
};

export default nextConfig;
