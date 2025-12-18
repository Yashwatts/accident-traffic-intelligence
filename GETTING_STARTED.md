# Getting Started Guide

## ✅ Current Status

**Frontend**: ✅ Running successfully on http://localhost:3000/  
**Backend**: ⏳ Ready to start (waiting for MongoDB)

## Prerequisites Installation

### 1. Install MongoDB

The application requires MongoDB to store incidents, users, and other data.

#### Option A: MongoDB Community Edition (Local)

1. **Download MongoDB**:
   - Visit: https://www.mongodb.com/try/download/community
   - Select: Windows
   - Download the MSI installer

2. **Install MongoDB**:
   ```powershell
   # Run the installer and follow the setup wizard
   # Choose "Complete" installation
   # Install MongoDB as a Service (recommended)
   # Install MongoDB Compass (optional GUI)
   ```

3. **Verify Installation**:
   ```powershell
   # Check if MongoDB is running
   Get-Service mongodb

   # Or connect using mongo shell
   mongosh
   ```

4. **Start MongoDB** (if not running as service):
   ```powershell
   # Start MongoDB
   net start MongoDB

   # Or run mongod manually
   mongod --dbpath="C:\data\db"
   ```

#### Option B: MongoDB Atlas (Cloud - Free Tier)

1. **Create Account**: https://www.mongodb.com/cloud/atlas/register
2. **Create Free Cluster**: 
   - Choose AWS/Azure/Google Cloud
   - Select free tier (M0)
   - Choose region closest to you
3. **Get Connection String**:
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
4. **Update Backend .env**:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/traffic-intel?retryWrites=true&w=majority
   ```

### 2. Redis (Optional - for production scaling)

Redis is currently disabled but can be enabled for:
- Distributed rate limiting across multiple servers
- Socket.io horizontal scaling
- Response caching

To enable Redis:
1. **Install Redis** (Windows): https://github.com/microsoftarchive/redis/releases
2. **Update Backend .env**:
   ```env
   REDIS_HOST=localhost
   REDIS_PORT=6379
   ```
3. **Enable Redis in code**:
   - Uncomment Redis setup in `backend/src/middleware/rateLimiter.js`
   - Uncomment Redis adapter in `backend/src/websocket/index.js`

## Quick Start

### 1. Start MongoDB

```powershell
# If installed as service (recommended)
Get-Service mongodb  # Verify it's running

# If not running
net start MongoDB

# Or run manually
mongod --dbpath="C:\data\db"
```

### 2. Start Backend Server

```powershell
cd "e:\Projects\Accident and Traffic\backend"
npm run dev
```

**Expected Output**:
```
[nodemon] starting `node src/index.js`
✅ MongoDB connected: localhost:27017/traffic-intel
✅ Socket.io server initialized
🚀 Server running on port 5000
```

### 3. Start Frontend Server

The frontend is already running! Visit: http://localhost:3000/

If you need to restart it:
```powershell
cd "e:\Projects\Accident and Traffic\frontend"
npm run dev
```

### 4. Test the Application

1. **Frontend**: http://localhost:3000/
2. **Backend Health Check**: http://localhost:5000/health
3. **API Base**: http://localhost:5000/api/v1/

## Environment Configuration

### Backend (.env file)

The `.env` file has been created at: `backend/.env`

**Current Configuration**:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/traffic-intel

# JWT Secrets (CHANGE IN PRODUCTION!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-token-key-change-this-in-production-min-32-chars
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:5173

# Optional: Redis (currently disabled)
# REDIS_HOST=localhost
# REDIS_PORT=6379
```

**⚠️ Important**: Change JWT secrets before deploying to production!

Generate secure secrets:
```powershell
# PowerShell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})
```

## Development Workflow

### Running Both Servers

You can run both frontend and backend simultaneously:

```powershell
# From project root
npm run dev
```

This uses `concurrently` to start both servers at once.

### Individual Servers

```powershell
# Backend only
cd backend
npm run dev

# Frontend only
cd frontend
npm run dev
```

### Restart Servers

```powershell
# Stop all Node processes
Stop-Process -Name node -Force

# Then restart as needed
```

## Troubleshooting

