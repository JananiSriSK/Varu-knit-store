import React, { useState, useEffect } from "react";
import { Upload } from "lucide-react";
import { useNotification } from "../../context/NotificationContext";
import api from "../../services/api";

const PaymentSettings = () => {
  const [paymentSettings, setPaymentSettings] = useState({
    upiId: '',
    paymentInstructions: '',
    qrCodeImage: null
  });
  const [loading, setLoading] = useState(false);
  const { addNotification } = useNotification();

  useEffect(() => {
    fetchPaymentSettings();
  }, []);

  const fetchPaymentSettings = async () => {
    try {
      const response = await api.getPaymentSettings();
      const data = await response.json();
      if (data.success) {
        setPaymentSettings(data.settings);
      }
    } catch (err) {
      console.error('Error fetching payment settings:', err);
    }
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const response = await api.updatePaymentSettings(paymentSettings);
      const data = await response.json();
      if (data.success) {
        addNotification('Payment settings updated successfully', 'success');
      } else {
        addNotification(data.message || 'Failed to update payment settings', 'error');
      }
    } catch (err) {
      addNotification('Failed to update payment settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPaymentSettings(prev => ({
          ...prev,
          qrCodeImage: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-xl p-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-6">Payment Settings</h3>
      
      <div className="space-y-6">
        {/* UPI ID */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            UPI ID
          </label>
          <input
            type="text"
            value={paymentSettings.upiId}
            onChange={(e) => setPaymentSettings(prev => ({ ...prev, upiId: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7b5fc4]"
            placeholder="Enter UPI ID (e.g., varuknits@paytm)"
          />
        </div>

        {/* QR Code Image */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            QR Code Image
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
            {paymentSettings.qrCodeImage?.url || paymentSettings.qrCodeImage ? (
              <div className="text-center">
                <img
                  src={paymentSettings.qrCodeImage?.url || paymentSettings.qrCodeImage}
                  alt="QR Code"
                  className="mx-auto h-32 w-32 object-contain mb-2"
                />
                <button
                  onClick={() => document.getElementById('qr-upload').click()}
                  className="text-[#7b5fc4] hover:text-[#6b4fb4]"
                >
                  Change Image
                </button>
              </div>
            ) : (
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                <button
                  onClick={() => document.getElementById('qr-upload').click()}
                  className="text-[#7b5fc4] hover:text-[#6b4fb4]"
                >
                  Upload QR Code
                </button>
              </div>
            )}
            <input
              id="qr-upload"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>
        </div>

        {/* Payment Instructions */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Payment Instructions
          </label>
          <textarea
            value={paymentSettings.paymentInstructions}
            onChange={(e) => setPaymentSettings(prev => ({ ...prev, paymentInstructions: e.target.value }))}
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7b5fc4]"
            placeholder="Enter payment instructions for customers"
          />
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleUpdate}
            disabled={loading}
            className="px-6 py-2 bg-[#7b5fc4] text-white rounded-lg hover:bg-[#6b4fb4] disabled:opacity-50 transition-colors"
          >
            {loading ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSettings;