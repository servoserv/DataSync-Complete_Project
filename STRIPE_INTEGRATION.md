# Stripe Integration Guide

This document provides instructions for integrating Stripe payment processing into the DataSync application to enable premium subscription features.

## Prerequisites

Before implementing Stripe integration, ensure you have:

1. A Stripe account (create one at [stripe.com](https://stripe.com) if needed)
2. Stripe API keys (available in your Stripe Dashboard)
3. Configured product and price IDs in Stripe for subscription tiers

## Required Environment Variables

Add the following environment variables to your project:

```
STRIPE_SECRET_KEY=sk_test_...      # Your Stripe Secret Key
VITE_STRIPE_PUBLIC_KEY=pk_test_... # Your Stripe Publishable Key (client-side)
STRIPE_PRICE_ID=price_...          # Your Stripe Price ID for subscription
```

> **Important**: Keep your `STRIPE_SECRET_KEY` confidential. Never expose it in client-side code.

## Backend Implementation

### 1. Install Required Dependencies

```bash
npm install stripe
```

### 2. Set Up Stripe in Server Routes

The application already includes the necessary Stripe setup in `server/routes.ts`. The key endpoints are:

- `/api/create-payment-intent` - For one-time payments
- `/api/get-or-create-subscription` - For subscription management

### 3. Update Database Schema

Ensure the user schema includes fields for storing Stripe customer and subscription IDs:

```typescript
// shared/schema.ts
export const users = pgTable("users", {
  // existing fields...
  stripeCustomerId: text(),
  stripeSubscriptionId: text(),
});
```

### 4. Add Storage Methods

Add methods to the storage interface to handle Stripe-related user updates:

```typescript
// server/storage.ts
interface IStorage {
  // existing methods...
  updateStripeCustomerId(userId: number, customerId: string): Promise<User>;
  updateUserStripeInfo(userId: number, stripeInfo: { customerId: string, subscriptionId: string }): Promise<User>;
}
```

## Frontend Implementation

### 1. Create Payment Pages

The application includes example payment pages:

- `client/pages/checkout.tsx` - For one-time payments
- `client/pages/subscribe.tsx` - For subscription management

### 2. Add Subscription Status to User Context

Update the auth context to include subscription status:

```typescript
// client/hooks/use-auth.tsx
type AuthContextType = {
  // existing properties...
  hasActiveSubscription: boolean;
};
```

### 3. Implement Premium Feature Checks

Add utility functions to check user subscription status:

```typescript
// client/lib/subscription.ts
export function canAccessPremiumFeature(user: User | null, feature: string): boolean {
  if (!user) return false;
  return !!user.stripeSubscriptionId;
}
```

## Webhook Implementation

For proper subscription management, implement Stripe webhooks:

1. Create a webhook endpoint at `/api/webhooks/stripe`
2. Handle events like `customer.subscription.created`, `customer.subscription.updated`, etc.
3. Update user subscription status accordingly

Example webhook handler:

```typescript
app.post('/api/webhooks/stripe', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  let event;
  
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  
  // Handle the event
  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      const subscription = event.data.object;
      await storage.updateSubscriptionStatus(subscription.customer, subscription.id, subscription.status);
      break;
    case 'customer.subscription.deleted':
      const canceledSubscription = event.data.object;
      await storage.removeSubscription(canceledSubscription.customer);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }
  
  res.json({received: true});
});
```

## Testing Stripe Integration

1. Use Stripe test mode for development
2. Test various subscription scenarios (signup, cancellation, etc.)
3. Use Stripe's webhook testing tools to simulate events

## Going to Production

Before deploying to production:

1. Switch to production Stripe API keys
2. Set up proper error handling and logging
3. Implement subscription management UI for users
4. Test the complete payment flow in a staging environment

## Additional Resources

- [Stripe API Documentation](https://stripe.com/docs/api)
- [Stripe Elements (UI Components)](https://stripe.com/docs/elements)
- [Stripe Testing Guide](https://stripe.com/docs/testing)
- [Webhook Integration](https://stripe.com/docs/webhooks)