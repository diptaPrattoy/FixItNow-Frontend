export const siteConfig = {
  name: "FixItNow",
  description: "Your trusted home service platform.",
  apiUrl:
    process.env.NEXT_PUBLIC_API_URL ??
    "https://fixitnow-qemf.onrender.com",
} as const;
