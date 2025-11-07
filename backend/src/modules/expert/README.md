# Expert Module API Documentation

This document provides comprehensive documentation for all Expert module endpoints with standardized responses.

## Base URL

```
/api/v1
```

## Standard Response Format

All endpoints return responses in the following standardized format:

### Success Response

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Operation completed successfully",
  "data": {
    // Response data here
  },
  "meta": {
    "timestamp": "2024-01-01T00:00:00.000Z",
    "path": "/api/v1/endpoint",
    "method": "GET"
  }
}
```

### Error Response

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Error message",
  "error": "Detailed error information",
  "data": null,
  "meta": {
    "timestamp": "2024-01-01T00:00:00.000Z",
    "path": "/api/v1/endpoint",
    "method": "POST"
  }
}
```

### Paginated Response

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Data retrieved successfully",
  "data": {
    "items": [
      // Array of items
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "totalPages": 10,
      "hasNext": true,
      "hasPrev": false
    }
  },
  "meta": {
    "timestamp": "2024-01-01T00:00:00.000Z",
    "path": "/api/v1/endpoint",
    "method": "GET"
  }
}
```

## Endpoints

### 1. Get All Experts (Paginated)

**GET** `/experts`

Retrieves a paginated list of all experts.

#### Query Parameters

- `page` (optional): Page number (default: 1)
- `limit` (optional): Number of items per page (default: 10)

#### Example Request

```
GET /api/v1/experts?page=1&limit=10
```

#### Example Response

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Experts retrieved successfully",
  "data": {
    "items": [
      {
        "id": "uuid",
        "name": "Dr. John Doe",
        "email": "john.doe@example.com",
        "phone": "1234567890",
        "address": "123 Main St",
        "profile_image": "https://example.com/image.jpg",
        "user_type": "EXPERT",
        "is_verified": true,
        "specialization": "Cardiology",
        "experience_years": 10,
        "qualifications": "MD, PhD",
        "license_number": "MD123456",
        "is_available": true,
        "rating": 4.5,
        "total_cases": 150,
        "created_at": "2024-01-01T00:00:00.000Z",
        "updated_at": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "totalPages": 10,
      "hasNext": true,
      "hasPrev": false
    }
  },
  "meta": {
    "timestamp": "2024-01-01T00:00:00.000Z",
    "path": "/api/v1/experts",
    "method": "GET"
  }
}
```

### 2. Get Expert by ID

**GET** `/expert/:id`

Retrieves a specific expert by their ID.

#### Path Parameters

- `id`: Expert UUID

#### Example Request

```
GET /api/v1/expert/123e4567-e89b-12d3-a456-426614174000
```

#### Example Response

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Expert retrieved successfully",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Dr. John Doe",
    "email": "john.doe@example.com",
    "phone": "1234567890",
    "address": "123 Main St",
    "profile_image": "https://example.com/image.jpg",
    "user_type": "EXPERT",
    "is_verified": true,
    "specialization": "Cardiology",
    "experience_years": 10,
    "qualifications": "MD, PhD",
    "license_number": "MD123456",
    "is_available": true,
    "rating": 4.5,
    "total_cases": 150,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  },
  "meta": {
    "timestamp": "2024-01-01T00:00:00.000Z",
    "path": "/api/v1/expert/123e4567-e89b-12d3-a456-426614174000",
    "method": "GET"
  }
}
```

### 3. Update Expert

**PUT** `/expert/:id`

Updates an expert's information.

#### Path Parameters

- `id`: Expert UUID

#### Request Body

```json
{
  "name": "Dr. John Doe Updated",
  "email": "john.updated@example.com",
  "phone": "1234567890",
  "address": "456 Updated St",
  "profile_image": "https://example.com/updated-image.jpg",
  "specialization": "Neurology",
  "experience_years": 12,
  "qualifications": "MD, PhD, Fellowship",
  "license_number": "MD123456",
  "is_available": true,
  "is_verified": true
}
```

#### Example Response

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Expert updated successfully",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Dr. John Doe Updated",
    "email": "john.updated@example.com",
    "phone": "1234567890",
    "address": "456 Updated St",
    "profile_image": "https://example.com/updated-image.jpg",
    "user_type": "EXPERT",
    "is_verified": true,
    "specialization": "Neurology",
    "experience_years": 12,
    "qualifications": "MD, PhD, Fellowship",
    "license_number": "MD123456",
    "is_available": true,
    "rating": 4.5,
    "total_cases": 150,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  },
  "meta": {
    "timestamp": "2024-01-01T00:00:00.000Z",
    "path": "/api/v1/expert/123e4567-e89b-12d3-a456-426614174000",
    "method": "PUT"
  }
}
```

### 4. Delete Expert

**DELETE** `/expert/:id`

Deletes an expert from the system.

#### Path Parameters

- `id`: Expert UUID

#### Example Request

