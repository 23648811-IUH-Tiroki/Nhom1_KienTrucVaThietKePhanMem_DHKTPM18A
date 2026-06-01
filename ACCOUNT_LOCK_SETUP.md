# 🔐 Account Lock 24h - Hướng Dẫn Triển Khai

## ✅ Bước 1: Cập Nhật Database

Hãy chạy migration để thêm 2 trường mới vào collection `users`:

### Option A: Sử dụng MongoDB Compass hoặc mongosh

```bash
# Kết nối đến MongoDB
mongosh mongodb://localhost:27017

# Chọn database
use PetShop

# Chạy migration
db.users.updateMany({}, {$set: {loginAttempts: 0, lockUntil: null}})

# Kiểm tra
db.users.findOne({})
```

### Option B: Sử dụng file migration
```bash
cd back-end
mongosh < migrations/20260601-add-account-lock-fields.cjs
```

---

## ✅ Bước 2: Restart Backend

```bash
# Terminal 1: Kill old process
Ctrl + C

# Terminal 2: Start backend (sẽ load model mới)
cd back-end
npm start
# hoặc
npm run dev
```

---

## 📝 Thay Đổi Chi Tiết

### 1. User Model (`back-end/server/models/User.js`)
✅ **Thêm 2 fields:**
- `loginAttempts: {type: Number, default: 0}` - Đếm lần sai
- `lockUntil: {type: Date, default: null}` - Thời khóa

### 2. Auth Service (`back-end/server/services/authService.js`)
✅ **Thêm logic:**
```javascript
// 1. Check temporary lock (nếu bị khóa 24h)
if (user.lockUntil && user.lockUntil > now) {
  // Trả về lỗi 423 với thời gian còn lại
}

// 2. Auto-unlock (nếu hết 24h)
if (user.lockUntil && user.lockUntil <= now) {
  user.lockUntil = null;
  user.loginAttempts = 0;
}

// 3. Increment attempts (khi sai mật khẩu)
user.loginAttempts += 1;
if (user.loginAttempts >= 5) {
  user.lockUntil = new Date(Date.now() + 24*60*60*1000);
  // Trả về lỗi 423
}

// 4. Reset attempts (khi đúng mật khẩu)
user.loginAttempts = 0;
user.lockUntil = null;
```

### 3. Utility Functions (`back-end/server/utils/accountLockUtils.js`) - NEW
✅ **Helper functions:**
- `isAccountLocked(user)` - Check tài khoản bị khóa
- `getRemainingLockMinutes(user)` - Lấy thời gian còn lại
- `lockAccountFor24Hours(userId)` - Khóa tài khoản
- `unlockAccount(userId)` - Mở khóa
- `getAccountLockStatus(user)` - Status chi tiết

### 4. Migration File (`back-end/migrations/20260601-add-account-lock-fields.cjs`) - NEW
✅ **Update existing data**

---

## 🧪 Testing

### Test 1: Đăng nhập đúng
```bash
curl -X POST http://localhost:5000/api/auth/sign-in \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "CorrectPass123!@"
  }'

# Response 200
{
  "message": "User ... đã login!",
  "accessToken": "...",
  "user": {...}
}
```

### Test 2: Đăng nhập sai 1 lần
```bash
curl -X POST http://localhost:5000/api/auth/sign-in \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "WrongPass123!@"
  }'

# Response 401
{
  "message": "Email hoặc mật khẩu không đúng. Bạn còn 4 lần thử trước khi tài khoản bị khóa trong 24 giờ.",
  "loginAttempts": 1,
  "remainingAttempts": 4,
  "statusCode": 401
}
```

### Test 3: Đăng nhập sai 5 lần (tài khoản khóa)
```bash
# Lặp lại test 2 cho 4 lần nữa...
# Lần thứ 5:

# Response 423
{
  "message": "Tài khoản của bạn đã bị khóa tạm thời trong 24 giờ do đăng nhập sai quá nhiều lần. Vui lòng thử lại sau 24 giờ.",
  "lockUntil": "2026-06-02T10:30:00Z",
  "remainingHours": 24,
  "statusCode": 423
}
```

### Test 4: Thử đăng nhập khi bị khóa
```bash
# Sau 30 phút lock, thử đăng nhập

# Response 423
{
  "message": "Tài khoản bị khóa tạm thời do đăng nhập sai quá nhiều lần. Vui lòng thử lại sau 1410 phút.",
  "lockUntil": "2026-06-02T10:30:00Z",
  "remainingMinutes": 1410,
  "statusCode": 423
}
```

### Test 5: Kiểm tra Database
```bash
mongosh mongodb://localhost:27017

use PetShop

db.users.findOne({email: "user@example.com"})

# Output:
{
  _id: ObjectId("..."),
  email: "user@example.com",
  fullName: "...",
  loginAttempts: 5,
  lockUntil: ISODate("2026-06-02T10:30:00Z"),
  isBlocked: false,
  ...
}
```

---

## 📲 Frontend Integration (Optional)

