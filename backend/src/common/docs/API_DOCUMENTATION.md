# API Documentation

## Overview

This API follows industry standards with proper separation of concerns, comprehensive error handling, and well-documented endpoints. The authentication and user management have been properly segregated into separate modules.

## Authentication Module (`/auth`)

### Registration

- **POST** `/auth/register`
- **Description**: Register a new user with email and password
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "name": "John Doe",
    "password": "password123",
    "phone": "1234567890",
    "address": "123 Main St",
    "profile_image": "https://example.com/image.jpg"
  }
  ```
- **Response**:
  ```json
  {
    "status": "success",
    "statusCode": 201,
    "message": "User registered successfully",
    "data": {
      "user": {
        "id": "uuid",
        "email": "user@example.com",
        "name": "John Doe",
        "phone": "1234567890",
        "address": "123 Main St",
        "profile_image": "https://example.com/image.jpg",
        "is_verified": false,
        "created_at": "2024-01-01T00:00:00.000Z",
        "updated_at": "2024-01-01T00:00:00.000Z"
      },
      "access_token": "jwt_token_here"
    },
    "meta": {
      "timestamp": "2024-01-01T00:00:00.000Z"
    }
  }
  ```

### Login

- **POST** `/auth/login`
- **Description**: Authenticate user with email and password
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Response**:
  ```json
  {
    "status": "success",
    "statusCode": 200,
    "message": "Login successful",
    "data": {
      "user": {
        "id": "uuid",
        "email": "user@example.com",
        "name": "John Doe",
        "phone": "1234567890",
        "address": "123 Main St",
        "profile_image": "https://example.com/image.jpg",
        "is_verified": false,
        "created_at": "2024-01-01T00:00:00.000Z",
        "updated_at": "2024-01-01T00:00:00.000Z"
      },
      "access_token": "jwt_token_here"
    },
    "meta": {
      "timestamp": "2024-01-01T00:00:00.000Z"
    }
  }
  ```

### Google OAuth

- **GET** `/auth/google`
- **Description**: Initiate Google OAuth flow
- **Response**: Redirects to Google for authentication

- **GET** `/auth/google/callback`
- **Description**: Google OAuth callback endpoint
- **Response**:
  ```json
  {
    "status": "success",
    "statusCode": 200,
    "message": "Google authentication successful",
    "data": {
      "token": "jwt_token_here",
      "user": {
        "id": "uuid",
        "email": "user@gmail.com",
        "name": "John Doe",
        "social_provider": "google"
      }
    },
    "meta": {
      "timestamp": "2024-01-01T00:00:00.000Z"
    }
  }
  ```

## Users Module (`/users`)

### Get All Users

- **GET** `/users?page=1&limit=10`
- **Description**: Get paginated list of all users
- **Query Parameters**:
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Number of items per page (default: 10)
- **Response**:
  ```json
  {
    "status": "success",
    "statusCode": 200,
    "message": "Users retrieved successfully",
    "data": {
      "users": [
        {
          "id": "uuid",
          "email": "user@example.com",
          "name": "John Doe",
          "phone": "1234567890",
          "address": "123 Main St",
          "profile_image": "https://example.com/image.jpg",
          "is_verified": false,
          "created_at": "2024-01-01T00:00:00.000Z",
          "updated_at": "2024-01-01T00:00:00.000Z"
        }
      ],
      "total": 1,
      "page": 1,
      "limit": 10
    },
    "meta": {
      "timestamp": "2024-01-01T00:00:00.000Z"
    }
  }
  ```

### Get User by ID

- **GET** `/users/:id`
- **Description**: Get specific user by ID
- **Response**:
  ```json
  {
    "status": "success",
    "statusCode": 200,
    "message": "User retrieved successfully",
    "data": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "phone": "1234567890",
      "address": "123 Main St",
      "profile_image": "https://example.com/image.jpg",
      "is_verified": false,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    },
    "meta": {
      "timestamp": "2024-01-01T00:00:00.000Z"
    }
  }
  ```

### Update User

- **PATCH** `/users/:id`
- **Description**: Update user information
- **Request Body** (all fields optional):
  ```json
  {
    "name": "Jane Doe",
    "phone": "0987654321",
    "address": "456 Oak St",
    "profile_image": "https://example.com/new-image.jpg"
  }
  ```
- **Response**:
  ```json
  {
    "status": "success",
    "statusCode": 200,
    "message": "User updated successfully",
    "data": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "Jane Doe",
      "phone": "0987654321",
      "address": "456 Oak St",
      "profile_image": "https://example.com/new-image.jpg",
      "is_verified": false,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    },
    "meta": {
      "timestamp": "2024-01-01T00:00:00.000Z"
    }
  }
  ```

### Delete User

- **DELETE** `/users/:id`
- **Description**: Delete user by ID
- **Response**:
  ```json
  {
    "status": "success",
    "statusCode": 204,
    "message": "User deleted successfully",
    "data": {
      "message": "User deleted successfully"
    },
    "meta": {
      "timestamp": "2024-01-01T00:00:00.000Z"
    }
  }
  ```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "status": "error",
  "statusCode": 400,
  "message": "Error description",
  "data": null,
  "meta": {
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

Common HTTP status codes:

- `200` - Success
- `201` - Created
- `204` - No Content
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

## Code Structure Improvements

### 1. Separation of Concerns

- **Auth Module**: Handles authentication, registration, and OAuth
- **Users Module**: Handles user CRUD operations
- **Clear boundaries** between authentication and user management

### 2. Industry Standards

- **Consistent API responses** using `IApiResponse` interface
- **Proper HTTP status codes** for each operation
- **Comprehensive error handling** with meaningful messages
- **Input validation** using DTOs with class-validator decorators
- **Password hashing** for security
- **JWT token generation** for authentication

### 3. Code Quality

- **Comprehensive comments** for all methods and classes
- **Type safety** with TypeScript
- **Proper error handling** with try-catch blocks
- **Clean code structure** following NestJS conventions
- **Pagination support** for list endpoints
- **Data sanitization** (passwords removed from responses)

### 4. Security Features

- **Password hashing** using bcrypt
- **JWT token authentication**
- **Input validation** and sanitization
- **Conflict detection** for duplicate emails
- **Social authentication** support

## Usage Examples

### Register a new user:

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "name": "John Doe",
    "password": "password123"
  }'
```

### Login:

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### Get all users:

```bash
curl -X GET "http://localhost:3000/users?page=1&limit=10"
```

### Update user:

```bash
curl -X PATCH http://localhost:3000/users/user-id-here \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe",
    "phone": "0987654321"
  }'
```
