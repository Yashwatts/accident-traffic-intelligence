# 🚗 Accident & Traffic Intelligence Platform

A real-time platform for reporting, tracking, and analyzing traffic accidents and road conditions in India. Built to save lives, improve road safety, and help citizens avoid dangerous routes.

![Status](https://img.shields.io/badge/status-live-brightgreen)

## 🌐 Live Application

**🔗 [View Live Demo](https://accident-traffic-intelligence-front.vercel.app)**

## ✨ Features

### 👥 For Citizens
- 📍 **Live Location-Based Reporting** - Report accidents and traffic incidents in real-time
- 📸 **Photo Upload** - Attach photos to incident reports for verification
- 🗺️ **Live Map View** - See all active incidents in your area with real-time updates
- 🔔 **Real-Time Notifications** - Get instant alerts when your reports are verified/resolved/rejected
- 🚦 **Route Advisor** - Plan safe routes avoiding accident-prone areas with Google Maps integration
- 📊 **Personal Dashboard** - Track your reported incidents and their status

### 🛡️ For Admins
- ✅ **Incident Verification** - Review and verify citizen reports
- 📈 **Analytics Dashboard** - View response times, incident trends, and weekly charts
- 🎯 **Quick Actions** - Resolve or reject incidents with status updates
- 📊 **Real-Time Monitoring** - Track all incidents across India with filtering options

## 🚀 Tech Stack

**Frontend:**
- React 18 + Vite
- Tailwind CSS (styling)
- Zustand (state management)
- Socket.io Client (real-time notifications)
- Google Maps API (maps, routing, places)
- Axios (API calls)
- React Router (navigation)
- Lucide Icons

**Backend:**
- Node.js + Express
- MongoDB Atlas (database)
- Socket.io Server (real-time events)
- JWT (authentication)
- Bcrypt (password hashing)
- Multer (file uploads)
- Express Rate Limit

**Infrastructure:**
- Frontend: Vercel (CDN, auto-deployment)
- Backend: Render (Node.js hosting with WebSocket support)
- Database: MongoDB Atlas (cloud database)

## 📁 Project Structure

```
accident-traffic/
├── frontend/              # React frontend application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/        # Page components (routes)
│   │   ├── lib/          # API client, socket, utils
│   │   ├── stores/       # Zustand state management
│   │   └── styles/       # Global CSS
│   ├── .env.local        # Development environment variables
│   └── .env.production   # Production environment template
│
├── backend/              # Node.js backend API
│   ├── src/
│   │   ├── services/     # Business logic (auth, incidents, users)
│   │   ├── middleware/   # Auth, error handling, validation
│   │   ├── utils/        # Helper functions
│   │   ├── routes/       # API route definitions
│   │   └── socket/       # Socket.io event handlers
│   ├── .env              # Development environment variables
│   └── .env.production   # Production environment template
│
└── docs/                 # Documentation files
```

## 🚦 Quick Start (Local Development)

### Prerequisites
- Node.js 18+ (with npm)
- MongoDB Atlas account (free tier works)
- Google Maps API key ([get one here](https://developers.google.com/maps/documentation/javascript/get-api-key))

### Installation

```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/accident-traffic-intelligence.git
cd accident-traffic-intelligence

# Backend setup
cd backend
npm install
cp .env.example .env  # Edit with your MongoDB URI and secrets
npm run dev  # Starts on http://localhost:5000

# Frontend setup (new terminal)
cd frontend
npm install
cp .env.example .env.local  # Edit with your Google Maps API key
npm run dev  # Starts on http://localhost:5173
```

### Environment Variables

**Backend (.env):**
```env
NODE_ENV=development
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_random_secret_key
JWT_REFRESH_SECRET=another_random_secret
CORS_ORIGIN=http://localhost:3000
```

**Frontend (.env.local):**
```env
VITE_API_BASE_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

Visit **http://localhost:5173** to see the app!

## 🌍 Deployment

The application is deployed on:
- **Frontend**: Vercel - [Live Site](https://accident-traffic-intelligence-front.vercel.app)
- **Backend**: Render (Node.js + Express + Socket.io)
- **Database**: MongoDB Atlas (Cloud)

## 🔑 Key Features Explained

### Real-Time Notifications
Uses Socket.io for instant notifications when:
- Admin verifies your incident ✅
- Incident gets resolved 🎉
- Incident gets rejected ❌
- New incidents appear near you 📍

### Route Advisor
Integrates Google Maps Directions API to:
- Calculate routes avoiding accident areas
- Show distance and estimated time
- Display incidents along the route
- Provide turn-by-turn navigation

### Analytics Dashboard (Admin)
- Average response time (time to resolve incidents)
- Today's stats (new, verified, resolved incidents)
- Weekly incident trends (line chart)
- Incident filtering by status and severity

### Photo Upload
- Citizens can attach photos when reporting incidents
- Converts images to base64 for storage
- Admin can view photos during verification
- Helps verify authenticity of reports

## 🌏 India-Specific Features

- Maps restricted to India geographical bounds
- Distance calculations in kilometers
- Indian testimonials and localization
- Google Places autocomplete restricted to India

## 🔒 Security Features

- JWT-based authentication with refresh tokens
- Bcrypt password hashing
- Rate limiting on API endpoints
- CORS protection
- Input validation and sanitization
- Secure file upload handling
- Protected admin routes

## 📈 Future Enhancements

- [ ] SMS/Email notifications for incident updates
- [ ] Machine learning for accident hotspot prediction
- [ ] Weather integration for weather-related incidents
- [ ] Multi-language support (Hindi, Tamil, Telugu, etc.)
- [ ] Mobile app (React Native)
- [ ] Voice-to-text incident reporting
- [ ] Integration with government traffic systems
- [ ] Anonymous reporting option

## 🙏 Acknowledgments

- Google Maps Platform for mapping services
- MongoDB Atlas for database hosting
- Vercel and Render for deployment platforms
- All contributors and users who help improve road safety

##  Deployment

- **Live Application**: [https://accident-traffic-intelligence-front.vercel.app](https://accident-traffic-intelligence-front.vercel.app)
- **Repository**: [GitHub](https://github.com/Yashwatts/accident-traffic-intelligence)

## ⭐ Show Your Support

If this project helped you or you find it interesting, please give it a ⭐ on GitHub!

---

<div align="center">

**Developer - Yash**

🚗 🚦 🛣️

[View Live Demo](https://accident-traffic-intelligence-front.vercel.app) · [GitHub Repo](https://github.com/Yashwatts/accident-traffic-intelligence)

</div>
