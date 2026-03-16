/** @type {import('next').NextConfig} */
const nextConfig = {
  ...(process.env.STATIC_EXPORT === "true" && {
    output: "export",
    images: { unoptimized: true },
  }),
};

export default nextConfig;
