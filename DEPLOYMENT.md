# 🚀 Deployment Guide: Accident & Traffic Intelligence

## Overview
- **Frontend**: Vercel (React + Vite)
- **Backend**: Render (Node.js + Express + Socket.io)
- **Database**: MongoDB Atlas (already configured)

---

## 🔐 Security: Update JWT Secrets

Before deploying, update your production environment with these generated secrets:

```
JWT_SECRET=dabae60ed3238253fa137d7ba3b0a564ecea203f97d7bbd27bc289a515bbd5c181f7eae47077124801084cce67dcc4a76992e388062b46eb9baf2af2a0a819c6

JWT_REFRESH_SECRET=48be1f46faab55d46de4c928e7729ac97e85865572d039d2f36800e42b7163008f4f544f0d567463f9b06a3589f00f9d80f47dde701254f9ea6b10bd90a00742
```

---

## 📦 Step 1: Push to GitHub

### 1.1 Initialize Git Repository (if not done)
```bash
cd "e:\Projects\Accident and Traffic"
git init
```

### 1.2 Create GitHub Repository
1. Go to https://github.com/new
2. Repository name: `accident-traffic-intelligence`
3. Keep it **Private** (contains API keys in .env files)
4. Don't initialize with README

### 1.3 Push Code
```bash
# Add all files
git add .

# Commit
git commit -m "Initial commit: Accident & Traffic Intelligence System"

# Connect to GitHub (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/accident-traffic-intelligence.git

# Push to GitHub
git branch -M main
git push -u origin main
```

---

## 🖥️ Step 2: Deploy Backend to Render

### 2.1 Create Render Account
1. Go to https://render.com
2. Sign up with GitHub (easier integration)

### 2.2 Deploy Backend
1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Configure:
   - **Name**: `accident-traffic-backend` (or any name)
   - **Region**: Select closest to India (Singapore recommended)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free (or paid for better performance)

### 2.3 Add Environment Variables
In Render dashboard, go to **Environment** tab and add:

```
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://yash:YashYash@cluster0.9tpexgk.mongodb.net/traffic-intel?appName=Cluster0
JWT_SECRET=dabae60ed3238253fa137d7ba3b0a564ecea203f97d7bbd27bc289a515bbd5c181f7eae47077124801084cce67dcc4a76992e388062b46eb9baf2af2a0a819c6
JWT_REFRESH_SECRET=48be1f46faab55d46de4c928e7729ac97e85865572d039d2f36800e42b7163008f4f544f0d567463f9b06a3589f00f9d80f47dde701254f9ea6b10bd90a00742
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
MAX_FILE_SIZE=5242880
UPLOAD_DIR=uploads
API_VERSION=v1
```

**⚠️ IMPORTANT**: Don't add CORS_ORIGIN and FRONTEND_URL yet. We'll add them after deploying frontend.

### 2.4 Deploy
1. Click **"Create Web Service"**
2. Wait 5-10 minutes for deployment
3. Copy your backend URL: `https://accident-traffic-backend.onrender.com`

---

## 🌐 Step 3: Deploy Frontend to Vercel

### 3.1 Create Vercel Account
1. Go to https://vercel.com
2. Sign up with GitHub

### 3.2 Deploy Frontend
1. Click **"Add New"** → **"Project"**
2. Import your GitHub repository
3. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `dist` (auto-detected)

### 3.3 Add Environment Variables
In Vercel project settings → **Environment Variables**, add:

```
VITE_API_BASE_URL=https://accident-traffic-backend.onrender.com
VITE_SOCKET_URL=https://accident-traffic-backend.onrender.com
VITE_API_VERSION=v1
VITE_GOOGLE_MAPS_API_KEY=AIzaSyAYT8DNeW4H4IJrlTnV2VTEAQrTUYTlEc0
```

**Replace `accident-traffic-backend.onrender.com` with your actual Render backend URL!**

### 3.4 Deploy
1. Click **"Deploy"**
2. Wait 2-5 minutes
3. Copy your frontend URL: `https://your-app.vercel.app`

