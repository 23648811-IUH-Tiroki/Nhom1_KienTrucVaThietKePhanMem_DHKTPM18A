# Helper Functions & Utilities Extraction Plan

## 1. Helper Functions Currently Inside Controllers

### adminController.js
```javascript
// ✅ Can be moved to ValidationService
buildQuery({ searchTerm, role })
- Creates MongoDB query with $or for full-text search
- Conditionally adds role filter
- Reusable for other search operations
```

### cartController.js
```javascript
// ✅ Can be moved to AuthService
getAuthenticatedUserId(req, res)
- Extracts user ID from req.user._id
- Validates presence
- Returns null if not authenticated
- Pattern: used in all 8 functions
- CRITICAL: Used in every cart function - extract immediately
```

### categoryController.js
```javascript
// ✅ Can be moved to CategoryService or UtilsService
createSlug(value)
- Slugifies string values
- Adds timestamp fallback if empty
- Reusable for all slug generation

// ✅ Can be moved to CategoryService
normalizeCategoryPayload(payload, existingCategory)
- Standardizes category data
- Applies defaults from existing category
- Generates slug and slug_type
- Complex business logic: 30+ lines

// ✅ Can be moved to CategoryService
ensureUniqueCategory(payload, excludeId)
- Checks slug uniqueness
- Checks name+type combination uniqueness
- Excludes current document if updating
- Database queries for validation
```

### reviewController.js (Most Complex)
```javascript
// ✅ Can be moved to ReviewService
normalizeImages(images)
- Filters array for valid strings
- Limits to 5 images max
- Used in createReview and updateReview

// ✅ Can be moved to ReviewService
buildEmptySummary()
- Returns empty review summary structure
- Reusable for error cases

// ✅ Can be moved to ValidationService
normalizeStatus(value)
- Maps status strings to standard format
- Handles English and Vietnamese variations
- Already duplicated in orderController!

// ✅ Can be moved to ReviewService
isReviewableStatus(value)
- Checks if status allows review
- Status list: ["delivered", "completed", "đã giao hàng", ...]
- Wrapper around normalizeStatus

// ✅ Can be moved to ValidationService
normalizeObjectId(value)
- Validates MongoDB ObjectId
- Returns string if valid, null if invalid
- Reusable validation pattern

// ✅ Can be moved to ReviewService
buildReviewPopulation()
- Defines populate() paths for reviews
- Returns array of population config
- Reusable everywhere review is fetched

// ✅ Can be moved to ReviewService
populateReview(query)
- Applies buildReviewPopulation to query
- Wrapper for consistent data fetching

// ✅ Can be moved to ReviewService
orderHasProduct(order, productId)
- Checks if order contains specific product
- Handles nested product_id references
- Complex validation logic

// ✅ Can be moved to ReviewService (CRITICAL)
findEligibleOrderForProduct({ userId, productId, orderId })
- Complex eligibility logic: 25+ lines
- Validates user owns order
- Validates order status is reviewable
- Validates product is in order
- Database queries with population
- MUST MOVE - used in 4 functions

// ✅ Can be moved to ReviewService
getUserReviewMap(userId)
- Fetches all user reviews with deduplication
- Creates Map for O(1) lookups
- Returns both reviews array and map
- Used in getMyPurchasedProducts and getMyReviews

// ✅ Can be moved to ReviewService
buildCanReviewResponse({ order, review })
- Constructs eligibility response object
- Sets appropriate message and flags
- 20 lines of business logic

// ✅ Can be moved to ReviewService (CRITICAL)
updateProductReviewStats(productId)
- Calls getReviewSummaryByProductId
- Updates product with new rating and numReviews
- Side effect: modifies related model
- Used in createReview, deleteReview, hideReview, updateReview
- MUST MOVE - business logic coupling

// ✅ Can be moved to ReviewService
parseUserAndProduct(req, res, productIdParam)
- Validates and extracts user and product IDs
- Returns null with error response if invalid
- Consolidates validation logic
```

### orderController.js
```javascript
// ✅ Can be moved to ValidationService
normalizeStatus(value)
- DUPLICATE of reviewController!
- Maps status strings to standard format
- Used in createOrder, updateOrder, getOrderStats
- MUST CONSOLIDATE: Create single source of truth
```

---

