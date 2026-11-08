import createMDX from "@next/mdx";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["*.app.github.dev"],
  transpilePackages: ["@cladux/ui", "@cladux/utils", "cladux-registry"],
  // Some demos (aspect ratio, item, scroll area) use next/image with remote photos.
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "github.com" },
      { protocol: "https", hostname: "avatar.vercel.sh" },
    ],
  },
};

const withMDX = createMDX({
  options: {
    // Plugins are given by name so the config works with Turbopack.
    remarkPlugins: ["remark-gfm"],
    rehypePlugins: [
      // The same themes as src/lib/highlight.ts, chosen for contrast.
      [
        "@shikijs/rehype",
        { themes: { light: "github-light-high-contrast", dark: "github-dark-default" } },
      ],
    ],
  },
});

export default withMDX(nextConfig);
