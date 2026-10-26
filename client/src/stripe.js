import { loadStripe } from "@stripe/stripe-js";

//laddar och initialiserar Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export { stripePromise };