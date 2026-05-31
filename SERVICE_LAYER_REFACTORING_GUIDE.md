# Controllers Analysis - Service Layer Refactoring Guide

## Summary Overview

**Total Controllers Analyzed:** 9
**Total Export Functions:** 43
**Total Helper Functions:** 15

---

## 1. Controllers Summary

| Controller | # Functions | Key Responsibility | Dependencies |
|-----------|-----------|-------------------|---|
| **adminController** | 4 | User management (block, unblock, role management) | User, mongoose |
| **AIController** | 1 | AI chat integration with OpenRouter API | axios, dotenv |
| **cartController** | 8 | Shopping cart CRUD operations | Cart |
| **categoryController** | 8 | Category management with product relations | Category, Product, slugify |
| **dashboardController** | 6 | Analytics and statistics aggregation | Order, Product, User |
| **notificationController** | 5 | Notification CRUD and generation | Notification, Product, Order |
| **orderController** | 7 | Order management with status workflow | Order, Product |
| **reviewController** | 10 | Complex review management with eligibility logic | Review, Product, Order, mongoose |
| **settingController** | 2 | Application configuration | Setting |

---

## 2. Logic Categories Found in Controllers

### A. Database Query Patterns
- **Simple CRUD:** Create, Read, Update, Delete (cartController, notificationController, settingController)
- **Advanced Queries:** 
  - Pagination with filtering (adminController, categoryController)
  - Aggregation pipelines (dashboardController, reviewController)
  - Complex population chains (orderController, reviewController)

### B. Validation Logic
- **Input Validation:**
  - ObjectId validation (mongoose.isValidObjectId)
  - String trimming and normalization
  - Enum validation (roles, statuses, timezones)
  - Array bounds checking

- **Business Logic Validation:**
  - Stock availability checks (orderController)
  - Authorization checks (orderController, reviewController)
  - Uniqueness checks (categoryController, reviewController)
  - Status transition validation (orderController)

### C. Business Logic Patterns
- **Calculations:**
  - Revenue aggregation (dashboardController, orderController)
  - Average/statistics calculations (dashboardController, orderController)
  - Rating breakdowns (reviewController)

- **State Transitions:**
  - Order status normalization and validation
  - Review eligibility based on order status

- **Cross-Entity Operations:**
  - Stock management linked to orders (orderController)
  - Review statistics linked to products (reviewController)
  - Cart items linked to products (cartController)

### D. External Integration
- **API Calls:**
  - OpenRouter AI API with retry logic (AIController)

### E. Data Transformation
- **Normalization Functions:**
  - `normalizeStatus` (orderController, reviewController)
  - `normalizeCategoryPayload` (categoryController)
  - `normalizeImages` (reviewController)
  - `createSlug` (categoryController)

- **Formatting Functions:**
  - Recent orders formatting (dashboardController, orderController)
  - Notification message construction (dashboardController, notificationController)

---

## 3. Cross-Cutting Concerns

### A. Authentication & Authorization
**Found in:** orderController, reviewController, adminController

**Patterns:**
- Extract `req.user._id` and check if exists
- Role-based access control (admin vs regular user)
- Owner verification (user can only access own data)
- Authorization responses with 403 status

**Service Layer Strategy:** Create `AuthService` for permission checks

---

### B. Error Handling
**Pattern:** Try-catch with:
- 400: Bad request (validation errors)
- 403: Forbidden (authorization)
- 404: Not found
- 500: Server errors with logged details

**Service Layer Strategy:** Standardize error handling with custom error classes

---

### C. Data Population/Normalization
**Recurring Patterns:**
- Populate nested references (user_id, items.product_id)
- Select specific fields
- Transform response format

**Service Layer Strategy:** Create mapper/transformer utilities

---

### D. Aggregation & Statistics
**Found in:** dashboardController, orderController, reviewController

**Patterns:**
- Time-based filtering (7days, 30days, 90days, year, all)
- Sum/count aggregations
- Grouped calculations by category/day/month

**Service Layer Strategy:** Create `StatisticsService`

---

## 4. Service Layer Refactoring Roadmap

### Phase 1: Core Services (High Priority)
```
1. AuthService
   - Check user ownership
   - Check role permissions
   - Validate authorization

2. OrderService
   - createOrder() - with stock validation
   - updateOrder() - with status transitions
   - getOrders() - with role-based filtering
   - updateStock() - shared logic
   - getOrderStats() - statistics

3. ReviewService
   - createReview() - with eligibility checks
   - updateReview() - with authorization
   - deleteReview() - with authorization
   - getReviewSummary() - aggregation
   - updateProductStats() - linked updates
   - checkEligibility() - complex validation

4. CartService
   - addToCart()
   - getCart()
   - updateCartItem()
   - deleteItem()
   - clearCart()
   - calculateTotal() - new utility
```

### Phase 2: Supporting Services (Medium Priority)
```
5. CategoryService
   - getAllCategories() - with filtering
   - createCategory() - with slug generation
   - updateCategory() - with uniqueness checks
   - deleteCategory()
   - getProductsByCategory() - cross-model

6. DashboardService
   - getDashboardStats()
   - getRevenueByDay() - time series
   - getRevenueByCategory() - aggregation
   - getRecentOrders() - formatting
   - getDashboardNotifications()

7. NotificationService
   - createNotification()
   - getNotifications()
   - markAsRead()
   - generateSystemNotifications() - business logic

8. SettingService
   - getSettings()
   - updateSettings() - with validation
```

