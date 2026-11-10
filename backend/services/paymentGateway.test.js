const { test } = require('node:test');
const assert = require('node:assert/strict');
const { validatePayment, createPayment, checkPayment } = require('./paymentGateway');

test('payment verification rejects wrong order, amount, currency and environment', () => {
  process.env.PAYMENT_ENVIRONMENT = 'live';
  const order = { order_number: 'RM-123', total_amount: 199 };
  const payment = { client_order_id: 'RM-123', amount: '199.00', currency: 'INR', environment: 'live', test: false };
  assert.equal(validatePayment(payment, order), payment);
  for (const change of [{ amount: '1' }, { amount: 'abc' }, { currency: 'USD' }, { client_order_id: 'OTHER' }, { environment: 'sandbox', test: true }, { test: true }]) {
    assert.throws(() => validatePayment({ ...payment, ...change }, order));
  }
});

test('gateway uses server credentials and documented create/status endpoints', async () => {
  process.env.PAYMENT_API_KEY = 'test-key';
  process.env.PAYMENT_API_SECRET = 'test-secret';
  const original = global.fetch;
  const originalRedirect = process.env.PAYMENT_REDIRECT_URL;
  delete process.env.PAYMENT_REDIRECT_URL;
  const order = { order_number: 'RM-123', total_amount: 199 };
  const data = { client_order_id: 'RM-123', amount: '199.00', currency: 'INR', environment: 'live', test: false, payment_url: 'https://paymentgateway.milansahoo.cloud/pay/TEST' };
  const calls = [];
  global.fetch = async (...args) => { calls.push(args); return { ok: true, json: async () => ({ success: true, data }) }; };
  try {
    await createPayment(order);
    await checkPayment(order);
    assert.equal(calls[0][0], 'https://paymentgateway.milansahoo.cloud/api/v1/orders');
    assert.equal(calls[0][1].headers['X-Api-Secret'], 'test-secret');
    assert.equal(JSON.parse(calls[0][1].body).amount, 199);
    assert.equal(JSON.parse(calls[0][1].body).redirect_url, 'https://radhamadhavfashion.com/order-success?order=RM-123');
    assert.equal(calls[1][0], 'https://paymentgateway.milansahoo.cloud/api/v1/orders/RM-123');
    process.env.PAYMENT_REDIRECT_URL = 'https://radhamadhavfashion.com/checkout?source=upi';
    await createPayment(order);
    assert.equal(JSON.parse(calls[2][1].body).redirect_url, 'https://radhamadhavfashion.com/checkout?source=upi&order=RM-123');
    process.env.PAYMENT_REDIRECT_URL = 'http://radhamadhavfashion.com/checkout';
    await assert.rejects(createPayment(order), /HTTPS/);
    delete process.env.PAYMENT_REDIRECT_URL;
    data.payment_url = 'https://evil.example/pay';
    await assert.rejects(createPayment(order));
  } finally {
    global.fetch = original;
    if (originalRedirect === undefined) delete process.env.PAYMENT_REDIRECT_URL;
    else process.env.PAYMENT_REDIRECT_URL = originalRedirect;
  }
});
