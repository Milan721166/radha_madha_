const { test } = require('node:test');
const assert = require('node:assert/strict');
const { dbAsync } = require('../db/database');
const gateway = require('../services/paymentGateway');
const router = require('./orderRoutes');

test('confirmation lookup checks ownership and confirms only gateway-verified paid orders', async () => {
  const handler = router.stack.find(layer => layer.route?.path === '/:id/payment' && layer.route.methods.get).route.stack.at(-1).handle;
  const original = { get: dbAsync.get, run: dbAsync.run, checkPayment: gateway.checkPayment };
  const writes = [];
  let owned = true;
  let status = 'pending';
  let gatewayCalls = 0;
  dbAsync.get = async (sql, params) => {
    assert.match(sql, /order_number = \? AND user_id = \?/);
    assert.deepEqual(params, ['RM-123', 7]);
    return owned ? { id: 1, order_number: 'RM-123', payment_method: 'UPI', order_status: 'pending', total_amount: '418.00' } : null;
  };
  dbAsync.run = async (...args) => { writes.push(args); return { changes: 1 }; };
  gateway.checkPayment = async () => { gatewayCalls++; return { status }; };
  const invoke = async () => {
    const res = { code: 200, status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; } };
    await handler({ params: { id: 'RM-123' }, user: { id: 7 } }, res);
    return res;
  };
  try {
    assert.equal((await invoke()).body.status, 'pending');
    assert.equal(writes.length, 0);
    status = 'paid';
    const confirmed = await invoke();
    assert.equal(confirmed.body.order.orderStatus, 'confirmed');
    assert.equal(confirmed.body.order.totalAmount, 418);
    assert.equal(writes.length, 1);
    owned = false;
    assert.equal((await invoke()).code, 404);
    assert.equal(gatewayCalls, 2);
    assert.equal(writes.length, 1);
  } finally {
    dbAsync.get = original.get;
    dbAsync.run = original.run;
    gateway.checkPayment = original.checkPayment;
  }
});
