# Hướng Dẫn Chạy Frontend & Backend

## 📋 Mục Lục
- [Yêu Cầu Hệ Thống](#yêu-cầu-hệ-thống)
- [Cấu Trúc Dự Án](#cấu-trúc-dự-án)
- [Hướng Dẫn Cài Đặt Backend](#hướng-dẫn-cài-đặt-backend)
- [Hướng Dẫn Cài Đặt Frontend](#hướng-dẫn-cài-đặt-frontend)
- [Chạy Ứng Dụng](#chạy-ứng-dụng)
- [Biến Môi Trường](#biến-môi-trường)
- [Các Lệnh Hữu Ích](#các-lệnh-hữu-ích)

---

## 🖥️ Yêu Cầu Hệ Thống

### Tổng Quát
- **Node.js**: v18.0.0 hoặc cao hơn
- **npm**: v9.0.0 hoặc cao hơn
- **MongoDB**: Với Atlas (Cloud) hoặc Local

### Kiểm Tra Phiên Bản
```bash
node --version
npm --version
```

---

## 📁 Cấu Trúc Dự Án

```
Project/
├── back-end/              # Express.js + MongoDB Backend
│   ├── server/
│   │   ├── controllers/   # Xử lý logic business
│   │   ├── middleware/    # Authentication, validation, etc
│   │   ├── models/        # MongoDB schemas
│   │   ├── routes/        # API endpoints
│   │   └── server.js      # Entry point
│   ├── package.json
│   └── .env
│
├── front-end/             # React + Vite Frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── context/       # Context API
│   │   ├── stores/        # Redux stores
│   │   ├── utils/         # Utilities
│   │   ├── assets/        # Images, fonts, etc
│   │   └── App.jsx        # Root component
│   ├── package.json
│   └── vite.config.js
│
└── README.md              # File này
```

---

## 🚀 Hướng Dẫn Cài Đặt Backend

### 1. Điều Hướng Đến Thư Mục Backend
```bash
cd back-end
```

### 2. Cài Đặt Dependencies
```bash
npm install
```

### 3. Tạo File .env
Tạo file `.env` trong thư mục `back-end/` với nội dung:

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/<database>
# Hoặc local MongoDB:
# MONGODB_URI=mongodb://localhost:27017/<database>

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Secret
JWT_SECRET=your_jwt_secret_key_here

# CORS Configuration
CORS_ORIGIN=http://localhost:5173
```

**Ghi chú:**
- Thay `<username>`, `<password>`, `<database>` bằng thông tin MongoDB của bạn
- `JWT_SECRET` có thể là bất kỳ chuỗi bí mật nào

### 4. Kiểm Tra Kết Nối Database
Backend sẽ tự động kết nối MongoDB khi khởi động. Xem logs để xác nhận.

---

## 🎨 Hướng Dẫn Cài Đặt Frontend

### 1. Điều Hướng Đến Thư Mục Frontend
```bash
cd front-end
```

### 2. Cài Đặt Dependencies
```bash
npm install
```

### 3. Tạo File .env (nếu cần)
Tạo file `.env` trong thư mục `front-end/` (nếu ứng dụng cần cấu hình):

```env
# API Configuration
VITE_API_URL=http://localhost:5000/api
```

---

## ▶️ Chạy Ứng Dụng

### Option 1: Chạy Riêng Lẻ (2 Terminal)

#### Terminal 1 - Backend
```bash
cd back-end
npm start
```
Backend sẽ chạy trên: `http://localhost:5000`

#### Terminal 2 - Frontend
```bash
cd front-end
npm run dev
```
Frontend sẽ chạy trên: `http://localhost:5173`

### Option 2: Chạy Cùng Lúc (Từ Thư Mục Gốc)

Nếu bạn đã cài đặt `concurrently` trong frontend:

```bash
npm run dev
```

---

## 🔐 Biến Môi Trường

### Backend (.env)

| Biến | Mô Tả | Ví Dụ |
|------|-------|-------|
| `MONGODB_URI` | Kết nối MongoDB | `mongodb+srv://user:pass@cluster.mongodb.net/db` |
| `PORT` | Cổng máy chủ | `5000` |
| `NODE_ENV` | Môi trường | `development` hoặc `production` |
| `JWT_SECRET` | Bí mật JWT | `super_secret_key_123` |
| `CORS_ORIGIN` | Origin CORS được phép | `http://localhost:5173` |

### Frontend (.env)

| Biến | Mô Tả | Ví Dụ |
|------|-------|-------|
| `VITE_API_URL` | URL API Backend | `http://localhost:5000/api` |

---

## 🛠️ Các Lệnh Hữu Ích

### Backend
```bash
# Chạy server (với auto-reload)
npm start

# Chạy tests
npm test

# Chạy tests trong chế độ watch
npm run test:watch
```

### Frontend
```bash
# Chạy development server
npm run dev

# Build cho production
npm run build

# Preview build
npm run preview

# Lint code
npm run lint
```

---

## 📦 Công Nghệ Sử Dụng

### Backend
- **Express.js**: Web framework
- **MongoDB + Mongoose**: Database
- **JWT**: Authentication
- **Nodemon**: Auto-reload development
- **Jest + Supertest**: Testing

### Frontend
- **React 19**: UI library
- **Vite**: Build tool
- **TailwindCSS**: Styling
- **Ant Design**: UI components
- **Redux Toolkit**: State management
- **React Router**: Routing
- **Axios**: HTTP client

---

## 🐛 Xử Lý Sự Cố

### Backend không bắt đầu
```
❌ Lỗi: Cannot find module 'mongoose'
✅ Giải pháp: Chạy npm install trong thư mục back-end
```

```
❌ Lỗi: ECONNREFUSED - không kết nối được MongoDB
✅ Giải pháp: 
   - Kiểm tra MONGODB_URI trong .env
   - Đảm bảo MongoDB cluster hoạt động
   - Kiểm tra kết nối internet
```

### Frontend không bắt đầu
```
❌ Lỗi: port 5173 đang được sử dụng
✅ Giải pháp: Chạy npm run dev -- --port 5174
```

### CORS error
```
❌ Lỗi: Access to XMLHttpRequest blocked by CORS policy
✅ Giải pháp: 
   - Kiểm tra CORS_ORIGIN trong backend .env
   - Đảm bảo URL frontend đúng
```

---

## 📝 Ghi Chú Phát Triển

- Backend API endpoints bắt đầu bằng `/api`
- Tất cả requests cần header `Content-Type: application/json`
- JWT token được gửi trong header `Authorization: Bearer <token>`
- Frontend tự động được reload khi thay đổi code
- Backend cần restart để nhận thay đổi (dùng Nodemon tự động)

---

## 👥 Tác Giả

**Nhóm 1 - DHKTPM18A**
- Kiến Trúc và Thiết Kế Phần Mềm

---

## 📞 Hỗ Trợ

Nếu gặp vấn đề:
1. Kiểm tra logs trong console
2. Xác nhận file .env đã được tạo đúng
3. Kiểm tra Node.js và npm version
4. Xóa `node_modules` và `npm install` lại