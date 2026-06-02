import PaymentStrategy from "./paymentStrategy.js";

export class PaypalPaymentStrategy extends PaymentStrategy {
  async processPayment(amount, orderDetails) {
    console.log(`[PayPal] Đang kết nối tới cổng thanh toán PayPal xử lý số tiền: ${amount}đ...`);
    
    // Giả lập cuộc gọi API PayPal thành công
    const fakeTransactionId = `PAYPAL_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
    console.log(`[PayPal] Giao dịch thành công! Mã giao dịch: ${fakeTransactionId}`);
    
    return {
      success: true,
      payment_status: "paid",
      transactionId: fakeTransactionId
    };
  }
}

export default PaypalPaymentStrategy;
