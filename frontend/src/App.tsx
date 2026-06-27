import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Login from "./pages/Login"
import Signup from "./pages/Signup"
import ForgotPassword from "./pages/ForgotPassword"
import ResetPassword from "./pages/ResetPassword"
import VerifyEmail from "./pages/VerifyEmail"
import Admin from "./pages/Admin.tsx"
import Navbar from "./components/Navbar"
import Chatbot from "./components/Chatbot.tsx"
import { useAuthStore } from "./stores/authStore"
import api from "./lib/axios.ts"
import { useThemeStore } from "./stores/themeStore"
import { useEffect, useState } from "react"
import { useLocation } from "react-router-dom"
import { Toaster } from "react-hot-toast"
import UserPage from "./pages/UserPage.tsx"
import Vendor from "./pages/Vendor.tsx"
import BookingPage from "./pages/BookingPage.tsx"
import { socket } from "./lib/socket"

const getRoleHomePath = (role?: string) => {
  if (role === "admin") return "/admin"
  if (role === "vendor") return "/vendor"
  return "/user?tab=dashboard"
}

function AppRoutes() {
  const { user, login, setUser } = useAuthStore()
  const theme = useThemeStore((state) => state.theme)
  const location = useLocation()
  const fromVerification = location.state?.fromVerification === true
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    window.localStorage.setItem("theme", theme)
  }, [theme])

  useEffect(() => {
    if (fromVerification && location.pathname === "/login") {
      setUser(null);
      setAuthLoading(false);
      return;
    }

    const validate = async () => {
      try {
        const res = await api.get("/auth/me");
        if (res?.data?.user) login(res.data.user);
      } catch (err) {
        console.log(err);
        setUser(null);
      } finally {
        setAuthLoading(false);
      }
    };
    validate();
  }, [fromVerification, location.pathname, login, setUser]);

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-(--app-bg)">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-(--app-accent) border-t-transparent"></div>
      </div>
    )
  }

  return (
    <>
      <Toaster />
      <Navbar />
      <Routes>
        <Route path="/" element={user ? <Navigate to={getRoleHomePath(user.role)} replace /> : <Navigate to="/login" replace />} />
        <Route path="/login" element={user && !fromVerification ? <Navigate to={getRoleHomePath(user.role)} replace /> : <Login />} />
        <Route path="/signup" element={user ? <Navigate to={getRoleHomePath(user.role)} replace /> : <Signup />} />
        <Route path="/forgot-password" element={user ? <Navigate to={getRoleHomePath(user.role)} replace /> : <ForgotPassword />} />
        <Route path="/reset-password/:token" element={user ? <Navigate to={getRoleHomePath(user.role)} replace /> : <ResetPassword />} />
        <Route path="/verify-email/:token" element={<VerifyEmail />} />
        <Route path="/admin" element={user?.role === "admin" ? <Admin /> : user ? <Navigate to={getRoleHomePath(user.role)} replace /> : <Navigate to="/login" replace />} />
        <Route path="/vendor" element={user?.role === "vendor" ? <Vendor/> : user ? <Navigate to={getRoleHomePath(user.role)} replace /> : <Navigate to="/login" replace />} />
        <Route path="/book/:id" element={user?.role === "user" ? <BookingPage /> : user ? <Navigate to={getRoleHomePath(user.role)} replace /> : <Navigate to="/login" replace />} />
        <Route
          path="/user"
          element={
            user
              ? <UserPage />
              : <Navigate
                  to="/login"
                  replace
                />
          }
        />
      </Routes>
      <Chatbot />
    </>
  )
}

function App() {
  const {user}=useAuthStore();
   useEffect(() => {
    if (user?.id) {
      // 1. Connect socket when user is logged in
      socket.connect();

      socket.on("connect", () => {
        console.log("Connected", socket.id);
        if (user?.id) {
          if (user.role === "vendor") {
            console.log("Global Socket Connect: Emitting join_vendor_room for user:", user.id);
            socket.emit("join_vendor_room", user.id);
          } else if (user.role === "admin") {
            console.log("Global Socket Connect: Emitting join_admin_room for user:", user.id);
            socket.emit("join_admin_room");
          }
        }
      });

      socket.on("disconnect", (reason) => {
        console.log("Disconnected:", reason);
      });

      socket.on("connect_error", (err) => {
        console.log("Connect Error:", err.message);
      });
    } else {
      // 2. Disconnect socket when logged out
      socket.disconnect();
    }

    // Cleanup listeners and disconnect on unmount
    return () => {
      socket.disconnect();
      socket.off("connect");
      socket.off("disconnect");
      socket.off("connect_error");
    };
  }, [user?.id]);


  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}

export default App
