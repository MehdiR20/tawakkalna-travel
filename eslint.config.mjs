import next from "eslint-config-next/core-web-vitals";

const config = [
  { ignores: [".next/**", "node_modules/**", "next-env.d.ts"] },
  ...next,
  // Trip images come from admin-entered URLs on any host, so next/image's host
  // allow-list does not fit. See src/components/trip-image.tsx.
  { rules: { "@next/next/no-img-element": "off" } },
];
export default config;
