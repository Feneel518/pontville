import "server-only";
import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY;
if (!key) throw new Error("Missing Stripe Secret Key");

export const stripe = new Stripe(key);
