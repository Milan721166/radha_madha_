const { dbAsync, getEngine } = require('../db/database');

async function initWebhookStore() {
  await dbAsync.exec(`CREATE TABLE IF NOT EXISTS payment_webhook_events (
    event_id VARCHAR(100) PRIMARY KEY,
    order_id INTEGER NOT NULL,
    event_sequence INTEGER NOT NULL,
    environment VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);
}

// SQLite transactions share one connection, so serialize this service's work.
let sqliteQueue = Promise.resolve();
async function transaction(work) {
  const engine = await getEngine();
  if (engine.type === 'mysql') {
    const connection = await engine.pool.getConnection();
    try {
      await connection.beginTransaction();
      const query = async (sql, params = []) => {
        const [result] = await connection.query(sql, params);
        return result;
      };
      await work(query);
      await connection.commit();
    } catch (err) { await connection.rollback(); throw err; }
    finally { connection.release(); }
    return;
  }
  const run = async () => {
    const query = (sql, params = []) => new Promise((resolve, reject) => {
      if (/^SELECT/i.test(sql)) engine.db.all(sql, params, (err, rows) => err ? reject(err) : resolve(rows));
      else engine.db.run(sql, params, function (err) { err ? reject(err) : resolve({ affectedRows: this.changes }); });
    });
    await query('BEGIN IMMEDIATE');
    try { await work(query); await query('COMMIT'); }
    catch (err) { await query('ROLLBACK'); throw err; }
  };
  const pending = sqliteQueue.then(run, run);
  sqliteQueue = pending.catch(() => {});
  return pending;
}

async function applyEvent(event, order, payment) {
  await transaction(async query => {
    const existing = await query('SELECT event_id FROM payment_webhook_events WHERE event_id = ?', [event.event_id]);
    if (existing.length) return;
    await query('INSERT INTO payment_webhook_events (event_id, order_id, event_sequence, environment) VALUES (?, ?, ?, ?)',
      [event.event_id, order.id, event.event_sequence, payment.environment]);
    // State only advances to paid: old/expired events cannot undo a payment.
    // No fulfilment or inventory side effects are repeated on delivery retries.
    if (payment.status === 'paid') {
      const result = await query("UPDATE orders SET payment_status = 'paid', order_status = CASE WHEN order_status = 'pending' THEN 'confirmed' ELSE order_status END WHERE id = ? AND payment_status <> 'paid'", [order.id]);
      if (result.affectedRows) {
        const rows = await query('SELECT order_status FROM orders WHERE id = ?', [order.id]);
        await query('INSERT INTO order_status_history (order_id, status, comment) VALUES (?, ?, ?)',
          [order.id, rows[0].order_status, 'UPI payment verified through signed gateway webhook']);
      }
    }
  });
}

module.exports = {
  initWebhookStore,
  findOrder: reference => dbAsync.get('SELECT * FROM orders WHERE order_number = ?', [reference]),
  applyEvent
};
