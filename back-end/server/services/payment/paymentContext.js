export class PaymentContext {
  constructor(strategy = null) {
    this.strategy = strategy;
  }
  
  setStrategy(strategy) {
    this.strategy = strategy;
  }


  async executePayment(amount, orderDetails) {
    if (!this.strategy) {
      throw new Error("Chiến lược thanh toán (Payment Strategy) chưa được thiết lập!");
    }
    return this.strategy.processPayment(amount, orderDetails);
  }
}

export default PaymentContext;
