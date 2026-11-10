const { test } = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('crypto');
const { verifySignature, createHandler } = require('./paymentWebhook');
const secret = 'test-signing-secret';
function sign(body, timestamp = Math.floor(Date.now() / 1000)) {
  return `t=${timestamp},v1=${crypto.createHmac('sha256', secret).update(timestamp + '.').update(body).digest('hex')}`;
}

test('signature verification rejects tampering, malformed headers and expired timestamps', () => {
  const body = Buffer.from('{"event":"order.paid"}');
  assert.equal(verifySignature(body, sign(body), secret), true);
  assert.equal(verifySignature(Buffer.from('{}'), sign(body), secret), false);
  assert.equal(verifySignature(body, sign(body, Math.floor(Date.now() / 1000) - 301), secret), false);
  assert.equal(verifySignature(body, sign(body, Math.floor(Date.now() / 1000) + 301), secret), false);
  assert.equal(verifySignature(body, 't=1,v1=invalid', secret), false);
  assert.equal(verifySignature(body, sign(body), ''), false);
});

test('webhook authenticates raw bytes and rechecks payment before storing event', async () => {
  const calls = [];
  const order = { id: 1, payment_method: 'UPI' };
  const payment = { order_id: 'ORD1', status: 'paid' };
  const handler = createHandler({
    secret: () => secret,
    store: { findOrder: async () => order, applyEvent: async (...args) => calls.push(args) },
    gateway: { validatePayment: () => {}, checkPayment: async () => payment }
  });
  const body = Buffer.from(JSON.stringify({ event: 'order.paid', event_id: 'event-1', event_sequence: 2, data: { order_id: 'ORD1', client_order_id: 'RM-1' } }));
  const invoke = async (header, buffer = body) => {
    const res = { code: 200, status(code) { this.code = code; return this; }, json(value) { this.value = value; return this; } };
    await handler({ body: buffer, get: () => header }, res);
    return res;
  };
  assert.equal((await invoke('bad')).code, 401);
  assert.equal(calls.length, 0);
  assert.equal((await invoke(sign(body))).code, 200);
  assert.equal(calls.length, 1);
  assert.equal(calls[0][2], payment);
  payment.order_id = 'OTHER';
  assert.equal((await invoke(sign(body))).code, 400);
  assert.equal(calls.length, 1);
  const malformed = Buffer.from('{');
  assert.equal((await invoke(sign(malformed), malformed)).code, 400);
});
