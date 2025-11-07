# Standardized API Documentation

## Overview

This API follows a standardized response format for all endpoints, ensuring consistency and better developer experience. All responses include metadata such as timestamps, request paths, and HTTP methods.

## Standard Response Format

### Success Response Structure

```typescript
{
  "success": true,
  "statusCode": number,
  "message": string,
  "data": T,
  "meta": {
    "timestamp": string,
    "path": string,
    "method": string
  }
}
```

### Error Response Structure

```typescript
{
  "success": false,
  "statusCode": number,
  "message": string,
  "error": string,
  "data": null,
  "meta": {
    "timestamp": string,
    "path": string,
    "method": string
  }
}
```

### Paginated Response Structure

```typescript
{
  "success": true,
  "statusCode": 200,
  "message": string,
  "data": {
    "items": T[],
    "pagination": {
      "page": number,
      "limit": number,
      "total": number,
      "totalPages": number,
      "hasNext": boolean,
      "hasPrev": boolean
    }
  },
  "meta": {
    "timestamp": string,
    "path": string,
    "method": string
  }
}
```

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
- **Success Response** (201):
  ```json
  {
    "success": true,
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
      "timestamp": "2024-01-01T00:00:00.000Z",
      "path": "/auth/register",
      "method": "POST"
    }
  }
  ```
- **Error Response** (409):
  ```json
  {
    "success": false,
    "statusCode": 409,
    "message": "User with this email already exists",
    "error": "Conflict",
    "data": null,
    "meta": {
      "timestamp": "2024-01-01T00:00:00.000Z",
      "path": "/auth/register",
      "method": "POST"
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
- **Success Response** (200):
  ```json
  {
    "success": true,
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
      "timestamp": "2024-01-01T00:00:00.000Z",
      "path": "/auth/login",
      "method": "POST"
    }
  }
  ```
- **Error Response** (401):
  ```json
  {
    "success": false,
    "statusCode": 401,
    "message": "Invalid credentials",
    "error": "Unauthorized",
    "data": null,
    "meta": {
      "timestamp": "2024-01-01T00:00:00.000Z",
      "path": "/auth/login",
      "method": "POST"
    }
  }
  ```

### Google OAuth

- **GET** `/auth/google`
- **Description**: Initiate Google OAuth flow
- **Response**: Redirects to Google for authentication

- **GET** `/auth/google/callback`
- **Description**: Google OAuth callback endpoint
- **Success Response** (200):
  ```json
  {
    "success": true,
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
      "timestamp": "2024-01-01T00:00:00.000Z",
      "path": "/auth/google/callback",
      "method": "GET"
    }
  }
  ```

## Users Module (`/users`)

### Get All Users (Paginated)

- **GET** `/users?page=1&limit=10`
- **Description**: Get paginated list of all users
- **Query Parameters**:
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Number of items per page (default: 10)
- **Success Response** (200):
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "Users retrieved successfully",
    "data": {
      "items": [
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
      "pagination": {
        "page": 1,
        "limit": 10,
        "total": 1,
        "totalPages": 1,
        "hasNext": false,
        "hasPrev": false
      }
    },
    "meta": {
      "timestamp": "2024-01-01T00:00:00.000Z",
      "path": "/users?page=1&limit=10",
      "method": "GET"
    }
  }
  ```

### Get User by ID

- **GET** `/users/:id`
- **Description**: Get specific user by ID
- **Success Response** (200):
  ```json
  {
    "success": true,
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
      "timestamp": "2024-01-01T00:00:00.000Z",
      "path": "/users/uuid",
      "method": "GET"
    }
  }
  ```
- **Error Response** (404):
  ```json
  {
    "success": false,
    "statusCode": 404,
    "message": "User not found",
    "error": "Not Found",
    "data": null,
    "meta": {
      "timestamp": "2024-01-01T00:00:00.000Z",
      "path": "/users/invalid-id",
      "method": "GET"
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
- **Success Response** (200):
  ```json
  {
    "success": true,
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
      "timestamp": "2024-01-01T00:00:00.000Z",
      "path": "/users/uuid",
      "method": "PATCH"
    }
  }
  ```

### Delete User

- **DELETE** `/users/:id`
- **Description**: Delete user by ID
- **Success Response** (204):
  ```json
  {
    "success": true,
    "statusCode": 204,
    "message": "User deleted successfully",
    "data": {
      "message": "User deleted successfully"
    },
    "meta": {
      "timestamp": "2024-01-01T00:00:00.000Z",
      "path": "/users/uuid",
      "method": "DELETE"
    }
  }
  ```

## HTTP Status Codes

| Code | Description           | Usage                                           |
| ---- | --------------------- | ----------------------------------------------- |
| 200  | OK                    | Successful GET, PUT, PATCH requests             |
| 201  | Created               | Successful POST requests (resource creation)    |
| 204  | No Content            | Successful DELETE requests                      |
| 400  | Bad Request           | Invalid input data                              |
| 401  | Unauthorized          | Invalid credentials or missing authentication   |
| 403  | Forbidden             | Insufficient permissions                        |
| 404  | Not Found             | Resource not found                              |
| 409  | Conflict              | Duplicate resource (e.g., email already exists) |
| 422  | Unprocessable Entity  | Validation errors                               |
| 500  | Internal Server Error | Server errors                                   |

## Error Handling

All endpoints return consistent error responses with:

- **success**: Always `false` for errors
- **statusCode**: Appropriate HTTP status code
- **message**: User-friendly error message
- **error**: Technical error description
- **data**: Always `null` for errors
- **meta**: Request metadata including timestamp, path, and method

## Response Helper Usage

The API uses a `ResponseHelper` class to standardize all responses:

```typescript
// Success response
ResponseHelper.success(data, message, statusCode, path, method);

// Error response
ResponseHelper.error(message, error, statusCode, path, method);

// Created response (201)
ResponseHelper.created(data, message, path, method);

// No content response (204)
ResponseHelper.noContent(message, path, method);

// Paginated response
ResponseHelper.paginated(items, page, limit, total, message, path, method);
```

## Benefits of Standardized Responses

1. **Consistency**: All endpoints follow the same response structure
2. **Debugging**: Metadata includes request path and method for easier debugging
3. **Timestamps**: All responses include ISO timestamps
4. **Type Safety**: Strongly typed interfaces for all response types
5. **Developer Experience**: Predictable response format across all endpoints
6. **Error Handling**: Consistent error response structure
7. **Pagination**: Standardized pagination metadata
8. **Maintainability**: Centralized response creation logic

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

### Get paginated users:

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

This standardized approach ensures a consistent and professional API experience for all consumers.
