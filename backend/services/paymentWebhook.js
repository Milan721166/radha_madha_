const crypto = require('crypto');

function verifySignature(body, header, secret, now = Date.now()) {
  if (!secret || !Buffer.isBuffer(body) || typeof header !== 'string') return false;
  const match = /^t=(\d+),v1=([a-fA-F0-9]{64})$/.exec(header.trim());
  if (!match || Math.abs(now / 1000 - Number(match[1])) > 300) return false;
  const expected = crypto.createHmac('sha256', secret).update(match[1] + '.').update(body).digest();
  return crypto.timingSafeEqual(expected, Buffer.from(match[2], 'hex'));
}

function createHandler({ store, gateway, secret = () => process.env.PAYMENT_WEBHOOK_SECRET }) {
  return async (req, res) => {
    if (!secret()) return res.status(503).json({ success: false, message: 'Webhook signing secret is not configured.' });
    if (!verifySignature(req.body, req.get('X-Signature'), secret())) return res.status(401).json({ success: false, message: 'Invalid webhook signature.' });
    let event;
    try { event = JSON.parse(req.body.toString('utf8')); }
    catch { return res.status(400).json({ success: false, message: 'Invalid JSON.' }); }
    if (!event || typeof event.event_id !== 'string' || !event.event_id || event.event_id.length > 100 ||
        !Number.isSafeInteger(event.event_sequence) || event.event_sequence < 0 ||
        typeof event.data?.client_order_id !== 'string') return res.status(400).json({ success: false, message: 'Invalid event.' });
    try {
      const order = await store.findOrder(event.data.client_order_id);
      if (!order || order.payment_method !== 'UPI') return res.status(404).json({ success: false, message: 'Order not found.' });
      gateway.validatePayment(event.data, order);
      // Webhooks notify us to recheck. Only the authoritative API can confirm payment.
      const payment = await gateway.checkPayment(order);
      if (!payment.order_id || payment.order_id !== event.data.order_id) return res.status(400).json({ success: false, message: 'Payment reference mismatch.' });
      await store.applyEvent(event, order, payment);
      return res.json({ success: true });
    } catch (err) {
      console.error('Payment webhook could not be processed:', err.message);
      return res.status(502).json({ success: false, message: 'Payment verification failed. Please retry.' });
    }
  };
}

module.exports = { verifySignature, createHandler };
