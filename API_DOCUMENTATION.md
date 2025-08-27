# Dapper Squad Entertainment - API Documentation

## Overview

This document provides comprehensive documentation for the Dapper Squad Entertainment API endpoints. All APIs are built with Next.js 14 App Router and provide full CRUD functionality for booking management, authentication, and admin operations.

## Base URL
- **Development**: `http://localhost:3000/api`
- **Production**: `https://your-domain.com/api` (when deployed)

## Authentication

The API uses JWT (JSON Web Tokens) stored in HTTP-only cookies for authentication. Admin endpoints require valid authentication.

### Headers
- `Content-Type: application/json` for POST/PUT requests
- `Cookie: auth-token=<jwt-token>` for authenticated requests

## API Endpoints

### 🔐 Authentication API

#### POST /api/auth/login
Authenticate admin user with email and password.

**Request Body:**
```json
{
  "email": "admin@dappersquad.com",
  "password": "admin123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": 1,
    "email": "admin@dappersquad.com",
    "name": "Admin User",
    "role": "admin",
    "lastLogin": "2024-08-27T10:30:00Z"
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "error": "Invalid credentials"
}
```

**Rate Limiting:**
- Max 5 attempts per IP
- 15-minute lockout after exceeding limit

---

#### POST /api/auth/logout
Clear authentication token and logout user.

**Response (200):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

#### GET /api/auth/verify
Verify current authentication token and return user info.

