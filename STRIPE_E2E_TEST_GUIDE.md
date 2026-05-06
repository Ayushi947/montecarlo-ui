# Stripe End-to-End (E2E) Testing Guide

This guide walks you through testing the full subscription flow from the User Interface, through Stripe, and back to the Application.

## 1. Prerequisites (Ensure these are running)

1.  **Frontend (`montecarlo-ui`)**:
    -   Status: Running on `http://localhost:3000`
    -   Command: `npm run dev`

2.  **Backend (`montecarlo-server`)**:
    -   Status: Running on `http://localhost:5000`
    -   Command: `npm run dev`

3.  **Stripe CLI (Webhook Forwarding)**:
    -   Status: Forwarding events to backend
    -   Command:
        ```powershell
        .\StripeCLI\stripe.exe listen --forward-to localhost:5000/api/webhooks/stripe
        ```
    -   **Keep this terminal open!** You will need to watch the logs here.

---

## 2. The Testing Flow

### Step 1: User Login (Frontend)
1.  Open Chrome/Edge and go to **[http://localhost:3000](http://localhost:3000)**.
2.  Log in with your test user account (or Sign Up if you haven't yet).
    -   *Tip: Use a distinct email like `test_sub_01@example.com`.*

### Step 2: Check Current Plan
1.  Navigate to your **Profile** or **Dashboard**.
2.  Verify your current plan is **"Free"** (or "Basic" if you just signed up).

### Step 3: Initiate Subscription
1.  Go to the **Pricing** or **Upgrade** page.
2.  Click the **"Subscribe"** or **"Upgrade"** button for a Paid Plan (e.g., "Pro").
3.  You should be redirected to a **Stripe Checkout Page** (hosted by Stripe).

### Step 4: Complete Payment (Stripe)
1.  On the Stripe page, verify the product name and price.
2.  Use a **Stripe Test Card**:
    -   **Card Number**: `4242 4242 4242 4242`
    -   **MM/YY**: Any future date (e.g., `12/30`)
    -   **CVC**: Any 3 digits (e.g., `123`)
    -   **ZIP**: Any valid zip (e.g., `10001`)
3.  Click **"Pay"**.

### Step 5: Verify Success (Frontend)
1.  After payment, Stripe should redirect you back to your application.
2.  URL should look like: `http://localhost:3000/checkout/success?session_id=...`
3.  You should see a **"Payment Successful"** message.

### Step 6: Verify Webhook (CLI Terminal)
1.  Look at your **Stripe CLI terminal**.
2.  You should see the following events appearing in green:
    -   `payment_intent.succeeded`
    -   `charge.succeeded`
    -   `checkout.session.completed`
    -   `customer.subscription.created`
    -   ...
    -   **`--> 200 OK`** (This confirms your Backend processed the webhook successfully).

### Step 7: Verify Entitlement (Frontend)
1.  In the app, go back to your **Dashboard** or **Profile**.
2.  Refresh the page.
3.  Your plan should now say **"Pro"** (or whatever you bought).
4.  Verify you have the higher limits (e.g., allowed to run more simulations).

---

## 3. Testing Cancellation (Optional)

1.  Repeat Step 3 (Initiate Subscription).
2.  On the Stripe Checkout page, click the **"Back"** button or the **"X"** to cancel.
3.  Verify you are redirected to `http://localhost:3000/checkout/cancel`.
4.  Verify your plan did **not** change.
