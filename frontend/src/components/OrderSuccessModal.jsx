import { X, CheckCircle } from "lucide-react";

const OrderSuccessModal = ({ isOpen, onClose, onViewOrders, orderNumber }) => {
  console.log('OrderSuccessModal render:', { isOpen, orderNumber });
  
  if (!isOpen) {
    console.log('Modal not open, returning null');
    return null;
  }
  
  console.log('Modal is open, rendering...');

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
      onClick={(e) => {
        console.log('Modal backdrop clicked');
        e.stopPropagation();
      }}
    >
      <div 
        className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 relative animate-in fade-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="text-center">
          {/* Celebration Animation */}
          <div className="relative mb-6">
            <div className="w-20 h-20 bg-[#f3e8ff] rounded-full flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle className="h-12 w-12 text-[#7b5fc4]" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-4xl animate-pulse">🎉</div>
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-[#7b5fc4] mb-2">
            Congratulations!
          </h2>
          
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Your {orderNumber} Order Placed Successfully!
          </h3>
          
          <p className="text-gray-600 mb-6 leading-relaxed">
            Thank you for your purchase! Our admin will verify your payment screenshot and confirm your order shortly. You'll receive updates via email and SMS.
          </p>

          <div className="flex gap-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                console.log('Close button clicked');
                onClose();
              }}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                console.log('View Orders button clicked');
                onViewOrders();
              }}
              className="flex-1 px-4 py-2 bg-[#e1cffb] text-[#444444] rounded-lg hover:bg-[#b89ae8] transition cursor-pointer font-semibold"
            >
              View My Orders
            </button>
          </div>
        </div>
      </div>
      
      {/* Background celebration effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-200 via-pink-200 to-purple-200 opacity-20 animate-pulse"></div>
        <div className="absolute top-10 left-10 text-2xl animate-bounce delay-100">🎊</div>
        <div className="absolute top-20 right-20 text-2xl animate-bounce delay-200">✨</div>
        <div className="absolute bottom-20 left-20 text-2xl animate-bounce delay-300">🎉</div>
        <div className="absolute bottom-10 right-10 text-2xl animate-bounce delay-400">🎊</div>
      </div>
    </div>
  );
};

export default OrderSuccessModal;