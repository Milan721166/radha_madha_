import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function OrderConfirmation() {
  const [params] = useSearchParams();
  const reference = params.get('order');
  const { user, loading, login } = useAuth();
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    if (!reference || !user) return;
    let active = true;
    let timer;
    const check = async () => {
      try {
        const response = await api.get(`/orders/${encodeURIComponent(reference)}/payment`);
        if (!active) return;
        setResult(response);
        setError('');
        if (response.status === 'paid') {
          try {
            const pending = JSON.parse(localStorage.getItem('radhamav_pending_payment') || 'null');
            if (pending?.orderNumber === response.order.orderNumber) localStorage.removeItem('radhamav_pending_payment');
          } catch { /* Invalid cached checkout data does not affect server verification. */ }
        } else if (!['failed', 'expired'].includes(response.status)) timer = window.setTimeout(check, 5000);
      } catch (err) { if (active) setError(err.message || 'Unable to verify payment. Please retry.'); }
    };
    setResult(null);
    setError('');
    check();
    return () => { active = false; window.clearTimeout(timer); };
  }, [reference, user?.id, retry]);

  const paid = result?.status === 'paid';
  const cancelled = result?.order?.orderStatus === 'cancelled';
  const confirmed = paid && !cancelled;
  const signIn = async event => {
    event.preventDefault();
    setSigningIn(true);
    setError('');
    try { await login(email.trim(), password); }
    catch (err) { setError(err.message); }
    finally { setSigningIn(false); }
  };

  return (
    <section className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
      {confirmed && <CheckCircle2 className="w-20 h-20 text-emerald-600 mx-auto" />}
      <h1 className="font-serif text-3xl font-bold">{confirmed ? 'Order Confirmed!' : paid && cancelled ? 'Payment received for a cancelled order' : 'Checking your payment'}</h1>
      {!reference ? <p>No order reference was provided. Open your account to view your orders.</p> : loading ? <Loader2 className="w-8 h-8 animate-spin mx-auto" /> : !user ? (
        <form onSubmit={signIn} className="max-w-sm mx-auto space-y-4">
          <p>Sign in with the account you used for this order to view your confirmation.</p>
          <label className="block text-left">Email<input required type="email" autoComplete="username" value={email} onChange={event => setEmail(event.target.value)} className="block w-full border rounded-xl p-3 mt-1" /></label>
          <label className="block text-left">Password<input required type="password" autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} className="block w-full border rounded-xl p-3 mt-1" /></label>
          <button disabled={signingIn} className="maroon-btn px-6 py-3 rounded-full">{signingIn ? 'Signing in…' : 'Sign In'}</button>
        </form>
      ) : confirmed ? (
        <div className="bg-white border rounded-3xl p-6 space-y-4">
          <p>Thank you! Your payment is verified and your order is confirmed.</p>
          <p>Order ID: <strong>{result.order.orderNumber}</strong></p>
          <p>Total paid: <strong>₹{Number(result.order.totalAmount).toLocaleString('en-IN')}</strong></p>
          <p>Payment method: UPI</p>
        </div>
      ) : paid && cancelled ? <p>Please contact the store about your payment. Your cancelled order has not been reopened.</p> : (
        <div className="space-y-4">
          {!error && !result && <Loader2 className="w-8 h-8 animate-spin mx-auto" />}
          {result && <p>Payment status: {result.status.replaceAll('_', ' ')}. We’ll show your confirmation once the gateway verifies payment.</p>}
          {(error || ['failed', 'expired'].includes(result?.status)) && <button onClick={() => setRetry(value => value + 1)} className="maroon-btn px-6 py-3 rounded-full">Check Again</button>}
        </div>
      )}
      {error && <p role="alert" className="text-red-700">{error}</p>}
      <div className="flex justify-center gap-4">
        <Link to="/account?tab=orders" className="maroon-btn px-6 py-3 rounded-full">My Orders</Link>
        <Link to="/shop" className="border px-6 py-3 rounded-full">Continue Shopping</Link>
      </div>
    </section>
  );
}
