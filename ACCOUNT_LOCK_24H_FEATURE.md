# 🔐 Chức Năng Khóa Tài Khoản 24h - Account Lock Feature

**Ngày tạo:** 01/06/2026  
**Status:** ✅ Hoàn thành  
**Mục tiêu:** Bảo vệ tài khoản người dùng khỏi tấn công brute-force

---

## 📋 Tổng Quan

Hệ thống sẽ **tự động khóa tài khoản trong 24 giờ** khi người dùng nhập mật khẩu sai **≥5 lần liên tiếp**, giúp bảo vệ khỏi tấn công brute-force.

---

## 🔄 Luồng Hoạt Động

### Scenario 1: Đăng nhập thành công lần đầu
```
User Input: email + password (đúng)
    ↓
Kiểm tra email exist: ✅
    ↓
Kiểm tra account bị block: ❌
    ↓
Kiểm tra lock tạm thời: ❌
    ↓
Verify password: ✅
    ↓
✅ Reset loginAttempts = 0, lockUntil = null
    ↓
✅ Generate token + cookie
    ↓
✅ Return 200 OK with accessToken
```

### Scenario 2: Đăng nhập sai lần 1-4
```
User Input: email + password (sai)
    ↓
Verify password: ❌
    ↓
Increment loginAttempts: 1, 2, 3, 4
    ↓
❌ Return 401 "Email hoặc mật khẩu không đúng"
    ✅ Response includes: remainingAttempts (4, 3, 2, 1)
    
Example Response:
{
  "message": "Email hoặc mật khẩu không đúng. Bạn còn 4 lần thử trước khi tài khoản bị khóa.",
  "loginAttempts": 1,
  "remainingAttempts": 4,
  "statusCode": 401
}
```

### Scenario 3: Đăng nhập sai lần 5 (tài khoản bị khóa)
```
User Input: email + password (sai lần 5)
    ↓
Verify password: ❌
    ↓
Increment loginAttempts: 5
    ↓
✅ Set lockUntil = now + 24 hours
    ↓
❌ Return 423 "Tài khoản bị khóa trong 24 giờ"
    
Example Response:
{
  "message": "Tài khoản của bạn đã bị khóa tạm thời trong 24 giờ do đăng nhập sai quá nhiều lần. Vui lòng thử lại sau 24 giờ.",
  "lockUntil": "2026-06-02T10:30:00Z",
  "remainingHours": 24,
  "statusCode": 423
}
```

### Scenario 4: Thử đăng nhập khi tài khoản bị khóa
```
User Input: email + password
    ↓
Kiểm tra lockUntil > now: ✅ YES (Tài khoản bị khóa)
    ↓
Tính toán remaining time: remainingTime = 120 phút (2 giờ)
    ↓
❌ Return 423 "Tài khoản bị khóa tạm thời. Vui lòng thử lại sau 120 phút"
    
Example Response:
{
  "message": "Tài khoản bị khóa tạm thời do đăng nhập sai quá nhiều lần. Vui lòng thử lại sau 120 phút.",
  "lockUntil": "2026-06-02T10:30:00Z",
  "remainingMinutes": 120,
  "statusCode": 423
}
```

### Scenario 5: Tự động mở khóa sau 24 giờ
```
User tries to login 48 giờ sau lần khóa
    ↓
Kiểm tra lockUntil > now: ❌ NO (Hết thời gian khóa)
    ↓
✅ Auto-unlock: set lockUntil = null, loginAttempts = 0
    ↓
Tiếp tục quy trình đăng nhập bình thường
```

---

## 📁 Files Được Thay Đổi

### 1. **User Model** - Thêm 2 trường mới
📄 `back-end/server/models/User.js`

```javascript
// Trước
const userSchema = new mongoose.Schema({
  email: { type: String, ... },
  password: { type: String, ... },
  isBlocked: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  ...
});

// Sau
const userSchema = new mongoose.Schema({
  email: { type: String, ... },
  password: { type: String, ... },
  isBlocked: { type: Boolean, default: false },
  loginAttempts: { type: Number, default: 0 },        // ← NEW
  lockUntil: { type: Date, default: null },           // ← NEW
  createdAt: { type: Date, default: Date.now },
  ...
});
```

**Giải thích:**
- `loginAttempts`: Đếm số lần đăng nhập sai (0-5)
- `lockUntil`: Thời điểm mở khóa (null = không bị khóa)

### 2. **Auth Service** - Logic khóa/mở khóa
📄 `back-end/server/services/authService.js`