### Phase 3: Utility Services (Low Priority)
```
9. AIService
   - createChatAI() - wrap external API

10. ValidationService
    - validateObjectId()
    - normalizeStatus()
    - normalizeImages()
    - validateRole()

11. TransformationService
    - formatRecentOrders()
    - createSlug()
    - normalizeCategoryPayload()
```

---

## 5. Shared Business Logic to Extract

### A. Status Normalization
**Used in:** orderController, reviewController

**Logic:**
- Maps multiple string variations to standard statuses
- Used for: "pending", "confirmed", "shipping", "delivered", "cancelled"
- Can also map Vietnamese versions

**Location:** → `ValidationService.normalizeStatus()`

---

### B. Stock Management
**Used in:** orderController

**Logic:**
- Decrease stock on order creation
- Restore stock on order cancellation
- Validate sufficient stock exists

**Location:** → `ProductService.updateStock()` or `OrderService`

---

### C. Product Stats Aggregation
**Used in:** reviewController

**Logic:**
- Calculate average rating
- Count total reviews
- Build rating breakdown (1-5 stars)
- Update product with aggregated stats

**Location:** → `ReviewService.updateProductStats()`

---

### D. Time-Based Filtering
**Used in:** dashboardController, orderController

**Logic:**
- Parse timeFilter parameter (7days, 30days, 90days, year, all)
- Calculate start date
- Optional: Generate date categories for chart

**Location:** → `DateService.getDateRange()` or `StatisticsService`

---

### E. Authorization Checks
**Used in:** orderController, reviewController, cartController

**Logic:**
- Check user owns resource
- Check user has required role
- Return 403 if unauthorized

**Location:** → `AuthService.checkOwnership()`, `AuthService.checkRole()`

---

## 6. Data Flow Analysis

### Order Creation Flow
```
Controller → Service Layer
1. validateOrderData()
2. checkProductsExist()
3. validateStock()
4. decreaseStock()
5. createOrder()
6. updateProductStats() [optional]
```

### Review Creation Flow
```
Controller → Service Layer
1. validateInput()
2. checkEligibility()
   - Verify user owns order
   - Verify order status is reviewable
   - Verify product in order
3. checkDuplicate() - no double review
4. createReview()
5. updateProductStats()
   - Calculate new average rating
   - Update product review count
```

### Cart Operations Flow
```
Controller → Service Layer
1. extractUserId()
2. getCart() or createCart()
3. validateProduct()
4. updateItems()
5. recalculateTotal() [future enhancement]
```

---

## 7. Data Model Dependencies

```
Admin Operations
└── User

Cart Operations
├── Cart
├── Product (referenced from cart items)
└── User (via auth)

Order Operations
├── Order
├── Product (inventory management)
├── User (owner verification)
└── Review (related)

Review Operations
├── Review
├── Product (stats update)
├── Order (eligibility check)
└── User (owner verification)

Category Operations
├── Category
└── Product (related products)

Dashboard Operations
├── Order (main data source)
├── Product (category grouping)
└── User (recent users)

Notification Operations
├── Notification
├── Product (low stock alerts)
└── Order (pending order alerts)

Settings Operations
└── Setting

AI Operations
└── (External API only)
```

---

## 8. Current Code Patterns to Standardize

### ✅ Good Practices Found
- Consistent error response format (status codes, messages)
- Input validation before processing
- Try-catch error handling
- Model population for relational data
- ObjectId validation

### ⚠️ Areas for Improvement
- Authorization checks scattered across functions
- Status normalization logic duplicated (orderController, reviewController)
- Stock management tightly coupled to order creation
- Time-based filtering logic duplicated (dashboardController, orderController)
- Helper functions inside controllers should move to services

---

## 9. Refactoring Priority Matrix

| Service | Priority | Complexity | Benefits |
|---------|----------|-----------|----------|
| AuthService | **High** | Low | Centralizes permission logic |
| OrderService | **High** | High | Complex workflow, high reuse |
| ReviewService | **High** | Very High | Complex eligibility, many helpers |
| CartService | **High** | Low | Simple CRUD, high reuse |
| DashboardService | **Medium** | Medium | Aggregation logic, reusable |
| CategoryService | **Medium** | Low | Slug generation, validation |
| ValidationService | **Medium** | Low | Normalize duplicated logic |
| NotificationService | **Medium** | Low | Simple operations |
| SettingService | **Low** | Low | Simple configuration |
| AIService | **Low** | Low | Just API wrapper |

---

## 10. Implementation Checklist

- [ ] Create directory structure: `services/`
- [ ] Create `ValidationService` - normalize functions
- [ ] Create `AuthService` - permission checks
- [ ] Create `CartService` - cart operations
- [ ] Create `OrderService` - order workflow
- [ ] Create `ReviewService` - review management with stats
- [ ] Create `ProductService` - shared product operations (stock, stats)
- [ ] Create `DashboardService` - analytics aggregation
- [ ] Create `CategoryService` - category management
- [ ] Create `NotificationService` - notification logic
- [ ] Create `SettingService` - configuration
- [ ] Create `AIService` - AI integration wrapper
- [ ] Create error handling utilities
- [ ] Create response formatter utilities
- [ ] Update all controllers to use services
- [ ] Add service-level tests
- [ ] Document service layer API

---

## Generated Timestamp
Analysis Date: May 28, 2026
File: `CONTROLLERS_ANALYSIS.json`
