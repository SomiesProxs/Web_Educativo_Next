import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["res.cloudinary.com"], // ✅ Permite imágenes de Cloudinary
  },
};

export default nextConfig;
