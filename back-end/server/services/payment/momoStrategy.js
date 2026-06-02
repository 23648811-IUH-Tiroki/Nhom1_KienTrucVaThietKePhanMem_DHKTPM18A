import PaymentStrategy from "./paymentStrategy.js";

export class MomoPaymentStrategy extends PaymentStrategy {
  async processPayment(amount, orderDetails) {
    console.log(`[MoMo] Đang kết nối tới cổng thanh toán MoMo xử lý số tiền: ${amount}đ...`);
    
    // Giả lập cuộc gọi API MoMo thành công
    const fakeTransactionId = `MOMO_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
    console.log(`[MoMo] Giao dịch thành công! Mã giao dịch: ${fakeTransactionId}`);
    
    return {
      success: true,
      payment_status: "paid",
      transactionId: fakeTransactionId
    };
  }
}

export default MomoPaymentStrategy;
