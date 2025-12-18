# 🚀 Quick Deployment Steps

## Before You Start
✅ MongoDB Atlas configured  
✅ Google Maps API key working  
✅ Code tested locally  

---

## 🎯 Step-by-Step Deployment

### 1️⃣ Push to GitHub (5 minutes)

```bash
cd "e:\Projects\Accident and Traffic"

# Initialize git (if not done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Accident & Traffic Intelligence"

# Create repository on GitHub: https://github.com/new
# Name: accident-traffic-intelligence
# Keep it PRIVATE

# Connect and push (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/accident-traffic-intelligence.git
git branch -M main
git push -u origin main
```

---

### 2️⃣ Deploy Backend on Render (10 minutes)

1. **Go to**: https://render.com
2. **Sign up** with GitHub
3. **New +** → **Web Service**
4. **Connect** your repository
5. **Configure**:
   - Name: `accident-traffic-backend`
   - Region: **Singapore** (closest to India)
   - Root Directory: `backend`
   - Build: `npm install`
   - Start: `npm start`
   - Instance: **Free**

6. **Environment Variables** (copy-paste all):
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

7. **Deploy** → Wait 5-10 minutes
8. **Copy URL**: `https://accident-traffic-backend-XXXX.onrender.com`

---

### 3️⃣ Deploy Frontend on Vercel (5 minutes)

1. **Go to**: https://vercel.com
2. **Sign up** with GitHub
3. **Add New** → **Project**
4. **Import** your repository
5. **Configure**:
   - Framework: **Vite** (auto-detected)
   - Root Directory: `frontend`
   - Build: `npm run build` (auto)
   - Output: `dist` (auto)

6. **Environment Variables** (⚠️ USE YOUR RENDER URL):
```
VITE_API_BASE_URL=https://your-backend-url.onrender.com
VITE_SOCKET_URL=https://your-backend-url.onrender.com
VITE_API_VERSION=v1
VITE_GOOGLE_MAPS_API_KEY=AIzaSyAYT8DNeW4H4IJrlTnV2VTEAQrTUYTlEc0
```

7. **Deploy** → Wait 2-3 minutes
8. **Copy URL**: `https://your-app.vercel.app`

---

### 4️⃣ Update Backend CORS (2 minutes)

1. **Go back to Render** → Your backend service
2. **Environment** tab → Add:
```
CORS_ORIGIN=https://your-app.vercel.app
FRONTEND_URL=https://your-app.vercel.app
```
*Use your actual Vercel URL!*

3. **Manual Deploy** → Deploy latest commit
4. Wait 5 minutes

---

### 5️⃣ Secure Google Maps API (3 minutes)

1. **Go to**: https://console.cloud.google.com/apis/credentials
2. **Find key**: `AIzaSyAYT8DNeW4H4IJrlTnV2VTEAQrTUYTlEc0`
3. **Edit** → **Application restrictions**:
   - Type: **HTTP referrers**
   - Add:
     - `https://your-app.vercel.app/*`
     - `http://localhost:3000/*`
     - `http://localhost:5173/*`
4. **API restrictions** → Enable only:
   - Maps JavaScript API
   - Places API
   - Directions API
   - Geocoding API
5. **Save**

---

### 6️⃣ Test Everything ✅

Open: `https://your-app.vercel.app`

- [ ] Website loads
- [ ] Can register/login
- [ ] Map shows your location
- [ ] Can create incident with photo
- [ ] Admin can verify incidents
- [ ] Notifications work
- [ ] No console errors

---

## 🎉 Done!

**Your Live URLs:**
- Frontend: `https://your-app.vercel.app`
- Backend: `https://your-backend.onrender.com`

**Notes:**
- Free Render sleeps after 15 minutes (first request takes 30 seconds to wake)
- Upgrade to Render paid ($7/month) for always-on service
- Vercel auto-deploys on every GitHub push

---

## 🆘 Troubleshooting

**CORS errors?**  
→ Check CORS_ORIGIN in Render matches Vercel URL exactly

**"Failed to fetch"?**  
→ Check VITE_API_BASE_URL in Vercel points to Render URL

**Map not loading?**  
→ Verify Google Maps API key restrictions allow your Vercel domain

**View backend logs:**  
Render Dashboard → Your service → Logs tab

**View frontend logs:**  
Browser Console (F12)

---

For detailed guide, see: [DEPLOYMENT.md](./DEPLOYMENT.md)
