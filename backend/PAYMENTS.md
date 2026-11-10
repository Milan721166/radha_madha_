UPI payments use https://paymentgateway.milansahoo.cloud/docs.

Configure backend/.env (never frontend environment variables):

    PAYMENT_API_KEY=<Live API key>
    PAYMENT_API_SECRET=<Live API secret>
    PAYMENT_ENVIRONMENT=live
    PAYMENT_WEBHOOK_SECRET=<Dedicated Live Webhook Signing Secret>

New payments always include an HTTPS return URL, defaulting to https://radhamadhavfashion.com/order-success?order=YOUR_ORDER_NUMBER. Allowlist radhamadhavfashion.com in the gateway dashboard. Optional PAYMENT_REDIRECT_URL overrides the return URL; the server adds the order reference to it. For production use https://radhamadhavfashion.com/order-success. Legacy /checkout return URLs also forward to the confirmation page. The confirmation page loads the owned order through the authenticated payment-status API, verifies it with the gateway and supports refresh or missing local checkout storage. If the login session is missing, it asks the customer to sign in before checking the order. Query parameters never confirm a payment. Local HTTP redirects are not supported by the gateway; customers can return to the checkout tab manually and click Check Payment Status. Previously created gateway payments keep their original redirect settings; for a paid order open /order-success?order=YOUR_ORDER_NUMBER directly.

After deploying this backend, save https://radhamadhavfashion.com/api/payments/webhook as the Live webhook endpoint. Set PAYMENT_WEBHOOK_SECRET on the deployed backend to the exact dedicated Live signing secret from the gateway. Do not use the Sandbox secret. The endpoint validates timestamped HMAC-SHA256 signatures against the raw body with a five-minute tolerance, checks amount/reference/environment and rechecks the authoritative gateway API. Signed event IDs are recorded transactionally with order updates. Duplicate events have no repeated side effects, and old events cannot revert a paid order. Expired events do not automatically cancel or release inventory. Cancelled orders remain cancelled if a late payment arrives.

The server checks the gateway status endpoint using its credentials and verifies order reference, INR amount, environment and test flag before recording payment. Browser redirect parameters never confirm a payment. Checkout checks automatically on return/focus and every ten seconds while its pending-payment screen is visible. A manual status button is also available. Webhooks confirm paid orders even when customers do not return. Unpaid orders reserve inventory and can be cancelled from the account page.

To test without real money, use separate Sandbox credentials and PAYMENT_ENVIRONMENT=sandbox. Restart the backend after changing configuration. Run node --test services/paymentGateway.test.js from backend for mocked API checks.
