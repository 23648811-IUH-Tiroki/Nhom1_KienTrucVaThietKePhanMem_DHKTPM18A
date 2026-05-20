# Hướng Dẫn Test API Authentication Trên Postman

## 📋 Thông Tin Các Endpoint

> Lưu ý: các URL mẫu bên dưới đang dùng `5002` theo bộ test hiện tại. Nếu backend của bạn đang chạy ở port khác, hãy thay bằng đúng `PORT` đang mở. Trong source code hiện tại, server mặc định là `5000` nếu không cấu hình `.env`.

### 1. **Sign Up - Đăng ký trực tiếp** 
- **Method**: POST
- **URL**: `http://localhost:5002/api/auth/signup`
- **Body**:
```json
{
  "password": "password123",
  "lastName": "Nguyễn",
  "firstName": "An",
  "email": "an@example.com",
  "birthDate": "1990-01-15"
}
```
- **Response**: Trả về thông tin user đã đăng ký
- **Lưu ý**: Email phải chưa tồn tại trong hệ thống

---

### 2. **Send Signup Code - Gửi mã xác thực đăng ký**
- **Method**: POST
- **URL**: `http://localhost:5002/api/auth/send-signup-code`
- **Body**:
```json
{
  "password": "password456",
  "lastName": "Trần",
  "firstName": "Bình",
  "email": "binh@example.com",
  "birthDate": "1995-05-20"
}
```
- **Response**: Thông báo đã gửi mã xác thực
- **Lưu ý**: Mã OTP sẽ được gửi qua email, có hiệu lực 60 giây, mỗi email chỉ có thể gửi 1 lần trong 60 giây (chống spam)

---

### 3. **Verify Signup - Xác thực mã đăng ký**
- **Method**: POST
- **URL**: `http://localhost:5002/api/auth/verify-signup`
- **Body**:
```json
{
  "email": "binh@example.com",
  "code": "123456"
}
```
- **Response**: Thông báo đăng ký thành công
- **Lưu ý**: Phải sử dụng sau `Send Signup Code`, mã phải chính xác
- Nếu bạn nhận `401 Unauthorized` với message `Không tìm thấy access token`, nghĩa là request đang đi vào một backend/port khác hoặc một bản chạy cũ có middleware bảo vệ; endpoint này trong source hiện tại không yêu cầu token.

---

### 4. **Sign In - Đăng nhập**
- **Method**: POST
- **URL**: `http://localhost:5002/api/auth/signin`
- **Body**:
```json
{
  "email": "an@example.com",
  "password": "password123"
}
```
- **Response**: 
```json
{
  "message": "User Nguyễn An đã login!",
  "accessToken": "eyJhbGc..."
}
```
- **Lưu ý**: 
  - Trả về `accessToken` (JWT, hết hạn trong 30 phút)
  - RefreshToken được lưu trong Cookie
  - Có rate limiting, 5 lần sai password liên tiếp sẽ bị khóa 15 phút

---

### 5. **Sign Out - Đăng xuất**
- **Method**: POST
- **URL**: `http://localhost:5002/api/auth/signout`
- **Body**: `{}`
- **Response**: Thông báo đăng xuất thành công
- **Lưu ý**: Xóa session từ database

---

### 6. **Check Duplicate - Kiểm tra email/phone tồn tại**
- **Method**: POST
- **URL**: `http://localhost:5002/api/auth/check-duplicate`
- **Body**:
```json
{
  "email": "an@example.com",
  "phone": "0901234567"
}
```
- **Response**: Thông báo email/phone đã tồn tại hoặc chưa
- **Lưu ý**: Có thể kiểm tra 1 hoặc cả 2 field

---

### 7. **Request Password Reset - Yêu cầu đặt lại mật khẩu**
- **Method**: POST
- **URL**: `http://localhost:5002/api/auth/request-password-reset`
- **Body**:
```json
{
  "email": "an@example.com"
}
```
- **Response**: Thông báo đã gửi mã xác thực
- **Lưu ý**: Mã xác thực sẽ được gửi qua email, có hiệu lực 60 phút

