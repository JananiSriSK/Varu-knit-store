import React, { useState, useEffect } from 'react';
import { Mail, Phone, ArrowLeft } from 'lucide-react';

const OTPVerification = ({ otpId, email, phone, onVerify, onBack }) => {
  const [emailOtp, setEmailOtp] = useState('');
  const [phoneOtp, setPhoneOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!emailOtp || (phone && !phoneOtp)) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/v1/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          otpId,
          emailOtp,
          phoneOtp: phone ? phoneOtp : undefined
        })
      });

      const data = await response.json();
      if (data.success) {
        onVerify(data);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('OTP verification failed:', error);
      alert(error.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  if (timeLeft === 0) {
    return (
      <div className=\"max-w-md mx-auto bg-white p-8 rounded-xl shadow-lg border border-[#dcd6f7]\">
        <div className=\"text-center\">
          <h2 className=\"text-2xl font-bold text-[#444444] mb-4\">OTP Expired</h2>
          <p className=\"text-gray-600 mb-6\">Your verification code has expired. Please try registering again.</p>
          <button
            onClick={onBack}
            className=\"w-full bg-[#7b5fc4] hover:bg-[#6b4fb4] text-white py-3 px-4 rounded-lg transition-colors\"
          >
            Back to Registration
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className=\"max-w-md mx-auto bg-white p-8 rounded-xl shadow-lg border border-[#dcd6f7]\">
      <div className=\"text-center mb-6\">
        <h2 className=\"text-2xl font-bold text-[#444444] mb-2\">Verify Your Account</h2>
        <p className=\"text-gray-600\">
          We've sent verification codes to your email{phone && ' and phone'}. Please enter them below.
        </p>
        <p className=\"text-sm text-[#7b5fc4] mt-2\">
          Time remaining: {formatTime(timeLeft)}
        </p>
      </div>

      <form onSubmit={handleSubmit} className=\"space-y-4\">
        {/* Email OTP */}
        <div>
          <label className=\"flex items-center gap-2 text-sm font-medium text-[#444444] mb-2\">
            <Mail className=\"h-4 w-4\" />
            Email Verification Code
          </label>
          <input
            type=\"text\"
            value={emailOtp}
            onChange={(e) => setEmailOtp(e.target.value.replace(/\\D/g, '').slice(0, 6))}
            placeholder=\"Enter 6-digit code\"
            className=\"w-full border border-[#dcd6f7] rounded-lg p-3 text-center text-lg font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-[#7b5fc4] focus:border-transparent\"
            maxLength={6}
            required
          />
          <p className=\"text-xs text-gray-500 mt-1\">Sent to: {email}</p>
        </div>

        {/* Phone OTP */}
        {phone && (
          <div>
            <label className=\"flex items-center gap-2 text-sm font-medium text-[#444444] mb-2\">
              <Phone className=\"h-4 w-4\" />
              Phone Verification Code
            </label>
            <input
              type=\"text\"
              value={phoneOtp}
              onChange={(e) => setPhoneOtp(e.target.value.replace(/\\D/g, '').slice(0, 6))}
              placeholder=\"Enter 6-digit code\"
              className=\"w-full border border-[#dcd6f7] rounded-lg p-3 text-center text-lg font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-[#7b5fc4] focus:border-transparent\"
              maxLength={6}
              required
            />
            <p className=\"text-xs text-gray-500 mt-1\">Sent to: {phone}</p>
          </div>
        )}

        <div className=\"flex gap-3 pt-4\">
          <button
            type=\"button\"
            onClick={onBack}
            className=\"flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors\"
          >
            <ArrowLeft className=\"h-4 w-4\" />
            Back
          </button>
          <button
            type=\"submit\"
            disabled={loading || !emailOtp || (phone && !phoneOtp)}
            className=\"flex-1 bg-[#7b5fc4] hover:bg-[#6b4fb4] text-white py-3 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors\"
          >
            {loading ? 'Verifying...' : 'Verify & Register'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default OTPVerification;