**Thêm kiểm tra:**
```javascript
// ✅ Check temporary lock (24h)
if (user.lockUntil && user.lockUntil > now) {
  const remainingTime = Math.ceil((user.lockUntil - now) / 1000 / 60);
  throw createServiceError(
    `Tài khoản bị khóa tạm thời. Vui lòng thử lại sau ${remainingTime} phút.`,
    423
  );
}

// ✅ Auto-unlock if lockUntil passed
if (user.lockUntil && user.lockUntil <= now) {
  user.lockUntil = null;
  user.loginAttempts = 0;
  await user.save();
}
```

**Increment attempts khi sai:**
```javascript
if (!passWordCorrect) {
  user.loginAttempts = (user.loginAttempts || 0) + 1;
  
  if (user.loginAttempts >= 5) {
    user.lockUntil = new Date(Date.now() + 24*60*60*1000);
    await user.save();
    throw createServiceError("Tài khoản bị khóa 24 giờ", 423);
  } else {
    const remainingAttempts = 5 - user.loginAttempts;
    throw createServiceError(
      `Sai mật khẩu. Còn ${remainingAttempts} lần thử.`,
      401
    );
  }
}
```

**Reset attempts khi đúng:**
```javascript
// Password correct
user.loginAttempts = 0;
user.lockUntil = null;
await user.save();
// Generate tokens...
```

### 3. **Utility Functions** - Helper functions
📄 `back-end/server/utils/accountLockUtils.js` (NEW)

```javascript
export const isAccountLocked = (user) => {
  return user.lockUntil && user.lockUntil > new Date();
};

export const getRemainingLockMinutes = (user) => {
  if (!isAccountLocked(user)) return 0;
  return Math.ceil((user.lockUntil - new Date()) / 1000 / 60);
};

export const lockAccountFor24Hours = async (userId) => {
  return await User.findByIdAndUpdate(userId, {
    lockUntil: new Date(Date.now() + 24*60*60*1000),
    loginAttempts: 5
  });
};

export const unlockAccount = async (userId) => {
  return await User.findByIdAndUpdate(userId, {
    lockUntil: null,
    loginAttempts: 0
  });
};
```

---

## 🧪 Test Cases

### Test 1: Đăng nhập thành công
```bash
POST /api/auth/sign-in
{
  "email": "user@example.com",
  "password": "Correct123!@"
}

Response 200:
{
  "message": "User Nguyen Van A đã login!",
  "accessToken": "eyJhbGc...",
  "user": { _id, email, fullName, ... }
}
```

### Test 2: Đăng nhập sai 1 lần
```bash
POST /api/auth/sign-in
{
  "email": "user@example.com",
  "password": "Wrong123!@"
}

Response 401:
{
  "message": "Email hoặc mật khẩu không đúng. Bạn còn 4 lần thử trước khi tài khoản bị khóa.",
  "loginAttempts": 1,
  "remainingAttempts": 4,
  "statusCode": 401
}
```

### Test 3: Đăng nhập sai 5 lần (tài khoản bị khóa)
```bash
# Lặp lại sai 5 lần...

POST /api/auth/sign-in (lần 5)
{
  "email": "user@example.com",
  "password": "Wrong123!@"
}

Response 423:
{
  "message": "Tài khoản của bạn đã bị khóa tạm thời trong 24 giờ do đăng nhập sai quá nhiều lần. Vui lòng thử lại sau 24 giờ.",
  "lockUntil": "2026-06-02T10:30:00Z",
  "remainingHours": 24,
  "statusCode": 423
}
```

### Test 4: Thử đăng nhập khi bị khóa
```bash
POST /api/auth/sign-in (sau 30 phút lock)
{
  "email": "user@example.com",
  "password": "AnyPassword"
}

Response 423:
{
  "message": "Tài khoản bị khóa tạm thời do đăng nhập sai quá nhiều lần. Vui lòng thử lại sau 1410 phút.",
  "lockUntil": "2026-06-02T10:30:00Z",
  "remainingMinutes": 1410,
  "statusCode": 423
}
```

### Test 5: Database check
```javascript
// Check user document
db.users.findOne({email: "user@example.com"})
// Result:
{
  _id: ObjectId("..."),
  email: "user@example.com",
  password: "...",
  loginAttempts: 5,
  lockUntil: ISODate("2026-06-02T10:30:00Z"),  // 24h from lock time
  isBlocked: false,
  ...
}
```

---

## 📊 Database Schema

```javascript
// User Collection
{
  _id: ObjectId,
  email: String,
  password: String,
  fullName: String,
  phone: String,
  
  // ✅ NEW FIELDS FOR ACCOUNT LOCKING
  loginAttempts: {
    type: Number,
    description: "Failed login attempts counter (0-5)",
    default: 0,
    example: 3
  },
  lockUntil: {
    type: Date,
    description: "When to unlock account (null = not locked)",
    default: null,
    example: "2026-06-02T10:30:00Z"
  },
  
  // Existing fields
  isBlocked: Boolean,        // Admin permanent block
  role: String,
  createdAt: Date,
  ...
}
```

