// ──────────────────────────────
// 🌟 Core Components & Pages
// ──────────────────────────────
import Navbar from './Components/Navbar';
import HomePage from './Pages/HomePage';
import SignupPage from './Pages/SignupPage';
import LoginPage from './Pages/LoginPage';
import SettingsPage from './Pages/SettingsPage';
import ProfilePage from './Pages/ProfilePage/Profile';
import AddFriendPage from './Pages/AddFriendPage';
import ViewOtherProfile from './Pages/ProfilePage/ViewOtherProfile';

// ──────────────────────────────
// 🎉 Popup Modals
// ──────────────────────────────
import FunModeModal from './Components/PopupModals/FunModeModal';

// ──────────────────────────────
// 📚 Libraries & State Stores
// ──────────────────────────────
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import { useThemeStore } from './store/useThemeStore';
import { useEffect, useState } from 'react';
import { LoaderCircle } from 'lucide-react';
import { Toaster } from 'react-hot-toast';

function App() {
  // ──────────────────────────────
  // 🔑 Auth State & Actions
  // ──────────────────────────────
  const { authUser, checkAuth, isCheckingAuth, onlineUsers } = useAuthStore();

  // ──────────────────────────────
  // 🎉 FunMode Modal State
  // ──────────────────────────────
  const [showFunModePopup, setShowFunModePopup] = useState(false);

  // ──────────────────────────────
  // 🎨 Theme Store
  // ──────────────────────────────
  const { setTheme } = useThemeStore();

  // ──────────────────────────────
  // 🚦 Check Auth on App Load
  // ──────────────────────────────
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // ──────────────────────────────
  // 🌗 Apply Saved Theme (Light/Dark)
  // ──────────────────────────────
  useEffect(() => {
    const savedTheme = localStorage.getItem("chat-theme") || "light";
    setTheme(savedTheme);
  }, [setTheme]);

  // ──────────────────────────────
  // 🎉 Show FunMode Popup After Signup
  // ──────────────────────────────
  useEffect(() => {
    if (authUser && !authUser.funMode && !authUser.funModeLocked) {
      setShowFunModePopup(true);
    } else {
      setShowFunModePopup(false);
    }
  }, [authUser]);

  // ──────────────────────────────
  // ⏳ Loader While Checking Auth
  // ──────────────────────────────
  if (isCheckingAuth && !authUser) {
    return (
      <div className='flex items-center justify-center h-screen'>
        <LoaderCircle className='size-10 animate-spin' />
      </div>
    );
  }

  return (
    <>
      {/* ──────────────────────────────
          🧭 Navbar (Always Visible)
      ────────────────────────────── */}
      <Navbar />

      {/* ──────────────────────────────
          🔀 App Routes
      ────────────────────────────── */}
      <Routes>
        {/* 🏠 Default: Login or Redirect to Chat */}
        <Route path='/' element={!authUser ? <LoginPage /> : <Navigate to="/chat" />} />

        {/* 🚪 Login: Always Redirect to Home */}
        <Route path='/login' element={<Navigate to="/" />} />

        {/* 📝 Signup: Show Only If Not Authenticated */}
        <Route path='/signup' element={!authUser ? <SignupPage /> : <Navigate to="/chat" />} />

        {/* 💬 Chat: Protected Route */}
        <Route path='/chat' element={authUser ? <HomePage /> : <Navigate to="/" />} />

        {/* 👤 Profile: Protected Route */}
        <Route path='/profile' element={authUser ? <ProfilePage /> : <Navigate to="/" />} />

        {/* ➕ Add Friend: Protected Route */}
        <Route path='/addFriend' element={authUser ? <AddFriendPage /> : <Navigate to="/" />} />

        {/* ⚙️ Settings: Public Route */}
        <Route path='/settings' element={<SettingsPage />} />

        {/* 👀 View Other Profile: Protected Route */}
        <Route path='/chat/profile/:profileId' element={authUser ? <ViewOtherProfile /> : <Navigate to="/" />} />
      </Routes>

      {/* ──────────────────────────────
          🎉 FunMode Modal (First-Time Only)
      ────────────────────────────── */}
      {!isCheckingAuth && authUser && authUser.funMode === null && !authUser.funModeLocked && (
        <FunModeModal onClose={() => setShowFunModePopup(false)} />
      )}

      {/* ──────────────────────────────
          🔔 Toast Notifications
      ────────────────────────────── */}
      <Toaster position='bottom-right' />
    </>
  )
}

export default App;
