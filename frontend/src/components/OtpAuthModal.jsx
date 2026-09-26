import React, { useState, useEffect, useRef } from 'react';
import { Smartphone, Lock, ArrowRight, RefreshCw, CheckCircle, AlertCircle, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function OtpAuthModal({ isOpen, onClose, onSuccess }) {
  const { sendOtp, loginWithOtp } = useAuth();
  const { showToast } = useToast();

  const [step, setStep] = useState('phone'); // 'phone' | 'otp'
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [loading, setLoading] = useState(false);
  const [devMessage, setDevMessage] = useState('');

  const inputRefs = useRef([]);

  useEffect(() => {
    let interval = null;
    if (step === 'otp' && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
      if (interval) clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [step, timer]);

  if (!isOpen) return null;

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    const cleanNumber = phone.replace(/\D/g, '');
    if (cleanNumber.length < 10) {
      showToast('Please enter a valid 10-digit mobile number', 'error');
      return;
    }

    try {
      setLoading(true);
      setDevMessage('');
      const res = await sendOtp(cleanNumber);
      if (res.success) {
        showToast(res.message || 'OTP sent successfully!', 'success');
        setStep('otp');
        setTimer(60);
        setCanResend(false);
        if (res.mode === 'development') {
          setDevMessage('Dev Mode Active: OTP logged in backend server console.');
        }
        setTimeout(() => {
          if (inputRefs.current[0]) inputRefs.current[0].focus();
        }, 100);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to send OTP', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0 && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    const otpCode = otp.join('');
    if (otpCode.length < 6) {
      showToast('Please enter complete 6-digit OTP', 'error');
      return;
    }

    try {
      setLoading(true);
      const res = await loginWithOtp(phone, otpCode, name);
      if (res && res.success) {
        showToast('Login successful!', 'success');
        if (onSuccess) onSuccess(res.user);
        onClose();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Invalid OTP code', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-amber-600 p-6 text-white text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white bg-black/10 hover:bg-black/20 p-1.5 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-md">
            {step === 'phone' ? <Smartphone className="w-7 h-7 text-white" /> : <Lock className="w-7 h-7 text-white" />}
          </div>
          <h3 className="text-2xl font-bold font-serif">
            {step === 'phone' ? 'Mobile Verification' : 'Enter Verification Code'}
          </h3>
          <p className="text-xs text-white/80 mt-1">
            {step === 'phone'
              ? 'Enter your phone number to receive a 6-digit OTP'
              : `We sent a code to +91 ${phone.replace(/\D/g, '').slice(-10)}`}
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'phone' ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Full Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Your Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none text-sm transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <div className="flex rounded-lg border border-gray-300 overflow-hidden focus-within:ring-2 focus-within:ring-red-500 focus-within:border-red-500">
                  <span className="bg-gray-100 text-gray-600 px-3 py-2.5 text-sm font-medium flex items-center border-r">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3 py-2.5 outline-none text-sm font-mono tracking-wider text-gray-800"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || phone.length < 10}
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {loading ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span>Send Verification Code</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              {devMessage && (
                <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                  <span>{devMessage}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider text-center mb-3">
                  Enter 6-Digit OTP Code
                </label>
                <div className="flex justify-center space-x-2">
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => (inputRefs.current[idx] = el)}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      className="w-11 h-12 text-center text-xl font-bold font-mono border-2 border-gray-300 rounded-lg focus:border-red-600 focus:ring-2 focus:ring-red-200 outline-none transition"
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || otp.join('').length < 6}
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {loading ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span>Verify & Login</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setStep('phone')}
                  className="text-gray-600 hover:text-red-600 font-medium underline"
                >
                  Change Number
                </button>

                {canResend ? (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    className="text-red-600 font-semibold hover:underline flex items-center space-x-1"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Resend OTP</span>
                  </button>
                ) : (
                  <span>Resend in <strong className="text-gray-700">{timer}s</strong></span>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
