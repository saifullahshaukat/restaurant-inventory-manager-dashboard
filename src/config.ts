// Frontend configuration utility
// Centralizes all API URLs and configuration

const config = {
  apiUrl: import.meta.env.VITE_API_URL || "http://localhost:5000",
  stripePublishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "",
} as const;

export default config;
