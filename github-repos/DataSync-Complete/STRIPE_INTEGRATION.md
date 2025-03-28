# Stripe Integration Guide for DataSync

This guide provides instructions for integrating Stripe payment processing into the DataSync application.

## Introduction

DataSync includes optional Stripe integration for the premium features, allowing users to upgrade to paid plans with additional functionality. The implementation is based on Stripe's newest API and Elements UI components.

## Prerequisites

- Stripe account (can be created at [stripe.com](https://stripe.com))
- Stripe API keys (available in your Stripe Dashboard)

## Implementation Details

### 1. Backend Implementation

The backend implements the following Stripe-related endpoints:

- `/api/create-payment-intent` - For one-time payments
- `/api/get-or-create-subscription` - For subscription-based payments

#### Server Routes (server/routes.ts)

```typescript
import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

// One-time payment endpoint
app.post("/api/create-payment-intent", async (req, res) => {
  try {
    const { amount } = req.body;
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: "usd",
    });
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Error creating payment intent: " + error.message });
  }
});

// Subscription endpoint
app.post('/api/get-or-create-subscription', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.sendStatus(401);
  }

  let user = req.user;

  if (user.stripeSubscriptionId) {
    const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);

    res.send({
      subscriptionId: subscription.id,
      clientSecret: subscription.latest_invoice?.payment_intent.client_secret,
    });

    return;
  }
  
  if (!user.email) {
    throw new Error('No user email on file');
  }

  try {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.username,
    });

    user = await storage.updateStripeCustomerId(user.id, customer.id);

    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{
        price: process.env.STRIPE_PRICE_ID,
      }],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'],
    });

    await storage.updateUserStripeInfo(user.id, {
      stripeCustomerId: customer.id, 
      stripeSubscriptionId: subscription.id
    });

    res.send({
      subscriptionId: subscription.id,
      clientSecret: subscription.latest_invoice?.payment_intent.client_secret,
    });
  } catch (error: any) {
    return res.status(400).send({ error: { message: error.message } });
  }
});
```

### 2. Frontend Implementation

#### Checkout Component (client/src/pages/checkout.tsx)

```tsx
import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin,
      },
    });

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Payment Successful",
        description: "Thank you for your purchase!",
      });
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <button>Submit</button>
    </form>
  );
};

export default function Checkout() {
  const [clientSecret, setClientSecret] = useState("");

  useEffect(() => {
    // Create PaymentIntent as soon as the page loads
    apiRequest("POST", "/api/create-payment-intent", { amount: 29.99 })
      .then((res) => res.json())
      .then((data) => {
        setClientSecret(data.clientSecret)
      });
  }, []);

  if (!clientSecret) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading"/>
      </div>
    );
  }
  
  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <CheckoutForm />
    </Elements>
  );
};
```

#### Subscription Component (client/src/pages/subscribe.tsx)

```tsx
import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const SubscribeForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin,
      },
    });

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Payment Successful",
        description: "You are subscribed!",
      });
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <button>Subscribe</button>
    </form>
  );
};

export default function Subscribe() {
  const [clientSecret, setClientSecret] = useState("");

  useEffect(() => {
    apiRequest("POST", "/api/get-or-create-subscription")
      .then((res) => res.json())
      .then((data) => {
        setClientSecret(data.clientSecret)
      });
  }, []);

  if (!clientSecret) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading"/>
      </div>
    );
  }
  
  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <SubscribeForm />
    </Elements>
  );
};
```

### 3. Database Schema Updates

To support Stripe integration, add the following fields to the user schema:

```typescript
// In shared/schema.ts
export const users = pgTable("users", {
  // Existing fields...
  
  // Add Stripe-related fields
  stripeCustomerId: text(), 
  stripeSubscriptionId: text(),
  subscriptionStatus: text().default('inactive'),
});
```

### 4. Environment Variables

#### Backend (.env)

```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PRICE_ID=price_...  # Only needed for subscription model
```

#### Frontend (.env)

```
VITE_STRIPE_PUBLIC_KEY=pk_test_...
```

## Stripe Dashboard Setup

1. **Create Products and Prices**:
   - Go to Stripe Dashboard > Products
   - Create products for your offerings (e.g., "DataSync Pro Plan")
   - Set prices for each product (one-time or recurring)
   - For subscriptions, note the Price ID (starts with "price_") to use as STRIPE_PRICE_ID

2. **Configure Webhooks** (for production):
   - Go to Stripe Dashboard > Developers > Webhooks
   - Add an endpoint URL: `https://your-backend-domain.com/api/stripe-webhooks`
   - Select events to listen for (e.g., `payment_intent.succeeded`, `customer.subscription.updated`)

## Testing

1. **Use Stripe Test Cards**:
   - Card number: `4242 4242 4242 4242` (successful payment)
   - Card number: `4000 0000 0000 9995` (declined payment)
   - Expiration date: Any future date
   - CVC: Any 3 digits

2. **View Test Events**:
   - Go to Stripe Dashboard > Developers > Events to see test events

## Going to Production

1. **Switch to Live API Keys**:
   - Update environment variables with live Stripe API keys
   - Ensure webhook endpoints are configured for your production environment

2. **Implement Proper Error Handling**:
   - Add comprehensive error handling for all Stripe API calls
   - Implement retry logic for transient failures

3. **Stripe Compliance**:
   - Ensure your Terms of Service and Privacy Policy comply with Stripe's requirements
   - Display required payment information clearly at checkout

## Security Considerations

1. **Never store card details directly** - always use Stripe Elements
2. **Keep your STRIPE_SECRET_KEY secure** - never expose it on the frontend
3. **Validate all requests** on the server before creating payment intents
4. **Implement proper authentication** for all payment-related endpoints
5. **Verify webhook signatures** to prevent fraudulent requests

## Additional Resources

- [Stripe API Documentation](https://stripe.com/docs/api)
- [Stripe.js & Elements](https://stripe.com/docs/js)
- [Payment Intents API](https://stripe.com/docs/payments/payment-intents)
- [Subscriptions API](https://stripe.com/docs/billing/subscriptions/overview)