---

## 🔧 Configuration

File: `.env`

```env
# Account lock settings (can be customized)
ACCOUNT_LOCK_DURATION_HOURS=24           # Default: 24h
ACCOUNT_MAX_LOGIN_ATTEMPTS=5             # Default: 5 attempts
```

---

## 📲 Frontend Integration

### Example: Login Form Component
```javascript
// LoginPage.jsx
const handleLogin = async () => {
  try {
    const response = await axiosInstance.post('/api/auth/sign-in', {
      email: email,
      password: password
    });
    
    // Success
    navigate('/dashboard');
  } catch (error) {
    const status = error.response?.status;
    const data = error.response?.data;
    
    if (status === 401) {
      // Wrong password
      toast.error(
        data.message || "Sai mật khẩu",
        `Còn ${data.remainingAttempts} lần thử`
      );
    } else if (status === 423) {
      // Account locked
      toast.error(
        "Tài khoản bị khóa 24 giờ",
        `Vui lòng thử lại lúc: ${new Date(data.lockUntil).toLocaleString()}`
      );
      setShowLockMessage(true);
      setLockUntilTime(data.lockUntil);
      setRemainingMinutes(data.remainingMinutes);
    } else if (status === 403) {
      // Account blocked by admin
      toast.error("Tài khoản bị khóa bởi admin");
    }
  }
};
```

### Countdown Timer (Show remaining lock time)
```javascript
useEffect(() => {
  if (!showLockMessage) return;
  
  const interval = setInterval(() => {
    const remaining = Math.ceil((new Date(lockUntilTime) - new Date()) / 1000 / 60);
    
    if (remaining <= 0) {
      setShowLockMessage(false);
      toast.success("Tài khoản đã được mở khóa. Hãy thử đăng nhập lại.");
    } else {
      setRemainingMinutes(remaining);
    }
  }, 60000);  // Update every minute
  
  return () => clearInterval(interval);
}, [showLockMessage, lockUntilTime]);
```

---

## 🛡️ Security Considerations

| Điểm | Mô Tả | Giải Pháp |
|-----|-------|----------|
| **Brute-force attack** | Attacker thử nhiều mật khẩu | Account lock 24h sau 5 lần sai |
| **Distributed attack** | Attacker dùng nhiều IP | Rate limiter 100 req/min/IP |
| **Lock bypass** | User tạo account mới | Email verification required |
| **Permanent lock** | Tài khoản khóa vĩnh viễn | Only admin can do via `isBlocked` field |

---

## 🔄 Maintenance & Admin Functions

### Admin unlock account (Có thể thêm vào adminController)
```javascript
export const adminUnlockAccount = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findByIdAndUpdate(userId, {
      lockUntil: null,
      loginAttempts: 0
    }, { new: true });
    
    res.json({ message: "Account unlocked", user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

### View locked accounts
```javascript
const lockedAccounts = await User.find({
  lockUntil: { $gt: new Date() }
});
// Shows all currently locked accounts

const allBlockedAccounts = await User.find({
  $or: [
    { isBlocked: true },
    { lockUntil: { $gt: new Date() } }
  ]
});
// Shows both admin-blocked and temporarily-locked accounts
```

---

## 📈 Monitoring

### Suggested metrics to track:
```javascript
// Count failed logins per email
const failedLoginsByEmail = await User.aggregate([
  { $match: { loginAttempts: { $gt: 0 } } },
  { $group: { _id: "$email", count: { $sum: "$loginAttempts" } } },
  { $sort: { count: -1 } },
  { $limit: 10 }
]);

// Count locked accounts
const lockedAccountsCount = await User.countDocuments({
  lockUntil: { $gt: new Date() }
});

// Most attacked emails (potential threat)
const mostAttempted = await User.find({
  loginAttempts: { $gte: 3 }
}).sort({ loginAttempts: -1 }).limit(10);
```

---

## ✅ Status & Testing Checklist

- [x] User model updated (loginAttempts, lockUntil)
- [x] Auth service logic implemented
- [x] Helper functions created
- [x] Error messages in Vietnamese
- [x] Response codes (401, 423, 403)
- [ ] Frontend integration
- [ ] Unit tests
- [ ] Integration tests
- [ ] Production testing

---

**Last updated:** 01/06/2026  
**Version:** 1.0  
**Author:** Dev Team
