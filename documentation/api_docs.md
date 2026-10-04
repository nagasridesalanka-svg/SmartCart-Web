# SmartCart API Documentation

All API responses use standard JSON with HTTP status codes.

---

## Base URL
`/api`

---

## 1. Authentication Endpoints

### **Register a New User**
- **Method**: `POST`
- **Path**: `/api/register`
- **Headers**: `Content-Type: application/json`
- **Body**:
  ```json
  {
    "fullName": "Jane Doe",
    "email": "jane@example.com",
    "phone": "+1 555-0199",
    "password": "Password@123",
    "address": "123 Main St, City, Country"
  }
  ```
- **Validation Rules**:
  - `fullName`: Minimum 2 characters
  - `email`: Valid email format, unique
  - `password`: Minimum 6 characters
- **Success Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "User registered successfully",
    "user": {
      "USER_ID": 3,
      "FULL_NAME": "Jane Doe",
      "EMAIL": "jane@example.com",
      "ROLE": "customer"
    }
  }
  ```

---

### **User Login**
- **Method**: `POST`
- **Path**: `/api/login`
- **Headers**: `Content-Type: application/json`
- **Body**:
  ```json
  {
    "email": "admin@smartcart.com",
    "password": "Admin@123"
  }
  ```
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Login successful",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "USER_ID": 1,
      "FULL_NAME": "System Administrator",
      "EMAIL": "admin@smartcart.com",
      "ROLE": "admin"
    }
  }
  ```

---

### **Get Current User Profile**
- **Method**: `GET`
- **Path**: `/api/me`
- **Headers**: `Authorization: Bearer <jwt_token>`
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "user": {
      "USER_ID": 1,
      "FULL_NAME": "System Administrator",
      "EMAIL": "admin@smartcart.com",
      "ROLE": "admin"
    }
  }
  ```

---

## 2. Catalog & Products Endpoints

### **Get All Categories**
- **Method**: `GET`
- **Path**: `/api/categories`
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "categories": [
      {
        "CATEGORY_ID": 1,
        "CATEGORY_NAME": "Electronics",
        "DESCRIPTION": "Laptops, audio equipment, smartphones, and smart workspace gadgets"
      }
    ]
  }
  ```

---

### **Get Products List**
- **Method**: `GET`
- **Path**: `/api/products`
- **Query Parameters**:
  - `search` *(optional)*: Case-insensitive search on product name and description
  - `category` *(optional)*: Filter by `CATEGORY_ID` (numeric)
- **Example**: `/api/products?search=headphones&category=1`
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "count": 1,
    "products": [
      {
        "PRODUCT_ID": 1,
        "CATEGORY_ID": 1,
        "CATEGORY_NAME": "Electronics",
        "PRODUCT_NAME": "AeroSound Pro Noise-Cancelling Headphones",
        "DESCRIPTION": "Precision-engineered over-ear wireless headphones...",
        "PRICE": 249.99,
        "IMAGE_URL": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?...",
        "STOCK_QUANTITY": 45,
        "IS_ACTIVE": 1
      }
    ]
  }
  ```

---

### **Get Product Details**
- **Method**: `GET`
- **Path**: `/api/products/:id`
- **Path Parameter**: `id` - Numeric ID of the product
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "product": {
      "PRODUCT_ID": 1,
      "CATEGORY_ID": 1,
      "CATEGORY_NAME": "Electronics",
      "PRODUCT_NAME": "AeroSound Pro Noise-Cancelling Headphones",
      "DESCRIPTION": "Precision-engineered over-ear wireless headphones with active noise cancellation, 40-hour battery life, and plush memory foam ear cushions.",
      "PRICE": 249.99,
      "IMAGE_URL": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?...",
      "STOCK_QUANTITY": 45,
      "IS_ACTIVE": 1
    }
  }
  ```
- **Error Response (404 Not Found)**:
  ```json
  {
    "success": false,
    "message": "Product not found"
  }
  ```
