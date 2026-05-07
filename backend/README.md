# Chat Application Backend

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (running locally or remote connection)

## Setup Instructions

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure Environment Variables:**
   - Copy `.env.example` to `.env`
   - Update the values:
     - `DB_URI`: Your MongoDB connection string (default: `mongodb://localhost:27017/chatdb`)
     - `DB_PORT`: Port for the backend server (default: `5000`)
     - `TOKEN_SECRET`: Secret key for JWT token signing (generate a random string)
     - `JWT_SECRET`: Another JWT secret key (generate a random string)

3. **Make sure MongoDB is running:**
   - If using local MongoDB:
     ```bash
     mongod
     ```
   - Or use MongoDB Atlas for cloud database

4. **Start the server:**
   ```bash
   npm start
   ```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DB_URI` | MongoDB connection string | `mongodb://localhost:27017/chatdb` |
| `DB_PORT` | Server port | `5000` |
| `TOKEN_SECRET` | JWT secret for authentication | `your-random-secret-key-123` |
| `JWT_SECRET` | JWT secret for token generation | `your-random-jwt-key-456` |

## Troubleshooting

- **MongoDB connection error**: Make sure MongoDB is running and `DB_URI` is correct
- **Port already in use**: Change `DB_PORT` to a different port number
- **JWT errors**: Ensure `TOKEN_SECRET` and `JWT_SECRET` are set in `.env`
