export class PaymentStrategy {

  async processPayment(amount, orderDetails) {
    throw new Error("Hàm processPayment chưa được hiện thực!");
  }
}

export default PaymentStrategy;
