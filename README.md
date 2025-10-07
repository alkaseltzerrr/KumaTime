
# KumaTime 🐻✨

> Your cute companion for productive study sessions

A delightful Pomodoro timer application featuring an adorable virtual buddy that helps you stay focused and motivated during your study sessions. Built with love and lots of kawaii energy! (｡◕‿◕｡)

![KumaTime Preview](https://img.shields.io/badge/Status-Active%20Development-brightgreen?style=for-the-badge)
![React](https://img.shields.io/badge/React-19.1.1-blue?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-green?style=for-the-badge&logo=node.js)

## ✨ Features

### 🎯 **Core Functionality**
- **Pomodoro Timer** - Customizable work/break intervals with beautiful circular progress
- **Virtual Buddy System** - Your cute bear companion with dynamic moods and leveling
- **Focus Mode** - Distraction-free fullscreen experience with customizable options
- **Smart Notifications** - Audio beeps and visual celebrations for session completions

### 🏆 **Progress & Gamification**
- **Session Tracking** - Automatic logging of completed focus sessions
- **Achievement System** - Unlock badges for consistent study habits
- **Statistics Dashboard** - Track daily sessions, streaks, and total focus time
- **Buddy Evolution** - Watch your companion grow as you complete more sessions

### 🎨 **User Experience**
- **Beautiful UI** - Pastel gradients and smooth animations throughout
- **Welcome Experience** - Onboarding popup with feature preview
- **Dynamic Study Tips** - 45+ rotating productivity tips with smart randomization
- **Responsive Design** - Works perfectly on desktop and mobile devices
- **Authentication** - Optional user accounts for cross-device sync

### 🔧 **Advanced Features**
- **Customizable Timers** - Adjust work, short break, and long break durations
- **Focus Options** - Fullscreen mode, progress hiding, ultra-minimalist view
- **Local Storage** - Session data persists locally with optional cloud backup
- **Real-time Sync** - Backend integration for multi-device experience

## 🛠 Tech Stack

### **Frontend**
- **React 19.1.1** - Latest React with modern hooks and features
- **Vite** - Lightning-fast build tool and development server
- **Tailwind CSS** - Utility-first styling with custom pastel color palette
- **Framer Motion** - Smooth animations and transitions
- **Lucide React** - Beautiful icon library
- **Axios** - HTTP client for API communication
- **React Router Dom** - Client-side routing

### **Backend**
- **Node.js** - JavaScript runtime environment
- **Express.js** - Fast web application framework
- **PostgreSQL** - Robust relational database
- **JWT Authentication** - Secure user session management
- **CORS** - Cross-origin resource sharing
- **Environment Variables** - Secure configuration management

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL database
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/alkaseltzerrr/KumaTime.git
cd KumaTime
```

2. **Set up the backend**
```bash
cd backend
npm install
```

Create `backend/.env`:
```env
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/kumatime
PORT=3000
JWT_SECRET=your_jwt_secret_here
NODE_ENV=development
```

3. **Set up the frontend**
```bash
cd frontend
npm install
```

Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:3000
```

4. **Start development servers**

Backend (from `/backend` directory):
```bash
npm run dev
```

Frontend (from `/frontend` directory):
```bash
npm run dev
```

5. **Open your browser**
Navigate to `http://localhost:5173` and start focusing! 🎯

## 📁 Project Structure

```
KumaTime/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js          # Database connection
│   │   ├── controllers/
│   │   │   ├── authController.js    # User authentication
│   │   │   └── sessionController.js # Session management
│   │   ├── middleware/
│   │   │   └── auth.js             # JWT middleware
│   │   ├── routes/
│   │   │   ├── authRoutes.js       # Authentication routes
│   │   │   └── sessionRoutes.js    # Session routes
│   │   └── server.js               # Express server setup
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── MenuBar.jsx         # Navigation bar
│   │   │   ├── PomodoroTimer.jsx   # Main timer component
│   │   │   ├── VirtualBuddy.jsx    # Buddy system
│   │   │   └── WelcomePopup.jsx    # Onboarding experience
│   │   ├── contexts/
│   │   │   ├── AuthContext.jsx     # User authentication state
│   │   │   └── FocusModeContext.jsx # Focus mode state
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx       # Main application page
│   │   │   └── Login.jsx          # Authentication page
│   │   ├── App.jsx                # Main app component
│   │   └── main.jsx               # App entry point
│   ├── package.json
│   └── .env
└── README.md
```

## 🎮 Usage Guide

### **Basic Timer Usage**
1. Click **"▶ Start"** to begin a focus session
2. Work for the set duration (default: 25 minutes)
3. Take a break when the timer completes
4. Repeat for optimal productivity!

### **Customizing Your Experience**
- **Timer Settings**: Adjust work/break durations in the configuration panel
- **Focus Mode**: Enter distraction-free fullscreen mode with customizable options
- **Buddy Interaction**: Watch your buddy's mood change based on your productivity
- **Study Tips**: Click the refresh button for new productivity advice

### **Tracking Progress**
- View today's sessions and total focus time in the left sidebar
- Check your current streak and longest streak achievements
- Unlock badges for consistent study habits
- Monitor your buddy's level and happiness

## 🌈 Features in Detail

### **Virtual Buddy System**
Your cute bear companion reacts to your productivity:
- **Idle**: Relaxed state when not actively studying
- **Happy**: Celebrating completed sessions
- **Sleepy**: After 5 minutes of inactivity
- **Celebrating**: Animated celebration after session completion

### **Focus Mode Options**
- **Fullscreen Mode**: Complete immersion experience
- **Hide Progress Ring**: Minimize visual distractions
- **Ultra Minimalist**: Clean, distraction-free interface

### **Study Tips System**
- **45+ unique tips** covering various study techniques
- **Smart randomization** prevents repetition
- **Categories include**: Memory techniques, health tips, productivity strategies
- **Fresh content** on every page refresh

## 🛠 Development

### **Available Scripts**

Backend:
```bash
npm run dev    # Start development server with nodemon
npm start      # Start production server
```

Frontend:
```bash
npm run dev      # Start Vite development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### **Environment Variables**

Backend (`.env`):
```env
DATABASE_URL=postgresql://username:password@localhost:5432/database_name
PORT=3000
JWT_SECRET=your-super-secret-jwt-key
NODE_ENV=development
```

Frontend (`.env`):
```env
VITE_API_URL=http://localhost:3000
```

## 🐛 Troubleshooting

### **Common Issues**

**Backend won't start:**
- Ensure PostgreSQL is running
- Check `DATABASE_URL` in `backend/.env`
- Verify all dependencies are installed with `npm install`

**Frontend build errors:**
- Clear `node_modules` and run `npm install` again
- Check that all environment variables are set correctly
- Ensure you're using Node.js v16 or higher

**Timer not working properly:**
- Check browser console for JavaScript errors
- Ensure audio permissions are granted for notification sounds
- Try refreshing the page or clearing browser cache

**Authentication issues:**
- Verify JWT_SECRET is set in backend environment
- Check that the API URL is correctly configured in frontend
- Ensure CORS is properly configured for your domain

### **Browser Compatibility**
- **Recommended**: Chrome, Edge, Safari (latest versions)
- **Limited Support**: Firefox (some animations may not work perfectly)
- **Mobile**: Fully responsive on iOS Safari and Chrome Mobile

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### **Development Guidelines**
- Follow existing code style and conventions
- Add comments for complex logic
- Test your changes thoroughly
- Update documentation as needed

## 🙏 Acknowledgments

- **Pomodoro Technique** - Francesco Cirillo
- **Icons** - Lucide React
- **Animations** - Framer Motion
- **Styling** - Tailwind CSS
- **Cute Energy** - Kawaii culture inspiration ✨

---

**Happy focusing with your KumaTime buddy! 🐻💕**

##Currently still in development btw :3

*May your study sessions be productive and your breaks be restorative* (◕‿◕)♡


