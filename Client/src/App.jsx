// ──────────────────────────────
// Core Components & Pages
// ──────────────────────────────
import Navbar from './Components/Navbar';
import HomePage from './Pages/HomePage';
import SignupPage from './Pages/SignupPage';
import LoginPage from './Pages/LoginPage';
import SettingsPage from './Pages/SettingsPage';
import ProfilePage from './Pages/ProfilePage/Profile';
import AddFriendPage from './Pages/AddFriendPage';
import ViewOtherProfile from './Pages/ProfilePage/ViewOtherProfile';
import EmailVerifyPage from './Pages/EmailVerifyPage';
import ForgotPasswordPage from './Pages/PasswordPage/ForgotPasswordPage';
import ResetPasswordPage from './Pages/PasswordPage/ResetPasswordPage';
import ChangePasswordPage from './Pages/PasswordPage/ChangePasswordPage';

// ──────────────────────────────
// Popup Modals
// ──────────────────────────────
import FunModeModal from './Components/PopupModals/FunModeModal';

// ──────────────────────────────
// Libraries & State Stores
// ──────────────────────────────
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import { useThemeStore } from './store/useThemeStore';
import { useEffect } from 'react';
import { LoaderCircle } from 'lucide-react';
import { Toaster } from 'react-hot-toast';

function App() {
  // ──────────────────────────────
  // Auth State & Actions
  // ──────────────────────────────
  const {
    authUser,
    session,
    isCheckingAuth,
    showFunModePopup,
    setFunModePopup,
    connectSocket
  } = useAuthStore();

  // ──────────────────────────────
  // Theme Store
  // ──────────────────────────────
  const { setTheme } = useThemeStore();

  // ──────────────────────────────
  // Check Auth on App Load
  // ──────────────────────────────
  useEffect(() => {
    session();
  }, [session]);

  // ──────────────────────────────
  // Apply Saved Theme (Light/Dark)
  // ──────────────────────────────
  useEffect(() => {
    const savedTheme = localStorage.getItem("chat-theme") || "light";
    setTheme(savedTheme);
  }, [setTheme]);

  // ──────────────────────────────
  // Connect Socket when Verified User Detected
  // ──────────────────────────────
  useEffect(() => {
    if (authUser?.isVerified) {
      connectSocket(authUser);

      // Show FunMode modal if eligible
      if (!authUser.funModeLocked && authUser.funMode === null) {
        setFunModePopup(true);
      }
    }
  }, [authUser, connectSocket, setFunModePopup]);

  // ──────────────────────────────
  // Loader While Checking Auth
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
          Navbar (Always Visible)
      ────────────────────────────── */}
      <Navbar />

      {/* ──────────────────────────────
          App Routes
      ────────────────────────────── */}
      <Routes>        
        <Route path='/' element={!authUser ? <LoginPage /> : <Navigate to="/chats" />} />  {/* Default: Login or Redirect to Chat */}
        <Route path='/login' element={!authUser ? <Navigate to="/" /> : <Navigate to="/chats" />} /> {/* Login: Always Redirect to Home */}
        <Route path='/signup' element={!authUser ? <SignupPage /> : <Navigate to="/chats" />} /> {/* Signup: Show Only If Not Authenticated */}

        {/* Chat: only verified users */}
        <Route path='/chats' element={authUser ? <HomePage /> : <Navigate to="/" />} />

        {/* Profile: only verified users */}
        <Route path='/profile' element={authUser ? <ProfilePage /> : <Navigate to="/verify-email" />} />
        <Route path='/addFriend' element={authUser ? <AddFriendPage /> : <Navigate to="/verify-email" />} />

        {/* Settings: Public Route */}
        <Route path='/settings' element={<SettingsPage />} />

        {/* View Other Profile: Protected Route */}
        <Route path='/users/:userId' element={authUser ? <ViewOtherProfile /> : <Navigate to="/" />} />

        {/* Email Verification */}
        <Route path='/verify-email' element={authUser && !authUser.isVerified ? <EmailVerifyPage /> : <Navigate to="/chats" />} />

        {/* Password: change or if forgotten password */}
        <Route path='/forgot-password' element={<ForgotPasswordPage />} />
        <Route path='/reset-password/:token' element={<ResetPasswordPage />} />
        <Route path='/change-password' element={<ChangePasswordPage />} />
      </Routes>

      {/* ──────────────────────────────
          FunMode Modal (First-Time Only)
      ────────────────────────────── */}
      {showFunModePopup && <FunModeModal onClose={() => setFunModePopup(false)} />}

      {/* ──────────────────────────────
          Toast Notifications
      ────────────────────────────── */}
      <Toaster position='bottom-right' />
    </>
  )
}

export default App;
