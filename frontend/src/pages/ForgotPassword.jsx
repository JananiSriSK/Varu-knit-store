import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [useOTP, setUseOTP] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { addNotification } = useNotification();
  const { dispatch } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (useOTP && !otpSent) {
        // Send OTP for password reset
        const response = await api.sendOTP({ email, type: 'password_reset' });
        const data = await response.json();

        if (data.success) {
          setOtpSent(true);
          addNotification('OTP sent to your email!', 'success');
        } else {
          addNotification(data.message || 'Failed to send OTP', 'error');
        }
      } else if (useOTP && otpSent) {
        // Reset password with OTP
        if (newPassword !== confirmPassword) {
          addNotification('Passwords do not match', 'error');
          return;
        }

        const response = await api.resetPasswordWithOTP({ email, otp, newPassword });
        const data = await response.json();

        if (data.success) {
          localStorage.setItem('token', data.token);
          dispatch({ type: 'LOGIN_SUCCESS', payload: data.user });
          addNotification('Password reset successfully!', 'success');
          navigate('/');
        } else {
          addNotification(data.message || 'Invalid OTP', 'error');
        }
      } else {
        // Email reset link
        const response = await api.forgotPassword({ email });
        const data = await response.json();

        if (data.success) {
          setEmailSent(true);
          addNotification('Password reset email sent successfully!', 'success');
        } else {
          addNotification(data.message || 'Failed to send reset email', 'error');
        }
      }
    } catch (error) {
      addNotification('Network error. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen bg-[#f7f4ff] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center relative">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Check Your Email</h2>
          <p className="text-gray-600 mb-6">
            We've sent a password reset link to <strong>{email}</strong>
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Didn't receive the email? Check your spam folder or try again.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center text-[#7b5fc4] hover:underline"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen backdrop-blur-sm flex items-center justify-center bg-[#f7f4ff] px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 relative">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Forgot Password?</h2>
          <p className="text-gray-600">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center space-x-2 mb-4">
            <input
              type="checkbox"
              id="useOTP"
              checked={useOTP}
              onChange={(e) => setUseOTP(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="useOTP" className="text-sm text-gray-600">
              Use OTP instead of email link
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7b5fc4] focus:border-transparent"
              placeholder="Enter your email"
            />
          </div>

          {useOTP && otpSent && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter OTP
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  maxLength={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7b5fc4] focus:border-transparent text-center"
                  placeholder="Enter 6-digit OTP"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7b5fc4] focus:border-transparent"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7b5fc4] focus:border-transparent"
                  placeholder="Confirm new password"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#7b5fc4] text-white py-2 px-4 rounded-md hover:bg-[#6b4fb4] focus:outline-none focus:ring-2 focus:ring-[#7b5fc4] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Processing...' : 
             useOTP ? (otpSent ? 'Reset Password' : 'Send OTP') : 'Send Reset Link'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="inline-flex items-center text-[#7b5fc4] hover:underline"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;