## 2. Cross-Cutting Concerns to Extract

### A. Authentication/Authorization Checks

#### Pattern 1: Extract User ID
```javascript
// Found in: cartController (8 functions), reviewController (5 functions)
const userId = req.user?._id;
if (!userId) {
  res.status(401).json({ message: 'Not authenticated' });
  return null;
}
```
**Action:** Move to `AuthService.getUserId(req, res)`

#### Pattern 2: Check User Ownership
```javascript
// Found in: orderController, reviewController
if (String(order.user_id) !== String(req.user._id)) {
  return res.status(403).json({ message: 'Unauthorized' });
}
```
**Action:** Move to `AuthService.checkOwnership(resource.userId, req.user._id, res)`

#### Pattern 3: Check Role Permission
```javascript
// Found in: orderController, adminController
if (req.user?.role !== "admin") {
  return res.status(403).json({ message: 'Admin only' });
}
```
**Action:** Move to `AuthService.checkRole(req.user.role, requiredRole, res)`

---

### B. Status/Value Normalization

#### Duplicate: normalizeStatus()
**Files:** orderController.js, reviewController.js
**Problem:** Same logic implemented twice
**Solution:** Create single `ValidationService.normalizeStatus()`

#### Pattern: Review Status Validation
```javascript
const REVIEWABLE_ORDER_STATUSES = [
  "delivered", "completed", "đã giao hàng", ...
];
const isReviewableStatus = (value) => 
  REVIEWABLE_ORDER_STATUSES.includes(normalizeStatus(value));
```
**Action:** Move to `ReviewService.isOrderReviewable(status)`

---

### C. Data Aggregation & Calculations

#### Time-Based Date Calculations
**Found in:** dashboardController, orderController
**Common Pattern:**
```javascript
let startDate = new Date();
switch(timeFilter) {
  case "7days": startDate.setDate(startDate.getDate() - 7); break;
  case "30days": startDate.setDate(startDate.getDate() - 30); break;
  // ... etc
}
```
**Action:** Move to `DateService.getDateRange(timeFilter)`

#### Revenue Aggregation
**Found in:** dashboardController, orderController
**Pattern:**
```javascript
const totalRevenue = orders.reduce((sum, order) => 
  sum + order.total_price, 0
);
```
**Action:** Move to `StatisticsService.calculateTotalRevenue(orders)`

#### Pagination Calculation
**Found in:** adminController, categoryController
**Pattern:**
```javascript
const skip = (page - 1) * limit;
const totalPages = Math.ceil(total / limit);
```
**Action:** Move to `PaginationService.calculateSkip()` and `PaginationService.calculateTotalPages()`

---

### D. Object Validation

#### ObjectId Validation
**Found in:** reviewController, adminController, orderController
**Pattern:** `mongoose.isValidObjectId(id)`
**Action:** Move to `ValidationService.isValidObjectId(id)`

#### Array Normalization
**Found in:** reviewController
**Pattern:**
```javascript
const normalizeImages = (images) => {
  if (!Array.isArray(images)) return [];
  return images
    .filter(img => typeof img === "string" && img.trim())
    .slice(0, 5);
};
```
**Action:** Move to `TransformationService.normalizeImages()`

---

### E. Database Query Patterns

#### Populate Configuration
**Found in:** reviewController (buildReviewPopulation)
**Pattern:** Reusable populate path definitions
**Action:** Create `PopulationService` or include in respective services

#### Search Query Building
**Found in:** adminController (buildQuery)
**Pattern:** Constructs MongoDB queries from filters
**Action:** Move to `SearchService.buildUserSearchQuery()`

---

## 3. Service-by-Service Extraction Plan

### ValidationService
```javascript
// Move from various controllers:
- normalizeStatus(value) // from orderController + reviewController
- normalizeObjectId(value) // from reviewController
- normalizeImages(images) // from reviewController
- isValidObjectId(id) // from adminController, reviewController
- validateEmail(email)
- validatePhone(phone)
- validateRole(role)
- validateTimezone(timezone) // from settingController
- buildUserSearchQuery(searchTerm, role) // from adminController
```

### AuthService
```javascript
// Move from various controllers:
- getUserId(req, res) // from cartController, reviewController
- checkOwnership(ownerId, userId, res) // from orderController, reviewController
- checkRole(userRole, requiredRole, res) // from adminController, orderController
- extractAuthenticatedUser(req, res)
- verifyAdmin(req, res)
```