**Response (200):**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "email": "admin@dappersquad.com",
    "name": "Admin User",
    "role": "admin",
    "lastLogin": "2024-08-27T10:30:00Z"
  },
  "tokenValid": true
}
```

**Error Response (401):**
```json
{
  "success": false,
  "error": "Invalid or expired token"
}
```

---

### 📅 Booking Management API

#### POST /api/bookings
Create a new booking (public endpoint).

**Request Body:**
```json
{
  "clientName": "John Doe",
  "clientEmail": "john@example.com",
  "clientPhone": "555-123-4567",
  "eventDate": "2024-12-25",
  "eventStartTime": "2024-12-25T18:00:00",
  "eventEndTime": "2024-12-25T23:00:00",
  "eventType": "Wedding Reception",
  "services": ["DJ Services", "Photography"],
  "venueName": "Grand Ballroom",
  "venueAddress": "123 Main St, Chicago, IL",
  "guestCount": 150,
  "specialRequests": "Play romantic music during dinner",
  "totalAmount": 2500,
  "depositAmount": 500
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Booking created successfully",
  "booking": {
    "id": "clp123456789",
    "reference": "DSE-123456-ABC",
    "clientName": "John Doe",
    "status": "PENDING",
    "createdAt": "2024-08-27T10:30:00Z"
  }
}
```

---

#### GET /api/bookings
List all bookings (admin only).

**Query Parameters:**
- `status`: Filter by booking status (PENDING, CONFIRMED, etc.)
- `dateFrom`: Start date filter (YYYY-MM-DD)
- `dateTo`: End date filter (YYYY-MM-DD)
- `limit`: Number of results (default: 50, max: 250)
- `offset`: Pagination offset (default: 0)

**Example:** `GET /api/bookings?status=PENDING&limit=10`

**Response (200):**
```json
{
  "success": true,
  "bookings": [
    {
      "id": "clp123456789",
      "bookingReference": "DSE-123456-ABC",
      "clientName": "John Doe",
      "clientEmail": "john@example.com",
      "eventDate": "2024-12-25T00:00:00Z",
      "eventType": "Wedding Reception",
      "status": "PENDING",
      "paymentStatus": "UNPAID",
      "totalAmount": 2500,
      "createdAt": "2024-08-27T10:30:00Z"
    }
  ],
  "pagination": {
    "total": 1,
    "limit": 50,
    "offset": 0,
    "hasMore": false
  }
}
```

---

#### GET /api/bookings/[id]
Get specific booking by ID (public for booking reference lookup).

**Response (200):**
```json
{
  "success": true,
  "booking": {
    "id": "clp123456789",
    "bookingReference": "DSE-123456-ABC",
    "clientName": "John Doe",
    "clientEmail": "john@example.com",
    "eventDate": "2024-12-25T00:00:00Z",
    "eventType": "Wedding Reception",
    "servicesNeeded": ["DJ Services", "Photography"],
    "status": "PENDING",
    "totalAmount": 2500,
    "calendarAvailability": [
      {
        "date": "2024-12-25",
        "isAvailable": false
      }
    ],
    "emailNotifications": [
      {
        "status": "SENT",
        "templateName": "booking-confirmation",
        "sentAt": "2024-08-27T10:31:00Z"
      }
    ]
  }
}
```

---

#### PUT /api/bookings/[id]
Update booking (admin only).

**Request Body (partial updates supported):**
```json
{
  "status": "CONFIRMED",
  "paymentStatus": "DEPOSIT_PAID",
  "specialRequests": "Updated requirements"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Booking updated successfully",
  "booking": {
    "id": "clp123456789",
    "status": "CONFIRMED",
    "updatedAt": "2024-08-27T11:00:00Z"
  }
}
```

---

#### DELETE /api/bookings/[id]
Delete/cancel booking (admin only).

**Response (200):**
```json
{
  "success": true,
  "message": "Booking deleted successfully"
}
```

**Note:** Confirmed or in-progress bookings cannot be deleted.

---

#### GET /api/bookings/availability
Check date availability for bookings (public endpoint).

**Query Parameters (required):**
- `month`: Month (1-12)
- `year`: Year (2024-2030)

**Example:** `GET /api/bookings/availability?month=12&year=2024`

**Response (200):**
```json
{
  "success": true,
  "month": 12,
  "year": 2024,
  "availableDates": [
    "2024-12-01",
    "2024-12-02",
    "2024-12-05",
    "2024-12-08"
  ],
  "totalAvailable": 26
}
```

---

### 📅 Calendar Management API

#### GET /api/calendar
Get calendar data with availability and bookings.

**Query Parameters (required):**
- `startDate`: Start date (YYYY-MM-DD)
- `endDate`: End date (YYYY-MM-DD)
- `includeBookings`: Include booking details (true/false, default: false)

**Example:** `GET /api/calendar?startDate=2024-12-01&endDate=2024-12-31&includeBookings=true`

**Response (200):**
```json
{
  "success": true,
  "startDate": "2024-12-01",
  "endDate": "2024-12-31",
  "calendar": [
    {
      "date": "2024-12-01",
      "isAvailable": true,
      "blockedReason": null,
      "booking": null
    },
    {
      "date": "2024-12-15",
      "isAvailable": false,
      "blockedReason": "Booked Event",
      "booking": {
        "id": "clp123456789",
        "clientName": "John Doe",
        "eventType": "Wedding Reception"
      }
    }
  ],
  "bookings": [],
  "totalDays": 31,
  "availableDays": 26,
  "bookedDays": 5
}
```

---

#### PUT /api/calendar/availability
Update calendar availability (admin only).

**Single Update Request:**
```json
{
  "date": "2024-12-25",
  "available": false,
  "blockedReason": "Holiday - Office Closed"
}
```

**Bulk Update Request:**
```json
{
  "updates": [
    {
      "date": "2024-12-25",
      "available": false,
      "blockedReason": "Christmas Day"
    },
    {
      "date": "2024-12-26",
      "available": false,
      "blockedReason": "Boxing Day"
    }
  ]
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Calendar availability updated successfully",
  "date": "2024-12-25",
  "available": false,
  "blockedReason": "Holiday - Office Closed"
}
```

---

### 📧 Contact Management API

#### POST /api/contact
Submit contact form (public endpoint).

**Request Body:**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "555-987-6543",
  "subject": "Wedding DJ Services Inquiry",
  "message": "I'm interested in DJ services for my wedding on June 15th, 2025. Could you please provide more information about your packages?"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Contact form submitted successfully",
  "submissionId": 123
}
```

---

#### GET /api/contact
List contact submissions (admin only).

**Query Parameters:**
- `isRead`: Filter by read status (true/false)
- `limit`: Number of results (default: 50)
- `offset`: Pagination offset (default: 0)

**Response (200):**
```json
{
  "success": true,
  "contacts": [
    {
      "id": 123,
      "name": "Jane Smith",
      "email": "jane@example.com",
      "phone": "555-987-6543",
      "subject": "Wedding DJ Services Inquiry",
      "message": "I'm interested in DJ services...",
      "source": "website",
      "isRead": false,
      "createdAt": "2024-08-27T10:30:00Z"
    }
  ],
  "pagination": {
    "total": 1,
    "limit": 50,
    "offset": 0,
    "hasMore": false
  },
  "summary": {
    "total": 15,
    "unread": 3,
    "read": 12
  }
}
```

