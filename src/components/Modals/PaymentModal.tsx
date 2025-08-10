import { X } from "lucide-react";
import React, { useState } from "react";

const PaymentModal: React.FC<{ setOpen: (value: boolean) => void }> = ({
  setOpen,
}) => {
  const [paymentAmount, setPaymentAmount] = useState("5500");
  return (
    <div className="fixed inset-0 bg-[#00000052] flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Pay Maintenance</h2>
          <button
            onClick={() => setOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">
              Payment for August 2025
            </h3>
            <div className="space-y-1 text-sm text-blue-800">
              <div className="flex justify-between">
                <span>Maintenance Fee:</span>
                <span>₹5,000</span>
              </div>
              <div className="flex justify-between">
                <span>Late Payment Penalty:</span>
                <span>₹500</span>
              </div>
              <div className="flex justify-between font-semibold border-t border-blue-300 pt-2 mt-2">
                <span>Total Amount:</span>
                <span>₹5,500</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                ₹
              </span>
              <input
                type="text"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-medium"
              />
            </div>
            <p className="text-sm text-gray-500 mt-1">
              You can pay more than the pending amount if desired
            </p>
          </div>

          <button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg">
            Proceed to Payment
          </button>

          <div className="text-center">
            <p className="text-sm text-gray-500">
              Secure payment powered by{" "}
              <span className="font-medium text-blue-600">Razorpay</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
