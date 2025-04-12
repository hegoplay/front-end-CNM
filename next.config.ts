import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  serverActions: {
    bodySizeLimit: '40mb', // Tăng giới hạn lên 2MB (hoặc giá trị bạn cần)
  },
};

export default nextConfig;