---

## 🔄 Step 4: Update Backend CORS

### 4.1 Update Backend Environment Variables
Go back to **Render dashboard** → Your backend service → **Environment** tab

Add these two variables:
```
CORS_ORIGIN=https://your-app.vercel.app
FRONTEND_URL=https://your-app.vercel.app
```

**Replace with your actual Vercel URL!**

### 4.2 Redeploy Backend
1. Go to **Manual Deploy** → **Deploy latest commit**
2. Wait for redeployment

---

## 🔒 Step 5: Secure Google Maps API Key

### 5.1 Restrict API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Find your API key: `AIzaSyAYT8DNeW4H4IJrlTnV2VTEAQrTUYTlEc0`
3. Click **Edit**
4. Under **Application restrictions**:
   - Select **"HTTP referrers (websites)"**
   - Add:
     - `https://your-app.vercel.app/*`
     - `http://localhost:3000/*` (for local development)
     - `http://localhost:5173/*` (for Vite dev server)
5. Under **API restrictions**:
   - Select **"Restrict key"**
   - Enable only:
     - Maps JavaScript API
     - Places API
     - Directions API
     - Geocoding API
6. Click **Save**

---

## ✅ Step 6: Test Deployment

### 6.1 Test Checklist
- [ ] Frontend loads at Vercel URL
- [ ] Can register new account
- [ ] Can login successfully
- [ ] Map shows your location (India)
- [ ] Can create new incident with photo
- [ ] Admin can verify incidents
- [ ] Citizens receive notifications
- [ ] Route advisor works
- [ ] No console errors

### 6.2 Common Issues

**Problem**: CORS errors in browser console
**Solution**: Make sure CORS_ORIGIN in Render matches your exact Vercel URL

**Problem**: "Failed to fetch" errors
**Solution**: Check VITE_API_BASE_URL in Vercel points to correct Render URL

**Problem**: Socket.io not connecting
**Solution**: Render supports WebSockets by default, check VITE_SOCKET_URL matches backend

**Problem**: 401 Unauthorized errors
**Solution**: Clear browser cookies and localStorage, try fresh login

---

## 📊 Monitoring

### Render (Backend)
- View logs: Dashboard → Your service → **Logs** tab
- Check metrics: CPU, memory usage
- Free tier sleeps after 15 minutes of inactivity (first request takes ~30 seconds)

### Vercel (Frontend)
- View deployments: Dashboard → Your project → **Deployments**
- Check analytics: Traffic, performance
- View function logs if using serverless functions

---

## 🔄 Making Updates

### Update Frontend
```bash
cd frontend
# Make your changes
git add .
git commit -m "Update: description"
git push origin main
# Vercel auto-deploys in 1-2 minutes
```

### Update Backend
```bash
cd backend
# Make your changes
git add .
git commit -m "Update: description"
git push origin main
# Render auto-deploys in 5-10 minutes
```

---

## 💰 Cost Breakdown

### Free Tier (Current Setup)
- **MongoDB Atlas**: 512MB free forever
- **Vercel**: 100GB bandwidth/month, unlimited deployments
- **Render**: 750 hours/month free (backend sleeps after 15min inactivity)
- **Google Maps**: $200 free credit/month

### Paid Upgrade (Recommended for Production)
- **Render**: $7/month (always-on, no sleep)
- **MongoDB Atlas**: $9/month (2GB storage, better performance)
- **Total**: ~$16/month for production-grade deployment

---

## 🆘 Support

If you encounter issues:
1. Check Render logs for backend errors
2. Check browser console for frontend errors
3. Verify environment variables match exactly
4. Test API endpoints directly: `https://your-backend.onrender.com/api/v1/health`

---

## 🎉 Success!

Your Accident & Traffic Intelligence system is now live! 

- **Frontend**: https://your-app.vercel.app
- **Backend**: https://your-backend.onrender.com
- **Database**: MongoDB Atlas (cloud)

Share the Vercel URL with users to start reporting incidents! 🚗🚦
