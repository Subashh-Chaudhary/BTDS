# Refactored User Management System - Implementation Summary

## Overview

The user management system has been refactored to use separate tables for each user type, providing better performance, cleaner schema, and simpler queries.

## New Database Structure

### 1. Users Table (Admin Only)

```typescript
@Entity()
export class Users {
  // Basic user fields for admin users only
  id, name, email, password, phone, address, profile_image
  user_type: UserRole.ADMIN (default)
  // Authentication fields
  is_verified, verification_token, password_reset_token, etc.
  // Social login fields
  social_provider, social_id
}
```

### 2. Experts Table (Expert Users + Expert Data)

```typescript
@Entity()
export class Expert {
  // Complete user fields
  id, name, email, password, phone, address, profile_image
  user_type: UserRole.EXPERT (default)
  // Authentication fields
  is_verified, verification_token, password_reset_token, etc.
  // Social login fields
  social_provider, social_id
  // Expert-specific fields
  specialization, experience_years, qualifications, license_number
  is_available, rating, total_cases
}
```

### 3. Farmers Table (Farmer Users + Farmer Data)

```typescript
@Entity()
export class Farmer {
  // Complete user fields
  id, name, email, password, phone, address, profile_image
  user_type: UserRole.FARMER (default)
  // Authentication fields
  is_verified, verification_token, password_reset_token, etc.
  // Social login fields
  social_provider, social_id
  // Farmer-specific fields
  farm_size, farm_type, location_coordinates, preferred_crops
}
```

## Key Benefits

### 1. **Performance Improvements**

- No JOINs needed for type-specific queries
- Direct access to user data
- Faster queries for large datasets

### 2. **Cleaner Schema**

- Each table contains only relevant data
- No orphaned profile records
- Self-contained tables

### 3. **Simpler Code**

- No complex relationships to manage
- Direct CRUD operations
- Easier maintenance

### 4. **Better Data Integrity**

- No foreign key dependencies
- Atomic operations
- Consistent data structure

## Registration Flow

### Unified Registration Process

```typescript
// Single endpoint: POST /register
{
  "name": "string",
  "email": "string",
  "password": "string",
  "phone": "string (optional)",
  "address": "string (optional)",
  "user_type": "farmer" | "expert",
  "expert_profile": {
    "specialization": "string",
    "experience_years": "number",
    "qualifications": "string",
    "license_number": "string"
  },
  "farmer_profile": {
    "farm_size": "number",
    "farm_type": "string",
    "preferred_crops": ["string"]
  }
}
```

### Registration Logic

1. **Validate user type** (farmer or expert only)
2. **Check email uniqueness** across all tables
3. **Create user in appropriate table** based on user_type
4. **Return user object** with type information

## Service Layer Changes

### ExpertService

- `createExpert()`: Creates complete expert user with profile
- `findById()`: Find expert by ID
- `findByEmail()`: Find expert by email
- `updateExpert()`: Update expert profile
- `getAvailableExperts()`: Get available experts

### FarmerService

- `createFarmer()`: Creates complete farmer user with profile
- `findById()`: Find farmer by ID
- `findByEmail()`: Find farmer by email
- `updateFarmer()`: Update farmer profile
- `getStatistics()`: Get farmer statistics

### UsersService

- `register()`: Unified registration for farmers and experts
- `checkEmailExists()`: Check email across all tables
- `findByEmail()`: Find user by email across all tables
- `getStatistics()`: Get statistics across all tables

## API Endpoints

### Registration

- `POST /register` - Unified registration for farmers and experts

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

### Admin Management

- `GET /users` - List all admin users
- `GET /users/statistics` - Get user statistics
- `GET /user/:id` - Get specific admin user
- `PATCH /user/:id` - Update admin user
- `DELETE /user/:id` - Delete admin user

## Authentication Considerations

### Login Process

The authentication system needs to be updated to:

1. Check email across all tables (users, experts, farmers)
2. Return appropriate user object with type information
3. Generate JWT with user type and ID

### JWT Payload

```typescript
{
  email: string,
  sub: string, // user ID
  user_type: "admin" | "expert" | "farmer",
  table: "users" | "experts" | "farmers" // for routing
}
```

## Migration Strategy

### Database Migration

1. Create new tables (experts, farmers)
2. Migrate existing data from users table
3. Update foreign key relationships
4. Test data integrity

### Code Migration

1. Update entity relationships
2. Modify service methods
3. Update controllers
4. Test all endpoints

## Testing

### Unit Tests

- Test each service method
- Verify email uniqueness across tables
- Test registration flow for each user type

### Integration Tests

- Test complete registration flow
- Verify data storage in correct tables
- Test authentication across tables

### E2E Tests

- Test user journey for each type
- Verify API responses
- Test error scenarios

## Future Enhancements

### 1. Authentication Service Updates

- Implement cross-table user lookup
- Update JWT generation
- Add role-based middleware

### 2. Admin Dashboard

- Unified user management interface
- Statistics across all tables
- Bulk operations

### 3. Performance Optimizations

- Add database indexes
- Implement caching
- Query optimization

## Conclusion

The refactored system provides:

- **Better Performance**: No JOINs, direct queries
- **Cleaner Architecture**: Separate concerns, self-contained tables
- **Easier Maintenance**: Simpler code, fewer dependencies
- **Scalability**: Better suited for large-scale applications

This approach is more suitable for the crop disease detection system where farmers and experts have distinct data requirements and are rarely queried together.
