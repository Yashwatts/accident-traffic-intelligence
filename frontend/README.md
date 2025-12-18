# React Frontend - Incident Reporter

Production-ready React application built with Vite, Tailwind CSS, and modern state management.

## 🚀 Tech Stack

- **Build Tool**: Vite 7.2.4
- **Framework**: React 18.2.0
- **Styling**: Tailwind CSS 3.4.0
- **Routing**: React Router DOM 6.21.1
- **State Management**: Zustand 4.4.7
- **API Client**: Axios 1.6.5
- **Data Fetching**: TanStack React Query 5.17.0
- **WebSocket**: Socket.io Client 4.6.1
- **Icons**: Lucide React 0.303.0
- **Utilities**: clsx, tailwind-merge

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── layouts/
│   │   │   ├── MainLayout.jsx       # Main app layout with header/sidebar
│   │   │   └── AuthLayout.jsx       # Authentication layout
│   │   └── common/
│   │       ├── Header.jsx           # App header with navigation
│   │       └── Sidebar.jsx          # Sidebar navigation
│   ├── pages/
│   │   ├── HomePage.jsx             # Landing page
│   │   ├── LoginPage.jsx            # User login
│   │   ├── RegisterPage.jsx         # User registration
│   │   ├── DashboardPage.jsx        # Main dashboard
│   │   ├── IncidentsPage.jsx        # Incident list
│   │   ├── IncidentDetailPage.jsx   # Incident details
│   │   ├── CreateIncidentPage.jsx   # Report new incident
│   │   ├── ProfilePage.jsx          # User profile
│   │   └── NotFoundPage.jsx         # 404 page
│   ├── store/
│   │   ├── authStore.js             # Authentication state (Zustand)
│   │   ├── incidentStore.js         # Incident management state
│   │   └── uiStore.js               # UI state (sidebar, modals, toasts)
│   ├── lib/
│   │   ├── api.js                   # Axios API client with interceptors
│   │   ├── socket.js                # Socket.io client manager
│   │   └── utils.js                 # Utility functions
│   ├── App.jsx                      # Root component with routing
│   ├── main.jsx                     # Entry point
│   └── index.css                    # Tailwind imports + custom styles
├── public/                          # Static assets
├── .env.example                     # Environment variables template
├── vite.config.js                   # Vite configuration
├── tailwind.config.js               # Tailwind configuration
├── postcss.config.js                # PostCSS configuration
└── package.json                     # Dependencies
```

## 🛠 Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Environment Configuration

Create `.env` file from `.env.example`:

```bash
cp .env.example .env
```

Configure environment variables:

```env
VITE_API_BASE_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
VITE_GOOGLE_MAPS_API_KEY=your_api_key
```

### 3. Run Development Server

```bash
npm run dev
```

Application runs on `http://localhost:3000`

### 4. Build for Production

```bash
npm run build
```

Output: `dist/` directory

### 5. Preview Production Build

```bash
npm run preview
```

## 🎨 Features

### Authentication
- JWT-based authentication with refresh tokens
- Protected routes with automatic redirect
- Persistent login state (localStorage)
- Auto token refresh on 401 errors

### Real-time Updates
- Socket.io integration for live incident updates
- Location-based event subscriptions
- Automatic reconnection handling
- Event listeners for incident CRUD operations

### State Management
- **Auth Store**: User authentication, profile management
- **Incident Store**: Incident CRUD, filtering, real-time updates
- **UI Store**: Sidebar, modals, toasts, theme, map state

### API Integration
- Axios instance with request/response interceptors
- Automatic token injection
- Error handling and retry logic
- File upload support with progress tracking

### Routing
- React Router v6 with nested routes
- Protected routes requiring authentication
- 404 page for invalid routes
- Route-based code splitting (planned)

### Styling
- Tailwind CSS with custom color palette
- Responsive design (mobile-first)
- Custom animations (fade-in, pulse, spin)
- Scrollbar customization
- Dark mode support (planned)

## 📦 Key Dependencies

### Core
- `react@18.2.0` - UI library
- `react-dom@18.2.0` - React DOM renderer
- `vite@7.2.4` - Build tool

### Routing & Navigation
- `react-router-dom@6.21.1` - Client-side routing

### State Management
- `zustand@4.4.7` - Lightweight state management
- `@tanstack/react-query@5.17.0` - Server state management

### API & Networking
- `axios@1.6.5` - HTTP client
- `socket.io-client@4.6.1` - WebSocket client

### Styling
- `tailwindcss@3.4.0` - Utility-first CSS
- `autoprefixer@10.4.16` - CSS vendor prefixing
- `postcss@8.4.32` - CSS processor

### UI & Icons
- `lucide-react@0.303.0` - Icon library
- `clsx@2.1.0` - Conditional class names
- `tailwind-merge@2.2.0` - Merge Tailwind classes

## 🔧 Configuration

### Vite Config
- Path alias: `@` → `./src`
- Dev server port: 3000
- Proxy `/api` and `/socket.io` to backend (port 5000)
- Code splitting with manual chunks

### Tailwind Config
- Custom color palette (primary, danger, warning, success)
- Extended breakpoints
- Custom utilities and components

### ESLint Config
- React plugin
- React hooks linting
- React Refresh plugin

## 🌐 API Client

### Authentication
```javascript
import { authAPI } from '@/lib/api';

// Login
const response = await authAPI.login({ email, password });

// Register
await authAPI.register(userData);

// Logout
await authAPI.logout();
```

### Incidents
```javascript
import { incidentsAPI } from '@/lib/api';

// Get all incidents
const incidents = await incidentsAPI.getAll({ status: 'active' });

// Get nearby incidents
const nearby = await incidentsAPI.getNearby(lat, lng, radius);

// Create incident
const incident = await incidentsAPI.create(data);
```

## 🔌 Socket.io Client

### Connect
```javascript
import { socketManager } from '@/lib/socket';

socketManager.connect();
```

### Subscribe to Location
```javascript
await socketManager.subscribeToLocation(lat, lng, radius);
```

### Listen for Events
```javascript
socketManager.on('incident:created', (data) => {
  console.log('New incident:', data);
});
```

## 🗂 State Management

### Auth Store
```javascript
import { useAuthStore } from '@/store/authStore';

const { user, login, logout } = useAuthStore();
```

### Incident Store
```javascript
import { useIncidentStore } from '@/store/incidentStore';

const { incidents, fetchIncidents } = useIncidentStore();
```

### UI Store
```javascript
import { useUIStore } from '@/store/uiStore';

const { toggleSidebar, addToast } = useUIStore();
```

## 🎯 Best Practices

### Component Organization
- Use functional components with hooks
- Keep components small and focused
- Extract reusable logic into custom hooks
- Use layout components for consistent structure

### State Management
- Store auth state in Zustand (persisted)
- Use React Query for server state
- Keep UI state separate from business logic

### API Calls
- Use React Query for data fetching
- Handle loading and error states
- Show user feedback (toasts, loading spinners)

### Code Quality
- Use ESLint for code linting
- Format code consistently
- Add comments for complex logic
- Use TypeScript types (via JSDoc if needed)

## 📱 Responsive Design

- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Responsive sidebar (collapsible on mobile)
- Touch-friendly UI elements

## 🚦 Next Steps

1. Implement map integration (Google Maps or Mapbox)
2. Add incident filtering and search
3. Build incident creation form with photo upload
4. Create real-time notification system
5. Add analytics dashboard for responders/admins
6. Implement dark mode
7. Add unit and integration tests
8. Set up CI/CD pipeline

## 📄 License

MIT
