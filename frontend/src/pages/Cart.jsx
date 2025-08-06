import React, { useState } from "react";

const initialCartItems = [
  {
    id: 1,
    name: "Apple Watch Series 7 – 44mm",
    color: "Golden",
    price: 259,
    quantity: 1,
    image: "/images/apple-watch.png",
  },
  {
    id: 2,
    name: "Beylob 90 Speaker",
    color: "Space Gray",
    price: 99,
    quantity: 1,
    image: "/images/beylob-90.png",
  },
  {
    id: 3,
    name: "Beoplay M5 Bluetooth Speaker",
    color: "Silver Collection",
    price: 129,
    quantity: 1,
    image: "/images/beoplay-m5.png",
  },
  {
    id: 4,
    name: "Apple Watch Series 7 – 44mm",
    color: "Golden",
    price: 379,
    quantity: 1,
    image: "/images/apple-watch.png",
  },
];

const Cart = () => {
  const [cartItems, setCartItems] = useState(initialCartItems);

  const handleQuantityChange = (id, delta) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: Math.max(1, item.quantity + delta), // prevent 0 or negative
            }
          : item
      )
    );
  };

  const handleRemoveItem = (id) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const subtotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  const shipping = 10;
  const total = subtotal + shipping;

  return (
    <div className="max-w-6xl mx-auto px-8 py-30 grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Left: Items */}
      <div className="md:col-span-2">
        <h2 className="text-2xl font-semibold mb-4">Your Cart</h2>
        <p className="text-sm text-gray-500 mb-6">
          {cartItems.length} Items in cart
        </p>

        <div className="space-y-6">
          {cartItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between border-0 pb-4"
            >
              <div className="flex items-center gap-4">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded"
                />
                <div>
                  <h4 className="font-medium">{item.name}</h4>
                  <p className="text-sm text-gray-500">{item.color}</p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                {/* Quantity buttons */}
                <div className="flex items-center border-solid shadow-md px-2 py-1 rounded">
                  <button
                    onClick={() => handleQuantityChange(item.id, -1)}
                    className="px-2 text-lg font-semibold"
                  >
                    −
                  </button>
                  <span className="px-2">{item.quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(item.id, 1)}
                    className="px-2 text-lg font-semibold"
                  >
                    +
                  </button>
                </div>

                <p className="font-medium">
                  ₹{(item.price * item.quantity).toFixed(2)}
                </p>
                <button
                  onClick={() => handleRemoveItem(item.id)}
                  className="text-gray-400 hover:text-red-500 text-xl"
                >
                  &times;
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right: Summary */}
      <div className="bg-gray-50 p-6 rounded-md shadow-md h-fit w-85">
        <h3 className="text-xl font-semibold mb-4">Order Summary</h3>
        <div className="space-y-3 text-sm text-gray-700">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax</span>
            <span>₹0</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>₹{shipping.toFixed(2)}</span>
          </div>
          <hr />
          <div className="flex justify-between font-semibold text-black text-base">
            <span>Total</span>
            <span>₹{total.toFixed(2)}</span>
          </div>
        </div>

        <button className="mt-6 w-full bg-black text-white py-2 rounded hover:bg-gray-800 transition">
          Confirm payment
        </button>
        <button className="mt-3 w-full border border-gray-300 py-2 rounded text-sm hover:bg-gray-100 transition">
          Continue Shopping
        </button>
      </div>
    </div>
  );
};

export default Cart;