### "Cannot connect to MongoDB"

**Error**: `MongooseServerSelectionError: connect ECONNREFUSED 127.0.0.1:27017`

**Solutions**:
1. Check if MongoDB is running:
   ```powershell
   Get-Service mongodb
   ```
2. Start MongoDB:
   ```powershell
   net start MongoDB
   ```
3. Verify MongoDB is listening on port 27017:
   ```powershell
   netstat -an | findstr "27017"
   ```
4. Check MongoDB logs:
   ```
   C:\Program Files\MongoDB\Server\7.0\log\mongod.log
   ```

### "Port 5000 already in use"

```powershell
# Find process using port 5000
netstat -ano | findstr ":5000"

# Kill the process (replace PID with actual process ID)
Stop-Process -Id <PID> -Force
```

### "Frontend shows blank page"

1. Check browser console (F12) for errors
2. Verify backend is running on port 5000
3. Clear browser cache and reload
4. Check if API proxy is configured correctly in `vite.config.js`

### "Module not found" errors

```powershell
# Reinstall dependencies
cd backend
Remove-Item -Recurse -Force node_modules
npm install

cd ../frontend
Remove-Item -Recurse -Force node_modules
npm install
```

## Next Steps

### 1. Create Test Users

```javascript
// Use MongoDB Compass or mongosh
use traffic-intel

db.users.insertOne({
  name: "Admin User",
  email: "admin@example.com",
  password: "$2a$10$hashedpassword", // Use bcrypt to hash
  role: "admin",
  isEmailVerified: true,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

### 2. Test API Endpoints

```powershell
# Health check
curl http://localhost:5000/health

# API status
curl http://localhost:5000/api/v1/
```

### 3. Implement Remaining Features

Priority features to implement:
- [ ] Authentication endpoints (register, login)
- [ ] Incident CRUD operations
- [ ] Email verification
- [ ] Password reset
- [ ] Photo upload with Multer
- [ ] Geospatial incident queries

See `SECURITY.md` for security implementation details.

## Scripts Reference

### Backend

```powershell
npm run dev          # Start with nodemon (auto-reload)
npm start            # Production start
npm run lint         # Check code style
npm run lint:fix     # Fix code style issues
npm test             # Run tests
```

### Frontend

```powershell
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Check code style
```

### Root

```powershell
npm run dev          # Start both backend and frontend
```

## File Structure

```
Accident and Traffic/
├── backend/
│   ├── src/
│   │   ├── config/           # Configuration (env, database)
│   │   ├── middleware/       # Express middleware (security, validation, auth)
│   │   ├── services/         # Business logic (user, incident)
│   │   ├── websocket/        # Socket.io handlers
│   │   └── utils/            # Utilities (logger, errors)
│   ├── .env                  # Environment variables
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── pages/            # Page components
│   │   ├── lib/              # API client, socket, utilities
│   │   ├── store/            # Zustand stores
│   │   └── styles/           # CSS files
│   └── package.json
├── package.json              # Root workspace config
├── GETTING_STARTED.md        # This file
├── SECURITY.md               # Security documentation
└── README.md                 # Project overview
```

## Support & Resources

- **MongoDB Docs**: https://docs.mongodb.com/
- **Express.js**: https://expressjs.com/
- **React**: https://react.dev/
- **Socket.io**: https://socket.io/docs/
- **Vite**: https://vite.dev/

## Production Deployment

Before deploying to production:

1. **Update Environment Variables**:
   - Generate strong JWT secrets
   - Use production MongoDB URI
   - Configure Redis for scaling
   - Set `NODE_ENV=production`

2. **Build Frontend**:
   ```powershell
   cd frontend
   npm run build
   ```

3. **Security Checklist**:
   - Enable HTTPS/TLS
   - Configure rate limiting
   - Set up MongoDB authentication
   - Enable Redis for distributed rate limiting
   - Configure CORS for production domain
   - Review `SECURITY.md`

4. **Deploy**:
   - Backend: Heroku, AWS, DigitalOcean, etc.
   - Frontend: Vercel, Netlify, AWS S3 + CloudFront
   - Database: MongoDB Atlas (recommended)

---

**Happy Coding! 🚀**