### TransformationService
```javascript
// Move from various controllers:
- normalizeImages(images) // from reviewController
- formatRecentOrders(orders) // from dashboardController, orderController
- buildCategoryPayload(payload, existing) // from categoryController
- createSlug(value) // from categoryController
```

### DateService
```javascript
// Move from various controllers:
- getDateRange(timeFilter) // from dashboardController, orderController
- getStartDate(timeFilter)
- getDateCategories(timeFilter) // for chart labels
- calculateDayOfWeek()
- calculateMonthLabel()
```

### StatisticsService
```javascript
// Move from various controllers:
- calculateTotalRevenue(orders)
- calculateAverageOrderValue(orders)
- calculateMonthlyRevenue(orders, startDate)
- calculateWeeklyRevenue(orders, startDate)
- aggregateRevenueByDay(orders, timeFilter)
- aggregateRevenueByCategory(orders)
- calculateRatingBreakdown(ratings)
```

### ReviewService
```javascript
// Move from reviewController:
- getReviewSummaryByProductId(productId) // 40+ lines
- findEligibleOrderForProduct({userId, productId, orderId}) // 25+ lines
- getUserReviewMap(userId) // 15+ lines
- buildCanReviewResponse({order, review}) // 20+ lines
- updateProductReviewStats(productId) // 15+ lines
- buildReviewPopulation()
- populateReview(query)
- orderHasProduct(order, productId)
- normalizeImages(images)
- buildEmptySummary()
- isReviewableStatus(status)
- isReviewableStatus(status)
- createSlug(value) // Already exists elsewhere
- validateReviewEligibility()
- validateReviewInput(rating, comment)
```

### ProductService
```javascript
// New service to manage product operations:
- updateStock(productId, quantityChange)
- validateStockAvailable(productId, quantity)
- getProductById(productId)
- getProductsByCategory(categoryIds)
- updateProductStats(productId, stats)
- decreaseStock(items) // for order creation
- restoreStock(items) // for order cancellation
```

### OrderService
```javascript
// Complex service from orderController:
- createOrder(userId, items, totalPrice, status)
- getOrders(userId, role)
- getOrderById(orderId, userId, role)
- updateOrder(orderId, newStatus, userId, role)
- deleteOrder(orderId)
- normalizeStatus(status)
- validateOrderStatus(currentStatus, newStatus)
- canCancelOrder(status) // business rule
- canTransitionStatus(from, to)
- validateItemsExist(items)
- validateStockAvailable(items)
- calculateTotalPrice(items) // future
- getOrderStats(timeFilter)
- getRecentOrders(limit)
```

### CategoryService
```javascript
// From categoryController:
- getAllCategories(filters, pagination)
- getCategoryById(id)
- createCategory(payload)
- updateCategory(id, payload)
- deleteCategory(id)
- getCategoryByType(slugType)
- getProductsByCategory(categoryIds, pagination)
- searchCategories(searchTerm)
- buildCategoryPayload(payload, existing)
- createSlug(value)
- ensureUniqueName(name, type, excludeId)
- ensureUniqueSlug(slug, excludeId)
```

### CartService
```javascript
// From cartController:
- addToCart(userId, productId, quantity)
- getCart(userId)
- updateCart(userId, items)
- updateItemQuantity(userId, itemId, quantity)
- deleteItem(userId, productId)
- clearCart(userId)
- countItems(userId)
- validateProductExists(productId)
```

### DashboardService
```javascript
// From dashboardController:
- getDashboardStats(timeFilter)
- getRecentOrders(limit)
- getRevenueByDay(timeFilter)
- getRevenueByCategory()
- getDashboardNotifications()
- calculateLowStockProducts(threshold)
- calculatePendingOrders()
- calculateRecentUsers()
```

### NotificationService
```javascript
// From notificationController:
- getNotifications(userId, filters)
- createNotification(message, type, userId)
- markAsRead(notificationId)
- deleteNotification(notificationId)
- generateSystemNotifications()
- generateLowStockAlert(product)
- generatePendingOrderAlert(order)
```

