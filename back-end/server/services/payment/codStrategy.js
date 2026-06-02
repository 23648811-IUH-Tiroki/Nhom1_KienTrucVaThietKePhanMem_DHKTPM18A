import PaymentStrategy from "./paymentStrategy.js";

export class CodPaymentStrategy extends PaymentStrategy {
  async processPayment(amount, orderDetails) {
    // COD mặc định sẽ có trạng thái thanh toán là pending (thanh toán khi nhận hàng)
    console.log(`[COD] Xử lý đơn hàng COD giá trị: ${amount}đ. Không cần thanh toán trực tuyến.`);
    return {
      success: true,
      payment_status: "pending",
      transactionId: null
    };
  }
}

export default CodPaymentStrategy;