### Update LoginPage để hiển thị lỗi lock

```javascript
// front-end/src/pages/LoginPage.jsx

const handleLogin = async (e) => {
  e.preventDefault();
  
  try {
    const response = await axiosInstance.post('/api/auth/sign-in', {
      email,
      password
    });
    
    // Success
    localStorage.setItem('accessToken', response.data.accessToken);
    navigate('/dashboard');
  } catch (error) {
    const status = error.response?.status;
    const data = error.response?.data;
    
    if (status === 401) {
      // Sai mật khẩu
      toast.error(
        data.message,
        `Còn ${data.remainingAttempts} lần thử`
      );
    } else if (status === 423) {
      // Tài khoản bị khóa
      toast.error(
        "Tài khoản bị khóa 24 giờ",
        `Vui lòng thử lại lúc: ${new Date(data.lockUntil).toLocaleString()}`
      );
      
      // Show lock message
      setShowLockMessage(true);
      setLockUntilTime(data.lockUntil);
    } else if (status === 403) {
      // Tài khoản bị admin khóa
      toast.error("Tài khoản bị khóa bởi admin");
    }
  }
};
```

---

## 🔧 Configuration (Optional)

Nếu muốn thay đổi số lần thử hoặc thời gian khóa, edit `accountLockUtils.js`:

```javascript
// back-end/server/utils/accountLockUtils.js

// Thay đổi này
const LOCK_DURATION_MS = 24 * 60 * 60 * 1000;  // 24h
const MAX_LOGIN_ATTEMPTS = 5;                   // 5 times

// Thành cái này (ví dụ: 1h, 3 lần)
const LOCK_DURATION_MS = 1 * 60 * 60 * 1000;   // 1h
const MAX_LOGIN_ATTEMPTS = 3;                   // 3 times
```

---

## 📊 Monitoring (Optional)

### Xem tài khoản bị khóa
```bash
mongosh

use PetShop

# Tất cả tài khoản đang bị khóa
db.users.find({lockUntil: {$gt: new Date()}})

# Đếm số lượng
db.users.countDocuments({lockUntil: {$gt: new Date()}})

# Sắp xếp theo số lần thử (descending)
db.users.find({loginAttempts: {$gte: 1}}).sort({loginAttempts: -1})
```

### API để unlock tài khoản (Admin function)
```javascript
// Thêm vào adminController.js (optional)

export const unlockUserAccount = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findByIdAndUpdate(userId, {
      lockUntil: null,
      loginAttempts: 0
    }, { new: true });
    
    logger.info("Admin unlocked account", { userId });
    res.json({ message: "Account unlocked", user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Route
router.put('/users/:userId/unlock', requireAdmin, adminController.unlockUserAccount);
```

---

## 📋 Checklist

- [x] User model cập nhật (loginAttempts, lockUntil)
- [x] Auth service logic
- [x] Helper functions
- [x] Migration file
- [ ] Database migration chạy
- [ ] Backend restart
- [ ] Tested login success
- [ ] Tested wrong password (1-4 times)
- [ ] Tested account lock (5 times)
- [ ] Tested lock message
- [ ] Database verified
- [ ] Frontend integration (optional)
- [ ] Admin unlock function (optional)

---

## 🐛 Troubleshooting

### Lỗi: "loginAttempts is not defined"
**Nguyên nhân:** Chưa update User model hoặc chưa restart backend
**Giải pháp:**
```bash
# 1. Check User.js file
cat back-end/server/models/User.js | grep loginAttempts

# 2. Restart backend
npm start
```

### Lỗi: "Tài khoản không mở khóa"
**Nguyên nhân:** lockUntil vẫn > now (còn khóa)
**Giải pháp:**
```bash
# Check lockUntil time
db.users.findOne({email: "..."})

# Nếu cần mở khóa ngay
db.users.updateOne(
  {email: "user@example.com"},
  {$set: {lockUntil: null, loginAttempts: 0}}
)
```

### Lỗi: Response "Cannot read property 'isBlocked'"
**Nguyên nhân:** User không tồn tại
**Giải pháp:** Tạo account trước khi test login

---

## 📚 Tài Liệu Liên Quan

- 📄 `ACCOUNT_LOCK_24H_FEATURE.md` - Tài liệu chi tiết
- 📄 `back-end/server/utils/accountLockUtils.js` - Helper functions
- 📄 `back-end/server/models/User.js` - User schema
- 📄 `back-end/server/services/authService.js` - Auth logic
- 📄 `back-end/migrations/20260601-add-account-lock-fields.cjs` - Migration

---

## 💡 Next Steps

1. ✅ Triển khai feature này
2. ⏳ Thêm email notification: "Tài khoản bị khóa, click để reset" (future)
3. ⏳ Thêm CAPTCHA sau 3 lần sai (future)
4. ⏳ Thêm 2FA (Two-Factor Authentication) (future)

---

**Last Updated:** 01/06/2026  
**Status:** ✅ Ready for deployment  
**Version:** 1.0
