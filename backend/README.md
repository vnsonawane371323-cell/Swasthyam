# SwasthTel Backend API

A Node.js + Express backend API for the SwasthTel health tracking application.

## Features

- 🔐 JWT-based authentication
- 👤 User registration and login
- 📋 Complete user onboarding data storage
- 🔒 Password hashing with bcrypt
- ✅ Input validation
- 🛡️ Security headers with Helmet
- 🌐 CORS support

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt
- **Validation**: Custom validators

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- npm or yarn

## Installation

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   
   Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your configuration:
   ```env
   # MongoDB Connection String
   MONGODB_URI=mongodb://localhost:27017/swasthtel
   
   # JWT Secret Key - Use a long, random string in production
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   
   # JWT Expiration Time
   JWT_EXPIRES_IN=7d
   
   # Server Port
   PORT=5000
   
   # Node Environment
   NODE_ENV=development
   
   # Frontend URL for CORS
   FRONTEND_URL=http://localhost:8081,http://localhost:19006
   ```

4. **Start MongoDB**:
   
   If using local MongoDB:
   ```bash
   mongod
   ```
   
   Or use MongoDB Atlas (update MONGODB_URI in .env accordingly).

5. **Start the server**:
   
   Development mode (with auto-reload):
   ```bash
   npm run dev
   ```
   
   Production mode:
   ```bash
   npm start
   ```

## API Endpoints

### Health Check
- `GET /health` - Check if API is running

### Authentication
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/signup` | Register a new user | No |
| POST | `/api/auth/login` | Login user | No |
| GET | `/api/auth/me` | Get current user | Yes |
| PUT | `/api/auth/profile` | Update user profile | Yes |
| POST | `/api/auth/complete-onboarding` | Complete onboarding | Yes |
| PUT | `/api/auth/change-password` | Change password | Yes |
| DELETE | `/api/auth/account` | Delete account | Yes |

### Request/Response Examples

#### Signup
```bash
POST /api/auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123",
  "name": "John Doe"
}
```

Response:
```json
{
  "success": true,
  "message": "Account created successfully",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "_id": "...",
    "email": "user@example.com",
    "name": "John Doe",
    "isOnboardingComplete": false,
    ...
  }
}
```

#### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123"
}
```

#### Get Current User
```bash
GET /api/auth/me
Authorization: Bearer <token>
```

#### Complete Onboarding
```bash
POST /api/auth/complete-onboarding
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Doe",
  "age": 30,
  "gender": "male",
  "height": 175,
  "weight": 70,
  "medicalHistory": [
    { "condition": "diabetes", "severity": "mild" }
  ],
  "mealsPerDay": "3 meals",
  "frequencyToEatOutside": "weekly",
  "foodieLevel": "balanced",
  "dietaryPreference": "vegetarian",
  "preferredCookingStyle": "Indian"
}
```

## User Schema

```javascript
{
  email: String (required, unique),
  password: String (required, hashed),
  name: String,
  age: Number,
  gender: String (male/female/other/prefer-not-to-say),
  height: Number (cm),
  weight: Number (kg),
  bmi: Number (calculated),
  medicalHistory: [{
    condition: String,
    severity: String (mild/moderate/severe)
  }],
  mealsPerDay: String,
  frequencyToEatOutside: String,
  foodieLevel: String,
  dietaryPreference: String,
  preferredCookingStyle: String,
  currentOils: [String],
  monthlyOilConsumption: Number,
  oilBudget: String,
  language: String (en/hi),
  isOnboardingComplete: Boolean,
  onboardingStep: Number,
  dailyOilLimit: Number,
  healthRiskLevel: Number,
  avatar: String,
  phoneNumber: String,
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## Password Requirements

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

## Error Responses

All error responses follow this format:
```json
{
  "success": false,
  "message": "Error description",
  "errors": {
    "field": "Specific field error"
  }
}
```

## Project Structure

```
backend/
├── config/
│   └── database.js       # MongoDB connection
├── controllers/
│   └── authController.js # Auth business logic
├── middleware/
│   ├── auth.js          # JWT verification
│   └── error.js         # Error handling
├── models/
│   └── User.js          # User schema
├── routes/
│   └── auth.js          # Auth routes
├── utils/
│   ├── jwt.js           # JWT utilities
│   └── validators.js    # Input validation
├── .env                 # Environment variables
├── .env.example         # Example env file
├── package.json
├── server.js            # Entry point
└── README.md
```

## Development

### Running in Development
```bash
npm run dev
```

This uses `nodemon` for auto-reloading on file changes.

### Testing API
Use tools like:
- Postman
- Insomnia
- curl

### Example curl commands:
```bash
# Health check
curl http://localhost:5000/health

# Signup
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Password123","name":"Test User"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Password123"}'
```

## Security Considerations

1. Always use HTTPS in production
2. Keep JWT_SECRET secure and complex
3. Set appropriate CORS origins
4. Use strong passwords
5. Consider rate limiting for production
6. Regularly update dependencies

## Troubleshooting

### Common Issues

1. **MongoDB connection failed**
   - Ensure MongoDB is running
   - Check MONGODB_URI in .env
   - For Atlas, check IP whitelist

2. **CORS errors**
   - Add your frontend URL to FRONTEND_URL in .env
   - For Expo, add `exp://your-ip:port`

3. **JWT errors**
   - Ensure JWT_SECRET is set
   - Check token expiration

## License

MIT