---

### 8. **Reset Password - Đặt lại mật khẩu**
- **Method**: POST
- **URL**: `http://localhost:5002/api/auth/reset-password`
- **Body**:
```json
{
  "email": "an@example.com",
  "code": "123456",
  "newPassword": "newpassword456"
}
```
- **Response**: Thông báo đặt lại mật khẩu thành công
- **Lưu ý**: Phải sử dụng mã từ Request Password Reset, mã phải chính xác

---

## 🚀 Hướng Dẫn Import Collection

### Bước 1: Import File JSON
1. Mở Postman
2. Nhấn nút **Import** (hoặc Ctrl+O)
3. Chọn **Upload Files** hoặc **Link**
4. Tìm và chọn file `Auth_API_Postman.json`
5. Nhấn **Import**

### Bước 2: Cấu hình Variables
Collection đã có các variables được cấu hình sẵn:
- `base_url`: `http://localhost:5002/api`
- `accessToken`: Để lưu token từ Sign In
- `email`: Email test
- `password`: Password test

Bạn có thể thay đổi các giá trị này trong tab **Variables** của collection

---

## 📝 Quy Trình Test Recommended

### **Scenario 1: Đăng ký và Đăng nhập**
1. Gọi **Sign Up** → Lấy tài khoản mới
2. Gọi **Sign In** → Nhận accessToken
3. Lưu accessToken vào variable `accessToken` (nhấp phải vào response, chọn "Set as Variable")

### **Scenario 2: Đăng ký bằng OTP**
1. Gọi **Send Signup Code** → Nhận OTP qua email
2. Gọi **Verify Signup** → Xác thực OTP (nhập code từ email)

### **Scenario 3: Quên mật khẩu**
1. Gọi **Request Password Reset** → Nhận mã xác thực
2. Gọi **Reset Password** → Đặt lại mật khẩu mới
3. Gọi **Sign In** → Đăng nhập với mật khẩu mới

---

## ⚙️ Thiết Lập Environment

Nếu bạn muốn dùng nhiều environment (dev, staging, production):

1. Tạo **Environment** mới trong Postman
2. Thêm variables:
   - `base_url` = URL của server
   - `accessToken` = Token từ login

---

## 🔐 Bảo Mật

### Quyền Truy Cập
- Tất cả các endpoint auth **không yêu cầu authentication** (PUBLIC)
- Các endpoint khác có thể yêu cầu header `Authorization: Bearer {accessToken}`

### Rate Limiting
- Sign In: Tối đa 5 lần sai trong 15 phút (IP-based)
- Send Signup Code: Tối đa 1 yêu cầu trong 60 giây mỗi email

---

## 🐛 Troubleshooting

| Lỗi | Nguyên Nhân | Giải Pháp |
|-----|-----------|----------|
| 409 - Email đã tồn tại | Email đã được đăng ký | Sử dụng email khác |
| 400 - Thiếu thông tin | Không gửi đủ fields | Kiểm tra lại request body |
| 429 - Too Many Requests | Vượt quá rate limit | Chờ trước khi gửi request tiếp theo |
| 401 - Email hoặc password sai | Thông tin đăng nhập sai | Kiểm tra email/password |
| 500 - Lỗi hệ thống | Lỗi server | Kiểm tra console backend |

---

## 📬 Email Configuration

Để gửi email (OTP, reset password), cần cấu hình `.env`:
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=your-email@gmail.com
```

---

## 💾 Lưu Ý Quan Trọng

1. **Cơ sở dữ liệu**: Đảm bảo MongoDB đang chạy
2. **Redis**: Cần Redis để lưu OTP tạm thời
3. **JWT Secret**: Đảm bảo `ACCESS_TOKEN_SECRET` được set trong .env
4. **CORS**: Backend đã cấu hình CORS cho FrontEnd

---

**Chúc bạn test API thành công! 🎉**
