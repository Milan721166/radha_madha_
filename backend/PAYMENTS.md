UPI payments use https://paymentgateway.milansahoo.cloud/docs.

Configure backend/.env (never frontend environment variables):

    PAYMENT_API_KEY=<Live API key>
    PAYMENT_API_SECRET=<Live API secret>
    PAYMENT_ENVIRONMENT=live
    PAYMENT_WEBHOOK_SECRET=<Dedicated Live Webhook Signing Secret>

For production, set PAYMENT_REDIRECT_URL=https://radhamadhavfashion.com/checkout and allowlist radhamadhavfashion.com in the gateway dashboard. Local HTTP redirects are not supported by the gateway; customers can return to the checkout tab manually and click Check Payment Status.

After deploying this backend, save https://radhamadhavfashion.com/api/payments/webhook as the Live webhook endpoint. Set PAYMENT_WEBHOOK_SECRET on the deployed backend to the exact dedicated Live signing secret from the gateway. Do not use the Sandbox secret. The endpoint validates timestamped HMAC-SHA256 signatures against the raw body with a five-minute tolerance, checks amount/reference/environment and rechecks the authoritative gateway API. Signed event IDs are recorded transactionally with order updates. Duplicate events have no repeated side effects, and old events cannot revert a paid order. Expired events do not automatically cancel or release inventory. Cancelled orders remain cancelled if a late payment arrives.

The server checks the gateway status endpoint using its credentials and verifies order reference, INR amount, environment and test flag before recording payment. Browser redirect parameters never confirm a payment. Checkout checks automatically on return/focus and every ten seconds while its pending-payment screen is visible. A manual status button is also available. Webhooks confirm paid orders even when customers do not return. Unpaid orders reserve inventory and can be cancelled from the account page.

To test without real money, use separate Sandbox credentials and PAYMENT_ENVIRONMENT=sandbox. Restart the backend after changing configuration. Run node --test services/paymentGateway.test.js from backend for mocked API checks.
