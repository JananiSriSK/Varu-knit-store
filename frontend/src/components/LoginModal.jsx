import { useState } from "react";
import { X, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";
import api from "../services/api";
import axios from "axios";

const LoginModal = ({ isOpen, onClose }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", password: "", phone: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState("");
  const [otp, setOtp] = useState("");
  const [otpStep, setOtpStep] = useState(false);
  const [tempUserData, setTempUserData] = useState(null);
  const { dispatch } = useAuth();
  const { addNotification } = useNotification();

  const checkPasswordStrength = (password) => {
    if (password.length < 6) return { strength: "weak", message: "Too short" };
    if (password.length < 8) return { strength: "medium", message: "Medium" };
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) return { strength: "medium", message: "Medium" };
    return { strength: "strong", message: "Strong" };
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    if (name === "password" && isSignUp) {
      const result = checkPasswordStrength(value);
      setPasswordStrength(result);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isSignUp && !otpStep) {
        // Step 1: Send OTP for registration
        const response = await api.sendOTP({
          email: formData.email,
          phone: formData.phone,
          type: 'registration'
        });
        
        const data = await response.json();
        
        if (data.success) {
          setTempUserData(formData);
          setOtpStep(true);
          addNotification('OTP sent to your email!', 'success');
        } else {
          setError(data.message || 'Failed to send OTP');
          addNotification(data.message || 'Failed to send OTP', 'error');
        }
      } else if (isSignUp && otpStep) {
        // Step 2: Verify OTP and register
        const response = await api.verifyOTP({
          email: tempUserData.email,
          phone: tempUserData.phone,
          otp,
          userData: tempUserData
        });
        
        const data = await response.json();
        
        if (data.success) {
          localStorage.setItem('token', data.token);
          dispatch({ type: 'LOGIN_SUCCESS', payload: data.user });
          addNotification('Account created successfully!', 'success');
          onClose();
          window.location.reload();
        } else {
          setError(data.message || 'Invalid OTP');
          addNotification(data.message || 'Invalid OTP', 'error');
        }
      } else {
        // Login flow
        const response = await api.login({ email: formData.email, password: formData.password });
        const data = await response.json();
        
        if (data.success) {
          localStorage.setItem('token', data.token);
          dispatch({ type: 'LOGIN_SUCCESS', payload: data.user });
          
          // Sync guest cart and wishlist
          const guestCart = JSON.parse(localStorage.getItem('guestCart')) || [];
          const guestWishlist = JSON.parse(localStorage.getItem('guestWishlist')) || [];
          
          if (guestCart.length > 0 || guestWishlist.length > 0) {
            const userId = data.user.id;
            if (guestCart.length > 0) {
              localStorage.setItem(`cart_${userId}`, JSON.stringify(guestCart));
              localStorage.removeItem('guestCart');
            }
            if (guestWishlist.length > 0) {
              for (const productId of guestWishlist) {
                try {
                  await axios.post('http://localhost:5000/api/v1/wishlist', 
                    { productId },
                    {
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${data.token}`
                      }
                    }
                  );
                } catch (err) {
                  console.error('Error syncing wishlist item:', err);
                }
              }
              localStorage.removeItem('guestWishlist');
            }
          }
          
          addNotification('Logged in successfully!', 'success');
          onClose();
          
          if (data.user.role === 'admin') {
            window.location.href = '/admindashboard';
          } else {
            window.location.reload();
          }
        } else {
          setError(data.message || 'Authentication failed');
          addNotification(data.message || 'Authentication failed', 'error');
        }
      }
    } catch (err) {
      setError('Network error. Please try again.');
      addNotification('Network error. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const toggleForm = () => {
    setIsSignUp(!isSignUp);
    setFormData({ name: "", email: "", password: "", phone: "" });
    setError("");
    setOtpStep(false);
    setOtp("");
    setTempUserData(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 relative animate-in fade-in duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
        >
          <X className="h-6 w-6" />
        </button>

        <h2 className="text-2xl font-semibold text-center text-[#7b5fc4] mb-6">
          {isSignUp ? (otpStep ? "Verify OTP" : "Create Account") : "Welcome Back"}
        </h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && otpStep && (
            <div>
              <input
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                maxLength={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#d8b4fe] text-center text-lg tracking-widest"
              />
              <p className="text-sm text-gray-600 mt-2 text-center">
                OTP sent to {tempUserData?.email}
              </p>
            </div>
          )}
          
          {(!isSignUp || !otpStep) && (
            <>
              {isSignUp && (
                <>
                  <input
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#d8b4fe]"
                  />
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Phone Number (Optional)"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#d8b4fe]"
                  />
                </>
              )}

              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#d8b4fe]"
              />
              
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#d8b4fe]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              
              {isSignUp && passwordStrength && formData.password && (
                <div className="text-sm">
                  <span className={`font-medium ${
                    passwordStrength.strength === 'weak' ? 'text-red-500' :
                    passwordStrength.strength === 'medium' ? 'text-yellow-500' : 'text-green-500'
                  }`}>
                    Password Strength: {passwordStrength.message}
                  </span>
                  {passwordStrength.strength === 'weak' && (
                    <p className="text-xs text-gray-500 mt-1">
                      Use 8+ characters with uppercase, lowercase, and numbers
                    </p>
                  )}
                </div>
              )}
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#e1cffb] font-semibold text-[#444444] py-2 rounded-md hover:bg-[#b89ae8] transition disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Processing...' : 
             isSignUp ? (otpStep ? "Verify OTP" : "Send OTP") : "Log In"}
          </button>
        </form>

        {!isSignUp && (
          <div className="text-center mt-4">
            <a
              href="/forgot-password"
              className="text-sm text-[#a084ca] hover:underline"
            >
              Forgot Password?
            </a>
          </div>
        )}

        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}
            <button
              onClick={toggleForm}
              className="ml-1 text-[#a084ca] hover:underline cursor-pointer"
            >
              {isSignUp ? "Log In" : "Sign Up"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;