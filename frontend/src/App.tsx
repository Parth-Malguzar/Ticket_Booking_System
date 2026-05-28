import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Login from "./pages/Login"
import Signup from "./pages/Signup"
import ForgotPassword from "./pages/ForgotPassword"
import ResetPassword from "./pages/ResetPassword"
import Admin from "./pages/Admin.tsx"
import Vendor from "./pages/Vendor.tsx"
import Movies from "./pages/Movies.tsx"
import Concert from "./pages/Concert.tsx"
import Train from "./pages/Train.tsx"
import Navbar from "./components/Navbar"
import { useAuthStore } from "./stores/authStore"
import api from "./lib/axios.ts"
import { useThemeStore } from "./stores/themeStore"
import { useEffect } from "react"
import { Toaster } from "react-hot-toast"

const getRoleHomePath = (role?: string) => {
  if (role === "admin") return "/admin"
  if (role === "vendor") return "/vendor"
  return "/"
}

function App() {
  const { user, login, setUser } = useAuthStore()
  const theme = useThemeStore((state) => state.theme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    window.localStorage.setItem("theme", theme)
  }, [theme])

  useEffect(() => {
    const validate = async () => {
      try {
        const res = await api.get("/auth/me");
        if (res?.data?.user) login(res.data.user);
      } catch (err) {
        console.log(err);
        setUser(null);
      }
    };
    validate();
  }, [login, setUser]);

  return (
    <BrowserRouter>
      <Toaster />
      <Navbar />
      <Routes>
        <Route path="/" element={user ? <Navigate to={getRoleHomePath(user.role)} replace /> : <Navigate to="/login" replace />} />
        <Route path="/login" element={user ? <Navigate to={getRoleHomePath(user.role)} replace /> : <Login />} />
        <Route path="/signup" element={user ? <Navigate to={getRoleHomePath(user.role)} replace /> : <Signup />} />
        <Route path="/forgot-password" element={user ? <Navigate to={getRoleHomePath(user.role)} replace /> : <ForgotPassword />} />
        <Route path="/reset-password/:token" element={user ? <Navigate to={getRoleHomePath(user.role)} replace /> : <ResetPassword />} />
        <Route path="/admin" element={user?.role === "admin" ? <Admin /> : user ? <Navigate to={getRoleHomePath(user.role)} replace /> : <Navigate to="/login" replace />} />
        <Route path="/vendor" element={user?.role === "vendor" ? <Vendor /> : user ? <Navigate to={getRoleHomePath(user.role)} replace /> : <Navigate to="/login" replace />} />
        <Route path="/movies" element={user ? <Movies /> : <Navigate to="/login" replace />} />
        <Route path="/concert" element={user ? <Concert /> : <Navigate to="/login" replace />} />
        <Route path="/train" element={user ? <Train /> : <Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
