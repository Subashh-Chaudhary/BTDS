# Crop Disease Detection System - Implementation Guide

## Overview

This guide provides step-by-step instructions for implementing the user management system with three user types: Admin, Plant Doctor (Expert), and Farmer.

## Prerequisites

- Node.js and npm installed
- PostgreSQL database
- NestJS CLI installed globally

## Step 1: Database Setup

### 1.1 Update Database Configuration

Ensure your database configuration supports the new entities:

```typescript
// src/config/database.config..ts
export default () => ({
  database: {
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: ['dist/**/*.entity{.ts,.js}', 'src/**/*.entity{.ts,.js}'],
    synchronize: process.env.NODE_ENV !== 'production',
    logging: process.env.NODE_ENV !== 'production',
  },
});
```

### 1.2 Run Database Migrations

```bash
# Generate migration for new entities
npm run migration:generate -- src/database/migrations/CreateUserManagementTables

# Run migrations
npm run migration:run
```

## Step 2: Environment Variables

Add the following to your `.env` file:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_NAME=crop_disease_db

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=24h

# Email (for verification)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

## Step 3: Install Dependencies

```bash
# Install required packages
npm install @nestjs/swagger class-transformer class-validator
npm install --save-dev @types/bcrypt
```

## Step 4: Implementation Steps

### 4.1 Update User Entity

The `Users` entity has been updated with:

- `user_type` field (enum: farmer, expert, admin)
- Proper relationships with Expert and Farmer entities

### 4.2 Create Expert Entity

The `Expert` entity includes:

- Specialization, experience, qualifications
- License number and availability status
- Rating and case tracking

### 4.3 Create Farmer Entity

The `Farmer` entity includes:

- Farm size and type
- Location coordinates
- Preferred crops

### 4.4 Create DTOs

- `RegisterDto`: Unified registration for farmers and experts
- `ExpertProfileDto`: Expert-specific fields
- `FarmerProfileDto`: Farmer-specific fields

### 4.5 Create Services

- `ExpertService`: Handles expert-specific operations
- `FarmerService`: Handles farmer-specific operations
- Updated `UsersService`: Includes unified registration logic

### 4.6 Create Controllers

- `ExpertController`: Expert management endpoints
- `FarmerController`: Farmer management endpoints
- Updated `UsersController`: Includes registration endpoint

## Step 5: Testing the Implementation

### 5.1 Start the Application

```bash
npm run start:dev
```

### 5.2 Test Registration Endpoints

#### Register a Farmer

```bash
curl -X POST http://localhost:3000/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Farmer",
    "email": "john@farmer.com",
    "password": "password123",
    "phone": "+1234567890",
    "address": "Farm Address",
    "user_type": "farmer",
    "farmer_profile": {
      "farm_size": 50.5,
      "farm_type": "organic",
      "preferred_crops": ["corn", "wheat", "soybeans"]
    }
  }'
```

#### Register an Expert

```bash
curl -X POST http://localhost:3000/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Dr. Smith",
    "email": "dr.smith@expert.com",
    "password": "password123",
    "phone": "+1234567890",
    "address": "Expert Address",
    "user_type": "expert",
    "expert_profile": {
      "specialization": "Plant Pathology",
      "experience_years": 10,
      "qualifications": "PhD in Agriculture",
      "license_number": "EXP123456"
    }
  }'
```

### 5.3 Test Login

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@farmer.com",
    "password": "password123"
  }'
```

### 5.4 Test Admin Login

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@cropdisease.com",
    "password": "admin123"
  }'
```

## Step 6: API Endpoints Reference

### Authentication

- `POST /register` - Unified registration
- `POST /auth/login` - Login for all user types
- `POST /auth/verify-email` - Email verification

### User Management

- `GET /users` - List all users (admin only)
- `GET /users/type/:type` - Get users by type
- `GET /users/statistics` - Get user statistics
- `GET /user/:id` - Get specific user
- `PATCH /user/:id` - Update user
- `DELETE /user/:id` - Delete user

### Expert Management

- `GET /experts` - List all experts
- `GET /experts/available` - Get available experts
- `GET /experts/profile` - Get current expert profile
- `PUT /experts/profile` - Update expert profile
- `PUT /experts/availability` - Update availability
- `GET /experts/:id` - Get expert by ID

### Farmer Management

- `GET /farmers` - List all farmers
- `GET /farmers/profile` - Get current farmer profile
- `PUT /farmers/profile` - Update farmer profile
- `GET /farmers/statistics` - Get farmer statistics
- `GET /farmers/by-farm-type/:farmType` - Get farmers by farm type
- `GET /farmers/by-crop/:crop` - Get farmers by preferred crop
- `GET /farmers/:id` - Get farmer by ID

## Step 7: Security Considerations

### 7.1 Role-Based Access Control

Implement middleware to check user permissions:

```typescript
// src/common/guards/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../enums/user-role.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      'roles',
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user.user_type === role);
  }
}
```

### 7.2 JWT Authentication

Ensure JWT tokens include user type information:

```typescript
// src/modules/auth/auth.service.ts
async login(user: Users) {
  const payload = {
    email: user.email,
    sub: user.id,
    user_type: user.user_type
  };

  return {
    access_token: this.jwtService.sign(payload),
    user_type: user.user_type,
  };
}
```

## Step 8: Production Deployment

### 8.1 Environment Configuration

- Set `NODE_ENV=production`
- Use strong JWT secrets
- Configure proper database credentials
- Set up email service for verification

### 8.2 Database Migration

```bash
# Disable synchronize in production
# Use proper migrations
npm run migration:run
```

### 8.3 Admin User Setup

The admin user will be automatically created on first run. Change the default password:

```typescript
// Update admin password in production
const adminPassword = await hashPassword(process.env.ADMIN_PASSWORD);
```

## Step 9: Monitoring and Logging

### 9.1 Add Logging

```typescript
// src/common/interceptors/logging.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, user } = request;

    console.log(
      `[${new Date().toISOString()}] ${method} ${url} - User: ${user?.email || 'anonymous'}`,
    );

    return next.handle();
  }
}
```

### 9.2 Error Handling

Ensure proper error handling for all endpoints:

```typescript
// src/common/filters/http-exception.filter.ts
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const status = exception.getStatus();

    response.status(status).json({
      success: false,
      message: exception.message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
```

## Step 10: Testing

### 10.1 Unit Tests

```bash
# Run unit tests
npm run test

# Run specific test file
npm run test users.service.spec.ts
```

### 10.2 E2E Tests

```bash
# Run e2e tests
npm run test:e2e
```

### 10.3 API Testing

Use tools like Postman or curl to test all endpoints with different user types.

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Check database credentials
   - Ensure database is running
   - Verify entity synchronization

2. **JWT Token Issues**
   - Check JWT secret configuration
   - Verify token expiration settings
   - Ensure proper token format

3. **Validation Errors**
   - Check DTO validation rules
   - Verify request body format
   - Ensure all required fields are provided

4. **Module Import Errors**
   - Check module dependencies
   - Verify import paths
   - Ensure all modules are properly exported

### Debug Mode

Enable debug logging:

```typescript
// main.ts
const app = await NestFactory.create(AppModule, {
  logger: ['error', 'warn', 'debug', 'log', 'verbose'],
});
```

## Next Steps

1. Implement email verification system
2. Add password reset functionality
3. Implement social login integration
4. Add file upload for profile images
5. Implement notification system
6. Add audit logging
7. Implement rate limiting
8. Add API documentation with Swagger

## Support

For issues and questions:

1. Check the documentation
2. Review error logs
3. Test with minimal data
4. Verify environment configuration
