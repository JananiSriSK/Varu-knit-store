import mongoose from "mongoose";

const paymentSettingsSchema = new mongoose.Schema({
  upiId: {
    type: String,
    required: true,
    default: "varuknits@paytm"
  },
  qrCodeImage: {
    public_id: String,
    url: String
  },
  paymentInstructions: {
    type: String,
    required: true,
    default: "1. Scan the QR code or use UPI ID to make payment\n2. Take a screenshot of the payment confirmation\n3. Upload the screenshot below\n4. Your order will be confirmed after payment verification"
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
});

export default mongoose.model("PaymentSettings", paymentSettingsSchema);