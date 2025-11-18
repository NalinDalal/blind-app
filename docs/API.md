# Blind App - API Documentation

## Base Information

- **Base URL:** `blind-app-cyan.vercel.app`
- **Authentication:** JWT Bearer tokens
- **Content-Type:** `application/json`
- **OpenAPI Spec:** [docs/OPENAPI.yaml](OPENAPI.yaml)

## Authentication & Rate Limiting

- All endpoints require JWT authentication unless noted
- OTP requests: 1 per 30 seconds per email
- General API: standard rate limiting applies

## Error Handling

All endpoints return consistent error responses:

```json
{
  "error": "Descriptive error message"
}
```

Common HTTP status codes:

- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `409`: Conflict
- `429`: Too Many Requests
- `500`: Internal Server Error

## Endpoints

### User Registration

`POST /api/register`
Register a new user account with college email validation.

**Request Body:**

```json
{
  "email": "student@oriental.ac.in",
  "password": "securePassword123"
}
```

**Responses:**

- `201 Created`: User created
- `400 Bad Request`: Invalid email or missing fields
- `409 Conflict`: User exists
- `500 Internal Server Error`: Registration failed

### User Login

`POST /api/login`
Authenticate user and receive JWT token.

**Request Body:**

```json
{
  "email": "student@oriental.ac.in",
  "password": "securePassword123"
}
```

**Success Response:**

```json
{
  "token": "...",
  "id": "user-uuid",
  "email": "student@oriental.ac.in",
  "anonName": "Anonymous_Tiger"
}
```

**Error Responses:**

- `400`: Email and password required
- `401`: Invalid credentials
- `500`: Login failed

### OTP Request

`POST /api/request-otp`
Request a 6-digit OTP via email (rate limited).

**Request Body:**

```json
{
  "email": "student@oriental.ac.in"
}
```

**Success Response:**

```json
{
  "message": "OTP sent to your email."
}
```

**Error Responses:**

- `400`: Email required or invalid
- `409`: Rate limit exceeded
- `500`: Failed to send OTP

### OTP Verification

`POST /api/verify-otp`
Verify OTP and mark user as verified.

**Request Body:**

```json
{
  "email": "student@oriental.ac.in",
  "otp": "123456"
}
```

**Success Response:**

```json
{
  "message": "OTP verified",
  "id": "user-uuid",
  "email": "student@oriental.ac.in",
  "anonName": "Anonymous_Tiger"
}
```

**Error Responses:**

- `400`: Email and OTP required
- `401`: User not found or invalid/expired OTP
- `500`: Failed to verify OTP

### Set Anonymous Name

`POST /api/anon/set`
Set or update user's anonymous display name.

**Request Body:**

```json
{
  "anonName": "Anonymous_Tiger"
}
```

**Headers:**

```
Authorization: Bearer <jwt-token>
```

### Content Management

- `POST /api/post`: Create/manage posts
- `POST /api/comment`: Add comments
- `POST /api/like-comment`: Like/unlike comments
- `GET /api/notification`: Retrieve notifications
- `POST /api/token`: Refresh/validate JWT tokens

## Security Notes

- Only `@oriental.ac.in` emails accepted
- JWT tokens expire after 2 hours
- OTP codes valid for 2 minutes
- Passwords hashed with bcrypt
- TOTP for OTP generation

## See Also

- [OpenAPI Spec](OPENAPI.yaml)
- [System Architecture](ARCHITECTURE.md)
- [Component Docs](COMPONENTS.md)