```
DELETE /api/v1/expert/123e4567-e89b-12d3-a456-426614174000
```

#### Example Response

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Expert deleted successfully",
  "data": {
    "message": "Expert deleted successfully"
  },
  "meta": {
    "timestamp": "2024-01-01T00:00:00.000Z",
    "path": "/api/v1/expert/123e4567-e89b-12d3-a456-426614174000",
    "method": "DELETE"
  }
}
```

### 5. Get Current Expert Profile

**GET** `/expert/profile/me`

Retrieves the current authenticated expert's profile.

#### Headers

- `Authorization`: Bearer token required

#### Example Request

```
GET /api/v1/expert/profile/me
Authorization: Bearer <token>
```

#### Example Response

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Profile retrieved successfully",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Dr. John Doe",
    "email": "john.doe@example.com",
    "phone": "1234567890",
    "address": "123 Main St",
    "profile_image": "https://example.com/image.jpg",
    "user_type": "EXPERT",
    "is_verified": true,
    "specialization": "Cardiology",
    "experience_years": 10,
    "qualifications": "MD, PhD",
    "license_number": "MD123456",
    "is_available": true,
    "rating": 4.5,
    "total_cases": 150,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  },
  "meta": {
    "timestamp": "2024-01-01T00:00:00.000Z",
    "path": "/api/v1/expert/profile/me",
    "method": "GET"
  }
}
```

### 6. Update Current Expert Profile

**PUT** `/expert/profile/me`

Updates the current authenticated expert's profile.

#### Headers

- `Authorization`: Bearer token required

#### Request Body

```json
{
  "name": "Dr. John Doe Updated",
  "phone": "1234567890",
  "address": "456 Updated St",
  "specialization": "Neurology",
  "experience_years": 12,
  "qualifications": "MD, PhD, Fellowship"
}
```

#### Example Response

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Profile updated successfully",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Dr. John Doe Updated",
    "email": "john.doe@example.com",
    "phone": "1234567890",
    "address": "456 Updated St",
    "profile_image": "https://example.com/image.jpg",
    "user_type": "EXPERT",
    "is_verified": true,
    "specialization": "Neurology",
    "experience_years": 12,
    "qualifications": "MD, PhD, Fellowship",
    "license_number": "MD123456",
    "is_available": true,
    "rating": 4.5,
    "total_cases": 150,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  },
  "meta": {
    "timestamp": "2024-01-01T00:00:00.000Z",
    "path": "/api/v1/expert/profile/me",
    "method": "PUT"
  }
}
```

### 7. Get Available Experts

**GET** `/expert/available/list`

Retrieves all available experts sorted by rating.

#### Example Request

```
GET /api/v1/expert/available/list
```

#### Example Response

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Available experts retrieved successfully",
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Dr. John Doe",
      "email": "john.doe@example.com",
      "specialization": "Cardiology",
      "experience_years": 10,
      "rating": 4.8,
      "is_available": true,
      "total_cases": 150
    }
  ],
  "meta": {
    "timestamp": "2024-01-01T00:00:00.000Z",
    "path": "/api/v1/expert/available/list",
    "method": "GET"
  }
}
```

### 8. Search Experts by Specialization

**GET** `/expert/search/specialization/:specialization`

Retrieves experts by specialization.

#### Path Parameters

- `specialization`: Expert specialization

#### Example Request

```
GET /api/v1/expert/search/specialization/Cardiology
```

#### Example Response

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Experts found by specialization",
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Dr. John Doe",
      "email": "john.doe@example.com",
      "specialization": "Cardiology",
      "experience_years": 10,
      "rating": 4.5,
      "is_available": true,
      "total_cases": 150
    }
  ],
  "meta": {
    "timestamp": "2024-01-01T00:00:00.000Z",
    "path": "/api/v1/expert/search/specialization/Cardiology",
    "method": "GET"
  }
}
```

### 9. Search Experts by Experience Range

**GET** `/expert/search/experience`

Retrieves experts within a specific experience range.

#### Query Parameters

- `minYears`: Minimum years of experience
- `maxYears`: Maximum years of experience

#### Example Request

```
GET /api/v1/expert/search/experience?minYears=5&maxYears=15
```

#### Example Response

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Experts found by experience range",
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Dr. John Doe",
      "email": "john.doe@example.com",
      "specialization": "Cardiology",
      "experience_years": 10,
      "rating": 4.5,
      "is_available": true,
      "total_cases": 150
    }
  ],
  "meta": {
    "timestamp": "2024-01-01T00:00:00.000Z",
    "path": "/api/v1/expert/search/experience",
    "method": "GET"
  }
}
```

### 10. Get Top Rated Experts

**GET** `/expert/top-rated/list`

Retrieves top rated experts.

#### Query Parameters

- `limit` (optional): Number of experts to return (default: 10, max: 100)

#### Example Request