---

#### GET /api/contact/[id]
Get specific contact submission (admin only).

**Response (200):**
```json
{
  "success": true,
  "contact": {
    "id": 123,
    "name": "Jane Smith",
    "email": "jane@example.com",
    "phone": "555-987-6543",
    "subject": "Wedding DJ Services Inquiry",
    "message": "I'm interested in DJ services for my wedding on June 15th, 2025. Could you please provide more information about your packages?",
    "source": "website",
    "isRead": false,
    "createdAt": "2024-08-27T10:30:00Z"
  }
}
```

---

#### PUT /api/contact/[id]
Update contact submission (admin only).

**Request Body:**
```json
{
  "isRead": true
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Contact submission updated successfully",
  "contact": {
    "id": 123,
    "isRead": true
  }
}
```

---

### 👨‍💼 Admin Dashboard API

#### GET /api/admin/dashboard
Get dashboard statistics and data (admin only).

**Response (200):**
```json
{
  "success": true,
  "dashboard": {
    "stats": {
      "totalBookings": 25,
      "pendingBookings": 5,
      "confirmedBookings": 15,
      "thisMonthBookings": 8,
      "upcomingEvents": 12,
      "unreadContacts": 3
    },
    "revenue": {
      "totalRevenue": 45000,
      "totalDeposits": 12000,
      "confirmedBookings": 15,
      "averageBookingValue": 3000
    },
    "trends": {
      "monthlyBookings": {
        "2024-08": 8,
        "2024-07": 6,
        "2024-06": 10
      }
    },
    "recentBookings": [
      {
        "id": "clp123456",
        "bookingReference": "DSE-123456-ABC",
        "clientName": "John Doe",
        "eventDate": "2024-12-25T00:00:00Z",
        "eventType": "Wedding",
        "status": "CONFIRMED"
      }
    ],
    "upcomingEvents": [],
    "recentContacts": [
      {
        "id": 123,
        "name": "Jane Smith",
        "email": "jane@example.com",
        "subject": "Wedding Inquiry",
        "createdAt": "2024-08-27T10:30:00Z",
        "isRead": false
      }
    ],
    "recentActivity": [
      {
        "type": "booking",
        "id": "clp123456",
        "title": "New booking: John Doe",
        "subtitle": "Wedding on Mon Dec 25 2024",
        "timestamp": "2024-08-27T10:30:00Z"
      },
      {
        "type": "contact",
        "id": 123,
        "title": "Contact from Jane Smith",
        "subtitle": "Wedding Inquiry",
        "timestamp": "2024-08-27T10:25:00Z",
        "isRead": false
      }
    ]
  }
}
```

---

#### GET /api/admin/analytics
Get detailed analytics and reports (admin only).

**Query Parameters:**
- `period`: Time period (7d, 30d, 90d, 1y, default: 30d)
- `metrics`: Comma-separated metrics to include (optional)

**Example:** `GET /api/admin/analytics?period=30d`

**Response (200):**
```json
{
  "success": true,
  "period": "30d",
  "dateRange": {
    "startDate": "2024-07-27",
    "endDate": "2024-08-27"
  },
  "analytics": {
    "bookings": {
      "byStatus": {
        "CONFIRMED": {
          "count": 10,
          "revenue": 25000
        },
        "PENDING": {
          "count": 3,
          "revenue": 7500
        }
      },
      "byEventType": [
        {
          "eventType": "Wedding",
          "count": 8,
          "totalRevenue": 20000,
          "averageRevenue": 2500
        },
        {
          "eventType": "Corporate Event",
          "count": 5,
          "totalRevenue": 12500,
          "averageRevenue": 2500
        }
      ],
      "dailyTrends": [
        {
          "date": "2024-08-01",
          "count": 2
        },
        {
          "date": "2024-08-02",
          "count": 1
        }
      ]
    },
    "services": {
      "popularity": [
        {
          "service": "DJ Services",
          "count": 15
        },
        {
          "service": "Photography",
          "count": 10
        },
        {
          "service": "Karaoke Entertainment",
          "count": 8
        }
      ]
    },
    "revenue": {
      "total": 32500,
      "deposits": 8000,
      "average": 2500,
      "bookingsCount": 13
    },
    "contacts": {
      "bySourse": [
        {
          "source": "website",
          "count": 15
        }
      ]
    },
    "conversion": {
      "contacts": 20,
      "bookings": 13,
      "confirmed": 10,
      "contactToBooking": 65.0,
      "bookingToConfirmed": 76.9
    }
  }
}
```

