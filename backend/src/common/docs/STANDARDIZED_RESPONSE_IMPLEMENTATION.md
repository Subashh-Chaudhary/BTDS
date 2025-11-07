# Standardized Response Implementation

## Overview

This document outlines the implementation of standardized API responses across the application, ensuring consistency and better developer experience.

## Implementation Details

### 1. Response Interfaces (`src/common/interfaces/api-response.interface.ts`)

```typescript
// Main response interface
export interface IApiResponse<T = any> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T | null;
  meta: {
    timestamp: string;
    path?: string;
    method?: string;
  };
}

// Success response interface
export interface IApiSuccessResponse<T = any> {
  success: true;
  statusCode: number;
  message: string;
  data: T;
  meta: {
    timestamp: string;
    path?: string;
    method?: string;
  };
}

// Error response interface
export interface IApiErrorResponse {
  success: false;
  statusCode: number;
  message: string;
  error: string;
  data: null;
  meta: {
    timestamp: string;
    path?: string;
    method?: string;
  };
}

// Pagination interfaces
export interface IPaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface IPaginatedResponse<T> {
  items: T[];
  pagination: IPaginationMeta;
}
```

### 2. Response Helper (`src/common/helpers/response.helper.ts`)

The `ResponseHelper` class provides static methods for creating standardized responses:

```typescript
export class ResponseHelper {
  // Create success response
  static success<T>(
    data: T,
    message: string = 'Operation completed successfully',
    statusCode: number = HttpStatus.OK,
    path?: string,
    method?: string,
  ): IApiSuccessResponse<T>;

  // Create error response
  static error(
    message: string,
    error: string,
    statusCode: number = HttpStatus.BAD_REQUEST,
    path?: string,
    method?: string,
  ): IApiErrorResponse;

  // Create paginated response
  static paginated<T>(
    items: T[],
    page: number,
    limit: number,
    total: number,
    message: string = 'Data retrieved successfully',
    path?: string,
    method?: string,
  ): IApiSuccessResponse<IPaginatedResponse<T>>;

  // Create created response (201)
  static created<T>(
    data: T,
    message: string = 'Resource created successfully',
    path?: string,
    method?: string,
  ): IApiSuccessResponse<T>;

  // Create no content response (204)
  static noContent(
    message: string = 'Operation completed successfully',
    path?: string,
    method?: string,
  ): IApiSuccessResponse<{ message: string }>;
}
```

## Usage in Controllers

### Users Controller Example

```typescript
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Req() req: any,
  ) {
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    const result = await this.usersService.findAll(pageNum, limitNum);

    return ResponseHelper.paginated(
      result.users,
      result.page,
      result.limit,
      result.total,
      'Users retrieved successfully',
      req.url,
      req.method,
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: any) {
    const user = await this.usersService.findById(id);

    // Remove password from response
    const { password, ...userWithoutPassword } = user;

    return ResponseHelper.success(
      userWithoutPassword,
      'User retrieved successfully',
      HttpStatus.OK,
      req.url,
      req.method,
    );
  }

  @Post()
  async create(@Body() createUserDto: CreateUserDto, @Req() req: any) {
    const user = await this.usersService.createUser(createUserDto);

    return ResponseHelper.created(
      user,
      'User created successfully',
      req.url,
      req.method,
    );
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Req() req: any) {
    await this.usersService.deleteUser(id);

    return ResponseHelper.noContent(
      'User deleted successfully',
      req.url,
      req.method,
    );
  }
}
```

### Auth Controller Example

```typescript
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto, @Req() req: any) {
    try {
      const result = await this.authService.register(registerDto);

      return ResponseHelper.created(
        result,
        'User registered successfully',
        req.url,
        req.method,
      );
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        ResponseHelper.error(
          'Registration failed',
          'Internal server error',
          HttpStatus.INTERNAL_SERVER_ERROR,
          req.url,
          req.method,
        ),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto, @Req() req: any) {
    try {
      const result = await this.authService.login(loginDto);

      return ResponseHelper.success(
        result,
        'Login successful',
        HttpStatus.OK,
        req.url,
        req.method,
      );
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        ResponseHelper.error(
          'Login failed',
          'Internal server error',
          HttpStatus.INTERNAL_SERVER_ERROR,
          req.url,
          req.method,
        ),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
```

## Response Examples

### Success Response

```json
{
  "success": true,
  "statusCode": 200,
  "message": "User retrieved successfully",
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "meta": {
    "timestamp": "2024-01-01T00:00:00.000Z",
    "path": "/users/uuid",
    "method": "GET"
  }
}
```

### Error Response

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

### Paginated Response

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
        "name": "John Doe"
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

## Benefits

### 1. Consistency

- All endpoints follow the same response structure
- Predictable format for frontend developers
- Easier to implement client-side error handling

### 2. Debugging

- Request metadata (path, method) included in all responses
- Timestamps for tracking response times
- Clear error messages and codes

### 3. Type Safety

- Strongly typed interfaces for all response types
- TypeScript compilation ensures response structure compliance
- Better IDE support and autocomplete

### 4. Maintainability

- Centralized response creation logic
- Easy to modify response format across all endpoints
- Consistent error handling patterns

### 5. Developer Experience

- Clear and predictable API responses
- Comprehensive error information
- Standardized pagination metadata

## Migration Guide

To migrate existing endpoints to use the standardized response format:

1. **Import ResponseHelper**:

   ```typescript
   import { ResponseHelper } from 'src/common/helpers/response.helper';
   ```

2. **Add Request parameter**:

   ```typescript
   async method(@Req() req: any) {
   ```

3. **Replace manual response creation**:

   ```typescript
   // Before
   return {
     status: 'success',
     statusCode: 200,
     message: 'Success',
     data: result,
     meta: { timestamp: new Date().toISOString() },
   };

   // After
   return ResponseHelper.success(result, 'Success', 200, req.url, req.method);
   ```

4. **Update error handling**:

   ```typescript
   // Before
   throw new HttpException(
     {
       status: 'error',
       message: 'Error message',
     },
     400,
   );

   // After
   throw new HttpException(
     ResponseHelper.error(
       'Error message',
       'Bad Request',
       400,
       req.url,
       req.method,
     ),
     400,
   );
   ```

## Best Practices

1. **Always use ResponseHelper methods** instead of manual response creation
2. **Include request metadata** (path, method) for better debugging
3. **Use appropriate HTTP status codes** for different scenarios
4. **Provide meaningful error messages** for better user experience
5. **Remove sensitive data** (like passwords) from responses
6. **Use pagination for list endpoints** to handle large datasets
7. **Maintain consistent message formatting** across all endpoints

This standardized approach ensures a professional and consistent API experience for all consumers while making the codebase more maintainable and easier to debug.