```
GET /api/v1/expert/top-rated/list?limit=5
```

#### Example Response

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Top rated experts retrieved successfully",
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Dr. John Doe",
      "email": "john.doe@example.com",
      "specialization": "Cardiology",
      "experience_years": 10,
      "rating": 4.8,
      "is_available": true,
      "total_cases": 150
    }
  ],
  "meta": {
    "timestamp": "2024-01-01T00:00:00.000Z",
    "path": "/api/v1/expert/top-rated/list",
    "method": "GET"
  }
}
```

### 11. Update Expert Availability

**PUT** `/expert/:id/availability`

Updates an expert's availability status.

#### Path Parameters

- `id`: Expert UUID

#### Request Body

```json
{
  "isAvailable": true
}
```

#### Example Response

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Expert availability updated successfully",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Dr. John Doe",
    "email": "john.doe@example.com",
    "is_available": true,
    "rating": 4.5,
    "total_cases": 150,
    "updated_at": "2024-01-01T00:00:00.000Z"
  },
  "meta": {
    "timestamp": "2024-01-01T00:00:00.000Z",
    "path": "/api/v1/expert/123e4567-e89b-12d3-a456-426614174000/availability",
    "method": "PUT"
  }
}
```

### 12. Update Expert Rating

**PUT** `/expert/:id/rating`

Updates an expert's rating.

#### Path Parameters

- `id`: Expert UUID

#### Request Body

```json
{
  "rating": 4.7
}
```

#### Example Response

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Expert rating updated successfully",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Dr. John Doe",
    "email": "john.doe@example.com",
    "rating": 4.7,
    "total_cases": 150,
    "updated_at": "2024-01-01T00:00:00.000Z"
  },
  "meta": {
    "timestamp": "2024-01-01T00:00:00.000Z",
    "path": "/api/v1/expert/123e4567-e89b-12d3-a456-426614174000/rating",
    "method": "PUT"
  }
}
```

### 13. Get Expert Statistics

**GET** `/expert/stats`

Retrieves expert statistics.

#### Example Request

```
GET /api/v1/expert/stats
```

#### Example Response

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Expert statistics retrieved successfully",
  "data": {
    "total_experts": 150,
    "available_experts": 120,
    "average_rating": 4.2,
    "total_cases": 5000
  },
  "meta": {
    "timestamp": "2024-01-01T00:00:00.000Z",
    "path": "/api/v1/expert/stats",
    "method": "GET"
  }
}
```

## Error Responses

### 404 - Expert Not Found

```json
{
  "success": false,
  "statusCode": 404,
  "message": "Expert not found",
  "error": "Expert with ID 123e4567-e89b-12d3-a456-426614174000 not found",
  "data": null,
  "meta": {
    "timestamp": "2024-01-01T00:00:00.000Z",
    "path": "/api/v1/expert/123e4567-e89b-12d3-a456-426614174000",
    "method": "GET"
  }
}
```

### 409 - Email Already Exists

```json
{
  "success": false,
  "statusCode": 409,
  "message": "Expert with this email already exists",
  "error": "Email john.doe@example.com is already registered",
  "data": null,
  "meta": {
    "timestamp": "2024-01-01T00:00:00.000Z",
    "path": "/api/v1/expert/123e4567-e89b-12d3-a456-426614174000",
    "method": "PUT"
  }
}
```

### 400 - Validation Error

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Rating must be a number between 0 and 5",
  "data": null,
  "meta": {
    "timestamp": "2024-01-01T00:00:00.000Z",
    "path": "/api/v1/expert/123e4567-e89b-12d3-a456-426614174000/rating",
    "method": "PUT"
  }
}
```

## Data Transfer Objects (DTOs)

### UpdateExpertDto

```typescript
{
  email?: string;           // Valid email address
  name?: string;            // 3-100 characters
  phone?: string;           // Numbers only
  address?: string;         // String
  profile_image?: string;   // Valid URL
  specialization?: string;  // Max 255 characters
  experience_years?: number; // 0-50
  qualifications?: string;  // String
  license_number?: string;  // Max 100 characters
  is_available?: boolean;   // Boolean
  is_verified?: boolean;    // Boolean
}
```

### UpdateAvailabilityDto

```typescript
{
  isAvailable: boolean; // Required boolean
}
```

### UpdateRatingDto

```typescript
{
  rating: number; // 0-5, required number
}
```

## Notes

1. All timestamps are in ISO 8601 format
2. All UUIDs are in standard UUID v4 format
3. Ratings are decimal numbers with 2 decimal places (e.g., 4.50)
4. Experience years are integers
5. Pagination is 1-indexed
6. All endpoints return standardized responses with consistent structure
7. Error responses include detailed error information for debugging
8. Authentication is required for profile-related endpoints
9. Validation is performed on all input data using class-validator
10. Response metadata includes request path and method for tracking
