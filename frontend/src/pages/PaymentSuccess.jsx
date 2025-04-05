import React from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function PaymentSuccess() {
  const { paymentId } = useParams();
  const navigate = useNavigate();

  const handleViewOrder = () => {
    navigate(`/profile/order/`);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-lg text-center">
        <h2 className="text-2xl font-bold text-green-600">
          Thanh toán thành công!
        </h2>
        <p className="mt-2 text-gray-700">
          Cảm ơn bạn đã mua hàng. Đơn hàng của bạn đã được xác nhận.
        </p>
        <button
          onClick={handleViewOrder}
          className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition"
        >
          Xem đơn hàng
        </button>
      </div>
    </div>
  );
}
