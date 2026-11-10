const BASE_URL = 'https://paymentgateway.milansahoo.cloud/api/v1';

function configured() {
  return Boolean(process.env.PAYMENT_API_KEY && process.env.PAYMENT_API_SECRET);
}

async function request(path, body) {
  if (!configured()) throw new Error('Online payment is not configured. Please choose Cash on Delivery.');
  const response = await fetch(`${BASE_URL}${path}`, {
    method: body ? 'POST' : 'GET',
    headers: {
      'X-Api-Key': process.env.PAYMENT_API_KEY,
      'X-Api-Secret': process.env.PAYMENT_API_SECRET,
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
    signal: AbortSignal.timeout(20000)
  });
  const result = await response.json();
  if (!response.ok || !result.success || !result.data) throw new Error('Payment gateway is unavailable. Please retry your payment.');
  return result.data;
}

function validatePayment(data, order) {
  const environment = process.env.PAYMENT_ENVIRONMENT || 'live';
  if (data.client_order_id !== order.order_number || data.currency !== 'INR' ||
      !Number.isFinite(Number(data.amount)) || Math.round(Number(data.amount) * 100) !== Math.round(Number(order.total_amount) * 100) ||
      data.environment !== environment || data.test !== (environment === 'sandbox')) {
    throw new Error('Payment details could not be verified.');
  }
  return data;
}

async function createPayment(order) {
  const body = { amount: Number(order.total_amount), client_order_id: order.order_number, note: order.order_number };
  const redirect = new URL(process.env.PAYMENT_REDIRECT_URL || 'https://radhamadhavfashion.com/order-success');
  if (redirect.protocol !== 'https:') throw new Error('Payment return URL must use HTTPS.');
  redirect.searchParams.set('order', order.order_number);
  body.redirect_url = redirect.toString();
  const data = validatePayment(await request('/orders', body), order);
  const url = new URL(data.payment_url);
  if (url.protocol !== 'https:' || url.origin !== new URL(BASE_URL).origin) throw new Error('Invalid payment checkout URL.');
  return data;
}

async function checkPayment(order) {
  return validatePayment(await request(`/orders/${encodeURIComponent(order.order_number)}`), order);
}

module.exports = { configured, createPayment, checkPayment, validatePayment };
