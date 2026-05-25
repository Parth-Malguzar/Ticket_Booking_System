import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { useAuthStore } from "../stores/authStore.ts";
import api from "../lib/axios.ts";
import axios from "axios";
import toast from "react-hot-toast";
import validator from "validator"
import { useNavigate } from "react-router-dom";

const Login = () => {
  const login = useAuthStore((state) => state.login)
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [remeberMe, setRemeberMe] = useState(false)

  useEffect(() => {
    console.log(remeberMe);
  }, [remeberMe])
  
  const navigate = useNavigate()
  const handleSuccess = async (credentialResponse: CredentialResponse) => {
    const token = credentialResponse.credential;
    if (!token) return;

    try {
      const res = await api.post("/auth/google", { token });
      login(res.data.user, res.data.token,remeberMe)//given by oauthcontroller
      console.log(res.data.user);

      toast.success(res.data.message)
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.message
        )
      }
    }
  };

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {

    e.preventDefault()
    setIsSubmitting(true)
    if (email === "") {
      setIsSubmitting(false)
      return toast.error("Email can't be empty")
    }
    if (!validator.isEmail(email)) {
      setIsSubmitting(false)
      return toast.error("Invalid Email")
    }
    if (password === "") {
      setIsSubmitting(false)
      return toast.error("Password can't be empty")
    }
    try {

      const res = await api.post(
        "/auth/login",
        { email, password }
      )

      login(res.data.user, res.data.token,remeberMe)//updates user state
      console.log(res);

      toast.success("Login Successful")

    } catch (error) {
      if (axios.isAxiosError(error)) {

        toast.error(
          error.response?.data?.message
        )
        if (error.response?.data.message === "User not found. Please sign up.") navigate("/signup")

      }

    } finally {
      setIsSubmitting(false)
    }
  }
  return (
    <div className="min-h-screen bg-(--app-bg) text-(--app-fg) flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-(--app-border) bg-(--app-surface) p-8 shadow-2xl shadow-black/40">
        <div className="mb-8 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-(--app-muted)">Welcome back</p>
          <h1 className="mt-3 text-3xl font-semibold text-(--app-fg)">Login to your account</h1>
          <p className="mt-2 text-sm text-(--app-muted)">Use email and password or continue with Google.</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-(--app-fg)">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full rounded-xl border border-(--app-border) bg-(--app-surface-2) px-4 py-3 text-(--app-fg) outline-none transition-colors placeholder:text-(--app-muted) focus:border-(--app-accent)"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-medium text-(--app-fg)">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-(--app-border) bg-(--app-surface-2) px-4 py-3 pr-12 text-(--app-fg) outline-none transition-colors placeholder:text-(--app-muted) focus:border-(--app-accent)"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-3 flex items-center text-(--app-muted) hover:text-(--app-fg)"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 2.5 12s2.5 6.5 9.5 6.5c1.454 0 2.722-.234 3.823-.618" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.679 6.68A10.453 10.453 0 0 1 12 5.5c7 0 9.5 6.5 9.5 6.5a14.745 14.745 0 0 1-2.663 3.669" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4 4 16 16" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 9.879A3 3 0 1 0 14.12 14.12" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.5 12S5 5.5 12 5.5 21.5 12 21.5 12 19 18.5 12 18.5 2.5 12 2.5 12Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15.5A3.5 3.5 0 1 0 12 8.5a3.5 3.5 0 0 0 0 7Z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-(--app-muted)">
              <input type="checkbox" onClick={()=>setRemeberMe(prev=>!prev)}
               className="rounded border-zinc-700 bg-zinc-900 text-white focus:ring-0" />
              Remember me
            </label>
            <Link to="/forgot-password" className="text-(--app-fg) hover:underline">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-(--app-accent) px-4 py-3 font-semibold text-(--app-accent-fg) transition-all hover:bg-(--app-accent-hover) active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="my-6 flex items-center gap-3 text-(--app-muted)">
          <div className="h-px flex-1 bg-(--app-border)" />
          <span className="text-xs uppercase tracking-[0.3em]">or</span>
          <div className="h-px flex-1 bg-(--app-border)" />
        </div>

        <div className="flex justify-center">
          <GoogleLogin
            text="continue_with"
            onSuccess={handleSuccess}
            onError={() => {
              console.log("login failed");
            }}
          />
        </div>

        <p className="mt-6 text-center text-sm text-zinc-400">
          Don’t have an account?{" "}
          <Link to="/signup" className="font-medium text-(--app-fg) hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;