---

## Error Responses

All endpoints follow a consistent error response format:

### Validation Error (400)
```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    {
      "code": "invalid_type",
      "expected": "string",
      "received": "undefined",
      "path": ["clientName"],
      "message": "Client name is required"
    }
  ]
}
```

### Authentication Error (401)
```json
{
  "success": false,
  "error": "Authentication required"
}
```

### Not Found Error (404)
```json
{
  "success": false,
  "error": "Booking not found"
}
```

### Rate Limit Error (429)
```json
{
  "success": false,
  "error": "Too many login attempts. Please try again later.",
  "resetIn": 890
}
```

### Server Error (500)
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## Testing the APIs

### Using cURL

**Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@dappersquad.com","password":"admin123!"}' \
  -c cookies.txt
```

**Create Booking:**
```bash
curl -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "clientName": "Test User",
    "clientEmail": "test@example.com",
    "clientPhone": "555-TEST-123",
    "eventDate": "2025-06-15",
    "eventType": "Wedding",
    "services": ["DJ Services"]
  }'
```

**Get Dashboard (authenticated):**
```bash
curl -X GET http://localhost:3000/api/admin/dashboard \
  -b cookies.txt
```

### Using JavaScript/Fetch

**Create Booking:**
```javascript
const response = await fetch('/api/bookings', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    clientName: 'John Doe',
    clientEmail: 'john@example.com',
    clientPhone: '555-123-4567',
    eventDate: '2024-12-25',
    eventType: 'Wedding Reception',
    services: ['DJ Services', 'Photography'],
    venueName: 'Grand Ballroom',
    guestCount: 150,
    totalAmount: 2500,
  }),
});

const data = await response.json();
console.log(data);
```

**Check Authentication:**
```javascript
const response = await fetch('/api/auth/verify', {
  credentials: 'include', // Include cookies
});
const data = await response.json();

if (data.success) {
  console.log('User is authenticated:', data.user);
} else {
  console.log('User is not authenticated');
}
```

---

## Database Schema Reference

### Booking Statuses
- `PENDING`: Initial status when booking is created
- `CONFIRMED`: Admin has confirmed the booking
- `IN_PROGRESS`: Event is currently happening
- `COMPLETED`: Event has finished successfully
- `CANCELLED`: Booking has been cancelled

### Payment Statuses
- `UNPAID`: No payment received
- `DEPOSIT_PAID`: Deposit has been paid
- `PAID`: Full payment received
- `REFUNDED`: Full refund issued
- `PARTIALLY_REFUNDED`: Partial refund issued

### Email Notification Statuses
- `PENDING`: Email queued but not sent
- `SENT`: Email sent successfully
- `FAILED`: Email sending failed
- `DELIVERED`: Email delivered to recipient
- `OPENED`: Email was opened by recipient
- `CLICKED`: Links in email were clicked

---

## Rate Limiting

- **Login API**: 5 attempts per IP per 15 minutes
- **Other APIs**: No rate limiting currently implemented (consider adding for production)

---

## Security Features

1. **JWT Authentication**: Secure tokens with expiration
2. **HTTP-Only Cookies**: Prevent XSS attacks
3. **Input Validation**: Zod schema validation on all inputs
4. **SQL Injection Prevention**: Prisma ORM prevents SQL injection
5. **Rate Limiting**: Prevents brute force attacks on login
6. **Error Handling**: Consistent error responses without exposing internals

---

## Future Enhancements

1. **Email Notifications**: Automatic email sending for bookings/contacts
2. **File Uploads**: Support for event-related file attachments
3. **Payment Integration**: Stripe payment processing
4. **Webhooks**: External system integrations
5. **API Versioning**: Support for API versioning
6. **OpenAPI/Swagger**: Auto-generated API documentation

---

This API provides a complete backend solution for the Dapper Squad Entertainment booking system with robust error handling, authentication, and comprehensive data management capabilities.