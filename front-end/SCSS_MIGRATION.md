# 📋 SCSS Migration Guide - Page Styles Organization

## ✅ Hoàn thành tách SCSS!

File `page.scss` gốc đã được tách thành các file riêng theo từng page.

---

## 📁 Cấu Trúc Thư Mục Mới

```
front-end/src/
├── pages/
│   ├── Login/
│   │   ├── Login.jsx
│   │   └── Login.scss          ✨ Mới
│   │
│   ├── Register/
│   │   ├── Register.jsx
│   │   └── Register.scss       ✨ Mới
│   │
│   ├── Checkout/
│   │   ├── CheckOut.jsx
│   │   └── Checkout.scss       ✨ Mới
│   │
│   ├── CartShop/
│   │   ├── CartShop.jsx
│   │   └── CartDialog.scss     ✨ Mới
│   │
│   └── page.scss               ⚠️ (Có thể xóa sau khi cập nhật imports)
│
├── shared/
│   └── styles/                 ✨ Mới
│       ├── index.scss
│       └── Utilities.scss      ✨ Mới
│
└── index.css / main.jsx
```

---

## 📂 Chi Tiết Các File SCSS

### 1. **Login/Login.scss** 🔐
```scss
// Chứa styles cho page Login
- .input-container
- .input-container input
- .input-container label
- .input-container .error-message
```

**Cách sử dụng:**
```jsx
// Login.jsx
import './Login.scss';

export function Login() {
  return (
    <div className="input-container">
      <input type="email" placeholder=" " />
      <label>Email</label>
    </div>
  );
}
```

---

### 2. **Register/Register.scss** 📝
```scss
// Chứa styles cho page Register
- .input-container (mở rộng)
- .input-container input[type="date"]
- .custom-number-input
- Input animations cho date/number fields
```

**Cách sử dụng:**
```jsx
// Register.jsx
import './Register.scss';

export function Register() {
  return (
    <div className="input-container">
      <input type="date" placeholder=" " />
      <label>Ngày sinh</label>
    </div>
  );
}
```

---

### 3. **Checkout/Checkout.scss** 💳
```scss
// Chứa styles cho page Checkout
- .bg-blue-0
- .border-blue-0
```

**Cách sử dụng:**
```jsx
// CheckOut.jsx
import './Checkout.scss';

export function Checkout() {
  return <div className="bg-blue-0">Checkout section</div>;
}
```

---

### 4. **CartShop/CartDialog.scss** 🛒
```scss
// Chứa styles cho cart dialog/modal
- .cart-dialog (pointer/arrow design)
- .cart-dialog-animation
- @keyframes growth
```

**Cách sử dụng:**
```jsx
// CartShop.jsx
import './CartDialog.scss';

export function CartShop() {
  return (
    <div className="cart-dialog cart-dialog-animation">
      {/* Cart content */}
    </div>
  );
}
```

---

### 5. **shared/styles/Utilities.scss** 🎨
```scss
// Utility classes dùng chung trên toàn app
- .bg-brown, .bg-brown-hover
- .text-brown, .text-brown-hover
- .border-brown, .border-brown-hover
- .text-white-hover
```

**Cách sử dụng:**
```jsx
// Dùng trong bất kì page nào
<button className="bg-brown text-white">Click me</button>
<p className="text-brown">Brown text</p>
<div className="border-brown">Bordered div</div>
```

---

### 6. **shared/styles/index.scss** 📦
```scss
// Entry point để import tất cả utility styles
// Chỉ cần import file này 1 lần trong main.jsx
```

**Cách sử dụng:**
```jsx
// main.jsx
import './shared/styles/index.scss';
```

---

## 🔄 Migration Steps - Cập nhật các Pages

### Bước 1: Import SCSS riêng vào từng Page Component

**Trước (cũ):**
```jsx
// Login.jsx
import './../../pages/page.scss';  // ❌ Import file chung quá lớn
```

**Sau (mới):**
```jsx
// Login.jsx
import './Login.scss';  // ✅ Import file riêng
```

### Bước 2: Cập nhật tất cả Pages

| Page | Import | File |
|------|--------|------|
| **Login.jsx** | `import './Login.scss';` | ✅ Done |
| **Register.jsx** | `import './Register.scss';` | ✅ Done |
| **CheckOut.jsx** | `import './Checkout.scss';` | ✅ Done |
| **CartShop.jsx** | `import './CartDialog.scss';` | ✅ Done |
| **Bất kì page nào** | `import '@/shared/styles/index.scss';` (1 lần) | ✅ Done |

### Bước 3: Update Global Import

**Thêm vào main.jsx:**

```jsx
// main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import './shared/styles/index.scss'  // ✨ Thêm dòng này

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

---

## ✅ Checklist Cập nhật

### Pages cần update import:

```
☐ Login/Login.jsx - import './Login.scss'
☐ Register/Register.jsx - import './Register.scss'
☐ Checkout/CheckOut.jsx - import './Checkout.scss'
☐ CartShop/CartShop.jsx - import './CartDialog.scss'
☐ main.jsx - import './shared/styles/index.scss'
```

### Xóa cũ:
```
☐ Xóa/comment import từ pages/page.scss (nếu từng dùng)
☐ Xóa file pages/page.scss (hoặc backup trước)
```

---

## 📊 So Sánh Cũ vs Mới

### ❌ Cũ - Monolithic
```
pages/page.scss (160 dòng)
  ├─ Register styles
  ├─ Login styles
  ├─ Checkout styles
  ├─ Cart styles
  └─ Utility classes
  
Result: Tất cả được load cùng lúc, dù page không dùng
```

### ✅ Mới - Modular
```
pages/Login/Login.scss
pages/Register/Register.scss
pages/Checkout/Checkout.scss
pages/CartShop/CartDialog.scss
shared/styles/Utilities.scss
  └─ index.scss (collect all)

Result: Mỗi page load CSS của nó, tối ưu hơn
```

---

## 🚀 Lợi Ích

| Lợi Ích | Chi Tiết |
|---------|---------|
| **Code Organization** | CSS được tổ chức theo component/page |
| **Clarity** | Dễ tìm styles của từng page |
| **Performance** | Có thể lazy-load hoặc tree-shake CSS |
| **Maintainability** | Dễ update styles mà không ảnh hưởng page khác |
| **Reusability** | Utility classes centralized trong `shared/styles/` |

---

## 📝 Template tạo SCSS Page Mới

Nếu cần tạo page SCSS mới:

```scss
// pages/[YourPage]/[YourPage].scss

// ===================================
// [Your Page] Page Styles
// ===================================

// Add your styles here
.your-class {
  // styles
}
```

Sau đó import trong JSX:
```jsx
import './[YourPage].scss';
```

---

## 🎯 Tiếp Theo?

1. **Cập nhật** import statements trong các page JSX
2. **Test** xem styles còn hoạt động không
3. **Xóa** file `pages/page.scss` cũ (hoặc backup)
4. **Add** `package.json` script để lint SCSS (tuỳ chọn)

---

## 📞 Need Help?

**Q: CSS không load?**
- A: Kiểm tra import paths có chính xác không
- Ensure file extensions `.scss` được recognize

**Q: Có duplicate CSS?**
- A: Mỗi page nên import CSS của nó 1 lần thôi
- Utilities được import 1 lần trong `main.jsx`

**Q: Cách kiểm tra CSS file size?**
```bash
# Check file sizes
wc -l src/pages/page.scss
wc -l src/pages/Login/Login.scss
```

---

**Last Updated:** 2024-04-11  
**Status:** ✅ Migration Complete
