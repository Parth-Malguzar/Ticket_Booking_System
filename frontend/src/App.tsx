import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Home from "./pages/Home"
import Login from "./pages/Login"
import Signup from "./pages/Signup"
import ForgotPassword from "./pages/ForgotPassword"
import ResetPassword from "./pages/ResetPassword"
import Navbar from "./components/Navbar"
import { useAuthStore } from "./stores/authStore"
import { useThemeStore } from "./stores/themeStore"
import { useEffect } from "react"
import { Toaster } from "react-hot-toast"
function App() {
  const { user } = useAuthStore()
  const theme = useThemeStore((state) => state.theme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    window.localStorage.setItem("theme", theme)
  }, [theme])

  return (
    <BrowserRouter>
      <Toaster />
      <Navbar />
      <Routes>
        <Route path="/" element={user ? <Home /> : <Navigate to="/login" />} />
        <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
        <Route path="/signup" element={user ? <Navigate to="/" /> : <Signup />} />
        <Route path="/forgot-password" element={user ? <Navigate to="/" /> : <ForgotPassword />} />
        <Route path="/reset-password/:token" element={user ? <Navigate to="/" /> : <ResetPassword />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
