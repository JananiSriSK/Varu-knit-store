import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";
import LoginModal from "../components/LoginModal";
import ConfirmationModal from "../components/ConfirmationModal";
import OrderSuccessModal from "../components/OrderSuccessModal";
import api from "../services/api";

const Checkout = () => {
  const { items, clearCart } = useCart();
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const navigate = useNavigate();

  const [products, setProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const [orderLoading, setOrderLoading] = useState(false);
  const [paymentScreenshot, setPaymentScreenshot] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [useManualAddress, setUseManualAddress] = useState(false);
  const [showBackModal, setShowBackModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);

  

  const [shippingInfo, setShippingInfo] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    country: "",
    pinCode: "",
    phoneNo: "",
  });

  useEffect(() => {
    const fetchProductDetails = async () => {
      if (items.length === 0) {
        navigate("/cart");
        return;
      }

      // Check if user is authenticated for checkout
      if (!user) {
        addNotification("Please login to place an order", "warning");
        setShowLoginModal(true);
        return;
      }

      // Use existing product data from cart items instead of fetching
      const productDetails = {};
      items.forEach((item) => {
        if (item.product && item.name && item.price) {
          productDetails[item.product] = {
            _id: item.product,
            name: item.name,
            price: item.price,
            image: [{ url: item.image }],
          };
        }
      });

      setProducts(productDetails);
      
      // Fetch user addresses
      try {
        const addressResponse = await api.getAddresses();
        const addressData = await addressResponse.json();
        if (addressData.success) {
          setAddresses(addressData.addresses);
          // Auto-select default address
          const defaultAddress = addressData.addresses.find(addr => addr.isDefault);
          if (defaultAddress && !useManualAddress) {
            setSelectedAddressId(defaultAddress._id);
            setShippingInfo({
              name: defaultAddress.name,
              address: defaultAddress.address,
              city: defaultAddress.city,
              state: defaultAddress.state,
              country: defaultAddress.country,
              pinCode: defaultAddress.pinCode,
              phoneNo: defaultAddress.phoneNo,
            });
          }
        }
      } catch (err) {
        console.error('Error fetching addresses:', err);
      }
      
      setLoading(false);
    };

    fetchProductDetails();
  }, [items, navigate]);

  const subtotal = items.reduce((sum, item) => {
    const product = products[item.product];
    return sum + (product?.price || 0) * item.quantity;
  }, 0);

  const shipping = subtotal >= 999 ? 0 : 100;
  const total = subtotal + shipping;

  const handleInputChange = (e) => {
    setShippingInfo({
      ...shippingInfo,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddressSelect = (e) => {
    const addressId = e.target.value;
    setSelectedAddressId(addressId);
    
    if (addressId === "manual") {
      setUseManualAddress(true);
      setShippingInfo({
        name: "",
        address: "",
        city: "",
        state: "",
        country: "",
        pinCode: "",
        phoneNo: "",
      });
    } else if (addressId) {
      setUseManualAddress(false);
      const selectedAddress = addresses.find(addr => addr._id === addressId);
      if (selectedAddress) {
        setShippingInfo({
          name: selectedAddress.name,
          address: selectedAddress.address,
          city: selectedAddress.city,
          state: selectedAddress.state,
          country: selectedAddress.country,
          pinCode: selectedAddress.pinCode,
          phoneNo: selectedAddress.phoneNo,
        });
      }
    }
  };

  const handleFileChange = (e) => {
    setPaymentScreenshot(e.target.files[0]);
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();

    if (!paymentScreenshot) {
      addNotification("Please upload payment screenshot", "warning");
      return;
    }

    setShowOrderModal(true);
  };

  const confirmOrder = async () => {
    setOrderLoading(true);

    try {
      // Convert screenshot to base64
      const screenshotBase64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(paymentScreenshot);
      });

      // Validate all items have required data
      const validOrderItems = items
        .filter((item) => {
          const product = products[item.product];
          return (
            product &&
            product.name &&
            product.price &&
            product.image?.[0]?.url &&
            item.product &&
            item.size
          );
        })
        .map((item) => ({
          name: products[item.product].name,
          price: products[item.product].price,
          quantity: item.quantity,
          image: products[item.product].image[0].url,
          product: item.product,
          size: item.size,
        }));

      if (validOrderItems.length === 0) {
        addNotification(
          "No valid items found. Please refresh and try again.",
          "error"
        );
        return;
      }

      // Save address if requested
      const saveAddressCheckbox = document.querySelector('input[name="saveAddress"]');
      if (useManualAddress && saveAddressCheckbox?.checked) {
        try {
          await api.addAddress({
            ...shippingInfo,
            isDefault: addresses.length === 0
          });
        } catch (err) {
          console.error('Failed to save address:', err);
        }
      }

      const orderData = {
        shippingInfo: {
          ...shippingInfo,
          pinCode: Number(shippingInfo.pinCode),
        },
        orderItems: validOrderItems,
        paymentInfo: {
          id: "payment_screenshot_" + Date.now(),
          status: "pending",
          screenshot: screenshotBase64,
        },
        itemPrice: subtotal,
        taxPrice: 0,
        shippingPrice: shipping,
        totalPrice: total,
      };

      const response = await api.createOrder(orderData);

      const data = await response.json();

      if (data.success) {
        clearCart();
        setShowOrderModal(false);
        addNotification(
          "🎉 Order placed successfully! Admin will verify your payment screenshot and confirm the order.",
          "success"
        );
        navigate("/my-profile?tab=orders");
      } else {
        addNotification(data.message || "Failed to place order", "error");
      }
    } catch (err) {
      console.error("Order error:", err);
      addNotification("Failed to place order. Please try again.", "error");
    } finally {
      setOrderLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f4ff] py-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#7b5fc4]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f4ff] pt-20 pb-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => setShowBackModal(true)}
            className="flex items-center gap-2 text-[#7b5fc4] hover:text-[#6b4fb4] transition-colors bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 hover:shadow-md"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="font-medium">Back to Cart</span>
          </button>
          
          <div className="w-24"></div> {/* Spacer for centering */}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Shipping & Payment Form */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <form onSubmit={handleSubmitOrder} className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">
                  Shipping Information
                </h2>
                
                {/* Address Selection */}
                {addresses.length > 0 && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Address
                    </label>
                    <select
                      value={selectedAddressId}
                      onChange={handleAddressSelect}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#d8b4fe]"
                    >
                      <option value="">Choose an address</option>
                      {addresses.map((address) => (
                        <option key={address._id} value={address._id}>
                          {address.name} - {address.address}, {address.city}
                          {address.isDefault && " (Default)"}
                        </option>
                      ))}
                      <option value="manual">Enter new address</option>
                    </select>
                  </div>
                )}
                
                {/* Manual Address Form */}
                {(useManualAddress || addresses.length === 0 || selectedAddressId) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="name"
                      placeholder="Full Name"
                      value={shippingInfo.name}
                      onChange={handleInputChange}
                      required
                      disabled={!useManualAddress && selectedAddressId && selectedAddressId !== "manual"}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#d8b4fe] disabled:bg-gray-100"
                    />
                    <input
                      type="tel"
                      name="phoneNo"
                      placeholder="Phone Number"
                      value={shippingInfo.phoneNo}
                      onChange={handleInputChange}
                      required
                      disabled={!useManualAddress && selectedAddressId && selectedAddressId !== "manual"}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#d8b4fe] disabled:bg-gray-100"
                    />
                    <textarea
                      name="address"
                      placeholder="Address"
                      value={shippingInfo.address}
                      onChange={handleInputChange}
                      required
                      rows="2"
                      disabled={!useManualAddress && selectedAddressId && selectedAddressId !== "manual"}
                      className="col-span-2 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#d8b4fe] disabled:bg-gray-100"
                    />
                    <input
                      type="text"
                      name="city"
                      placeholder="City"
                      value={shippingInfo.city}
                      onChange={handleInputChange}
                      required
                      disabled={!useManualAddress && selectedAddressId && selectedAddressId !== "manual"}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#d8b4fe] disabled:bg-gray-100"
                    />
                    <input
                      type="text"
                      name="state"
                      placeholder="State"
                      value={shippingInfo.state}
                      onChange={handleInputChange}
                      required
                      disabled={!useManualAddress && selectedAddressId && selectedAddressId !== "manual"}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#d8b4fe] disabled:bg-gray-100"
                    />
                    <input
                      type="text"
                      name="country"
                      placeholder="Country"
                      value={shippingInfo.country}
                      onChange={handleInputChange}
                      required
                      disabled={!useManualAddress && selectedAddressId && selectedAddressId !== "manual"}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#d8b4fe] disabled:bg-gray-100"
                    />
                    <input
                      type="text"
                      name="pinCode"
                      placeholder="Pin Code"
                      value={shippingInfo.pinCode}
                      onChange={handleInputChange}
                      required
                      disabled={!useManualAddress && selectedAddressId && selectedAddressId !== "manual"}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#d8b4fe] disabled:bg-gray-100"
                    />
                  </div>
                )}
                
                {/* Save Address Option for Manual Entry */}
                {useManualAddress && (
                  <div className="mt-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="saveAddress"
                        className="rounded"
                      />
                      <span className="text-sm">Save this address to my profile</span>
                    </label>
                  </div>
                )}
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-4">Payment</h2>
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <h3 className="font-semibold mb-2">Payment Instructions:</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    1. Scan the QR code below or use UPI ID: varuknits@paytm
                  </p>
                  <p className="text-sm text-gray-600 mb-2">
                    2. Pay the total amount: ₹{total.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-600">
                    3. Upload the payment screenshot below
                  </p>
                </div>

                {/* QR Code Placeholder */}
                <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-4">
                  <div className="w-48 h-48 mx-auto bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-gray-500">QR Code</span>
                  </div>
                  <p className="mt-2 text-sm text-gray-600">
                    UPI ID: varuknits@paytm
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Payment Screenshot *
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#d8b4fe]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={orderLoading}
                className="w-full bg-[#e1cffb] text-[#444444] py-3 rounded-lg hover:bg-[#b89ae8] transition font-semibold disabled:opacity-50"
              >
                {orderLoading ? "Placing Order..." : "Place Order"}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

            <div className="space-y-4 mb-6">
              {items.map((item) => {
                const product = products[item.product];
                if (!product) return null;

                return (
                  <div
                    key={`${item.product}-${item.size}`}
                    className="flex items-center space-x-4"
                  >
                    <img
                      src={product.image?.[0]?.url || "/placeholder.jpg"}
                      alt={product.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium">{product.name}</h3>
                      <p className="text-sm text-gray-600">Size: {item.size}</p>
                      <p className="text-sm text-gray-600">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="font-semibold">
                      ₹{(product.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>
                  {shipping === 0 ? "Free" : `₹${shipping.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between font-semibold text-lg border-t pt-2">
                <span>Total</span>
                <span className="text-[#7b5fc4]">₹{total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />

      {/* Back Navigation Modal */}
      <ConfirmationModal
        isOpen={showBackModal}
        onClose={() => setShowBackModal(false)}
        onConfirm={() => navigate("/cart")}
        title="Leave Checkout?"
        message="Are you sure you want to go back to cart? Your shipping information will be lost."
        confirmText="Go Back"
        cancelText="Stay Here"
        type="default"
      />

      {/* Order Confirmation Modal */}
      <ConfirmationModal
        isOpen={showOrderModal}
        onClose={() => setShowOrderModal(false)}
        onConfirm={confirmOrder}
        title="Confirm Order"
        message={`Are you sure you want to place this order for ₹${total.toFixed(2)}? Please ensure you have made the payment and uploaded the correct screenshot.`}
        confirmText="Place Order"
        cancelText="Review Again"
        type="default"
      />
      

    </div>
  );
};

export default Checkout;
