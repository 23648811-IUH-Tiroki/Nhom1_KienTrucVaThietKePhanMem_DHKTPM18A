
/**
 * Hàm tạo và in hóa đơn
 * @param {Object} order - Đơn hàng cần tạo hóa đơn
 * @param {Function} formatDisplayDate - Hàm định dạng ngày tháng
 */
export const generateInvoice = (order, formatDisplayDate) => {
  const printWindow = window.open("", "_blank");
  printWindow.document.write(`
    <html>
      <head>
        <title>Hóa đơn #${order._id}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .invoice-details { margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .total { font-weight: bold; margin-top: 20px; text-align: right; }
          .footer { margin-top: 50px; text-align: center; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>HÓA ĐƠN MUA HÀNG</h1>
          <p>PetShop</p>
        </div>
        
        <div class="invoice-details">
          <p><strong>Mã đơn hàng:</strong> ${order._id}</p>
          <p><strong>Ngày tạo:</strong> ${formatDisplayDate(
            order.createdAt
          )}</p>
          <p><strong>Khách hàng:</strong> ${order.user_id.fullName}</p>
          <p><strong>Địa chỉ:</strong> ${order.user_id.address}</p>
          <p><strong>Email:</strong> ${order.user_id.email}</p>
          <p><strong>Số điện thoại:</strong> ${order.user_id.phone}</p>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>STT</th>
              <th>Sản phẩm</th>
              <th>Số lượng</th>
              <th>Đơn giá</th>
              <th>Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            ${order.items
              .map(
                (item, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${item.product_id.name}</td>
                <td>${item.quantity}</td>
                <td>${item.product_id.price.toLocaleString()} VND</td>
                <td>${(
                  item.quantity * item.product_id.price
                ).toLocaleString()} VND</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
        
        <div class="total">
          <p>Tổng thanh toán: ${order.total_price.toLocaleString()} VND</p>
        </div>
        
        <div class="footer">
          <p>Cảm ơn quý khách đã mua hàng tại PetShop!</p>
        </div>
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.print();
};
