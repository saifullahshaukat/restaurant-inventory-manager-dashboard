import { loadStripe } from "@stripe/stripe-js";
import config from "@/config";

let stripePromise: Promise<any> | null = null;

export const getStripe = async () => {
  if (!stripePromise) {
    // Use publishable key from environment variable
    stripePromise = loadStripe(config.stripePublishableKey);
  }
  return stripePromise;
};