### SettingService
```javascript
// From settingController:
- getSettings()
- updateSettings(updates)
- validateSetting(key, value)
- validateTimezone(timezone)
```

### AIService
```javascript
// From AIController:
- createChatMessage(userMessage)
- validateMessage(message)
- callOpenRouterAPI(message)
- retryWithBackoff(fn, maxRetries)
```

---

## 4. Dependency Graph After Refactoring

```
Controllers
├── adminController
│   ├── UserService
│   ├── AuthService
│   └── ValidationService

├── cartController
│   ├── CartService
│   ├── ProductService
│   ├── AuthService
│   └── ValidationService

├── orderController
│   ├── OrderService
│   ├── ProductService
│   ├── AuthService
│   ├── ValidationService
│   ├── StatisticsService
│   └── DateService

├── reviewController
│   ├── ReviewService
│   ├── ProductService
│   ├── OrderService
│   ├── AuthService
│   └── ValidationService

├── categoryController
│   ├── CategoryService
│   ├── ProductService
│   └── ValidationService

├── dashboardController
│   ├── DashboardService
│   ├── StatisticsService
│   ├── DateService
│   ├── OrderService
│   ├── ProductService
│   └── UserService

├── notificationController
│   ├── NotificationService
│   ├── ProductService
│   ├── OrderService
│   └── ValidationService

├── settingController
│   ├── SettingService
│   └── ValidationService

└── AIController
    └── AIService
```

---

## 5. Estimated Lines of Code Movement

| Component | Lines | Estimated Effort |
|-----------|-------|-----------------|
| ValidationService | ~150 | Low |
| AuthService | ~80 | Low |
| TransformationService | ~120 | Low |
| DateService | ~100 | Low |
| StatisticsService | ~180 | Medium |
| ReviewService | ~400 | High |
| ProductService | ~200 | Medium |
| OrderService | ~350 | High |
| CategoryService | ~250 | Medium |
| CartService | ~150 | Low |
| DashboardService | ~300 | Medium |
| NotificationService | ~120 | Low |
| SettingService | ~50 | Very Low |
| AIService | ~80 | Very Low |
| **TOTAL** | **~2,330** | |

---

## 6. Quick Reference: What to Move First

### First Sprint (Foundation)
1. `ValidationService` - used by all services
2. `AuthService` - critical for security
3. `TransformationService` - data normalization
4. `DateService` - time-based operations

### Second Sprint (Complex Business Logic)
5. `OrderService` - high complexity, multiple dependencies
6. `ReviewService` - very complex, many helpers
7. `CartService` - simple but heavily used
8. `ProductService` - shared by multiple services

### Third Sprint (Analytics & Admin)
9. `DashboardService` - depends on previous services
10. `CategoryService` - medium complexity
11. `NotificationService` - depends on other services

### Fourth Sprint (Configuration & Integration)
12. `SettingService` - simple, low dependency
13. `AIService` - isolated, no dependencies

---

## 7. Implementation Checklist

- [ ] Create `/services` directory structure
- [ ] Create `ValidationService` with normalized functions
- [ ] Create `AuthService` with permission checks
- [ ] Create `TransformationService` with data formatters
- [ ] Create `DateService` with date calculations
- [ ] Create `CartService` - extract from cartController
- [ ] Create `ProductService` - consolidate product operations
- [ ] Create `OrderService` - extract from orderController
- [ ] Create `ReviewService` - extract from reviewController (largest effort)
- [ ] Create `CategoryService` - extract from categoryController
- [ ] Create `DashboardService` - extract from dashboardController
- [ ] Create `NotificationService` - extract from notificationController
- [ ] Create `SettingService` - extract from settingController
- [ ] Create `AIService` - extract from AIController
- [ ] Create error handling utilities
- [ ] Create response formatting utilities
- [ ] Add JSDoc comments to all services
- [ ] Create service layer unit tests
- [ ] Update all controllers to use services
- [ ] Remove extracted code from controllers
- [ ] Integration testing
- [ ] Performance testing
- [ ] Update API documentation

---

## Notes

**Total Duplicated Code:** ~50 lines (normalizeStatus appears in 2 files)
**Total Helper Functions to Extract:** 27+ functions
**Estimated Refactoring Time:** 3-4 weeks for full implementation
**Testing Priority:** ReviewService > OrderService > CartService
