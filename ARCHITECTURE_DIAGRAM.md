# 🏗️ Layer Architecture - Sơ Đồ Chi Tiết

## Quy Trình Request-Response

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser)                             │
└──────────────────────────────────────┬──────────────────────────────┘
                                        │ HTTP Request
                                        ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    🎨 PRESENTATION LAYER (Routes)                   │
│                                                                      │
│  GET /api/products  →  productRoutes.js  (HTTP Handler)             │
│  POST /api/products →  Validate input                               │
│  PUT /api/products/:id                                              │
│  DELETE /api/products/:id                                           │
└──────────────────────────────────────┬──────────────────────────────┘
                                        │ Gọi Service
                                        ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    💼 BUSINESS LAYER (Services)                     │
│                                                                      │
│  productService.getProducts()                                       │
│  - Xử lý business logic                                            │
│  - Tính toán, validate dữ liệu                                     │
│  - Gọi Database                                                     │
│  - Xử lý errors                                                     │
│  - Return dữ liệu cho routes                                       │
└──────────────────────────────────────┬──────────────────────────────┘
                                        │ Query Database
                                        ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    💾 DATA LAYER (Models)                           │
│                                                                      │
│  Product.find()        - MongoDB/Database Query                    │
│  Product.create()      - Thực thi CRUD operations                  │
│  Product.update()                                                   │
│  Product.delete()                                                   │
│                                                                      │
│  (Optional) Repository Pattern:                                     │
│  productRepository.js - Abstraction thêm                            │
└──────────────────────────────────────┬──────────────────────────────┘
                                        │ Database Response
                                        ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         💾 DATABASE                                 │
│                                                                      │
│  MongoDB / PostgreSQL / MySQL                                      │
│  - Lưu trữ dữ liệu                                                 │
└──────────────────────────────────────┬──────────────────────────────┘
                                        │ Data (JSON)
                                        ▼
│ ← Service xử lý & format dữ liệu
│ ← Route tạo HTTP response
│ ← Send JSON back to Client
                                        ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    CLIENT (nhận dữ liệu)                            │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Front-end Layer Flow

```
┌──────────────────────────────────────────────────────────┐
│              USER INTERACTION (Buttons, Forms)            │
└──────────────────────┬───────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────┐
│        🎨 PRESENTATION (Pages & Components)              │
│  - HomePage.jsx                                         │
│  - ProductPage.jsx                                      │
│  - Render UI elements                                   │
│  - Collect user input                                   │
└──────────────────────┬───────────────────────────────────┘
                       │ gọi useHook / service
                       ▼
┌──────────────────────────────────────────────────────────┐
│     💼 BUSINESS LAYER (Services & Custom Hooks)          │
│                                                          │
│  useProduct() - Custom Hook                             │
│  - State management (useState)                          │
│  - Gọi API service                                      │
│  - Xử lý loading, error states                          │
│                                                          │
│  productService.js - API Calls                          │
│  - axios requests                                       │
│  - Call back-end API                                    │
└──────────────────────┬───────────────────────────────────┘
                       │ HTTP Request
                       ▼
┌──────────────────────────────────────────────────────────┐
│     🎯 SHARED (Components, Context, Utils)              │
│  - Header / Footer / Sidebar components                 │
│  - AuthContext / CartContext                            │
│  - Formatters, validators helpers                       │
└──────────────────────┬───────────────────────────────────┘
                       │ HTTP Response
                       ▼
┌──────────────────────────────────────────────────────────┐
│              BACK-END API Response                        │
└──────────────────────────────────────────────────────────┘
```

---

## Ví Dụ: Product Management Flow

### 1️⃣ Backend Request Path

```
Client: GET /api/products
         ↓
productRoutes.js (Presentation)
  ├─ Validate req.query
  ├─ Call productService.getProducts()
  │
productService.js (Business)
  ├─ Check authorization
  ├─ Apply filters/sorting
  ├─ Call Product.find()
  │
Product.js (Data/Model)
  ├─ Query MongoDB
  ├─ Return results
  │
Response: { success: true, data: [...] }
```

### 2️⃣ Frontend Request Path

```
User clicks "Load Products" button
         ↓
ProductPage.jsx (Presentation)
  ├─ const { products } = useProduct()
  │
useProduct.js (Hook - Business)
  ├─ productService.getProducts()
  │
productService.js (Service)
  ├─ apiClient.get('/api/products')
  │
✅ Back-end response
         ↓
useProduct Hook returns products
         ↓
ProductPage renders <ProductList products={products} />
```

---

## 📊 Tỷ Lệ Trách Nhiệm

| Layer | Middleware | Service | Model | Route |
|-------|-----------|---------|-------|-------|
| **Presentation** | ✅ | ❌ | ❌ | ✅ |
| **Business** | ❌ | ✅ | ❌ | ❌ |
| **Data** | ❌ | ❌ | ✅ | ❌ |

- ✅ = Liên quan
- ❌ = Không liên quan

---

## 🔄 Authentication Flow Example

### Back-end

```
1. POST /api/auth/login
   ↓ authRoutes.js
2. authService.login(email, password)
   ├─ Validate input
   ├─ User.findByEmail(email)
   ├─ Compare password
   ├─ Generate JWT token
   ↓
3. Send token to client
```

### Front-end

```
1. submitLoginForm(email, password)
   ↓ LoginPage.jsx
2. authService.login(email, password)
   ↓
3. useAuth hook
   ├─ Save token to localStorage
   ├─ Update context
   ├─ Redirect to dashboard
```

---

## 💡 Best Practices

### ✅ DO:
- ✅ Services xử lý logic, Routes xử lý HTTP
- ✅ Models chỉ chứa schema/validation
- ✅ Reuse services & components
- ✅ Centralize API config
- ✅ Proper error handling

### ❌ DON'T:
- ❌ Không để logic trong routes
- ❌ Không call DB trực tiếp trong routes  
- ❌ Không mix business logic vào components
- ❌ Không hard-code API URLs
- ❌ Không ignore errors

---

Generated: Architecture Guide v1.0
