import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // imagens enviadas pelo editor são servidas do GitHub até entrarem no próximo deploy
    remotePatterns: [{ protocol: "https", hostname: "raw.githubusercontent.com", pathname: "/DanielOliveiraUX/portifolio-v2/**" }],
  },
};

export default nextConfig;
