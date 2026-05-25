import { useState } from "react";
import { Link } from "react-router-dom";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { useAuthStore } from "../stores/authStore.ts";
import validator from "validator";
import toast from "react-hot-toast";
import api from "../lib/axios.ts";
import axios from "axios";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const login = useAuthStore((state) => state.login);

  const handleSuccess = async (credentialResponse: CredentialResponse) => {
    const token = credentialResponse.credential;
    if (!token) return;

    try {
      const res = await api.post("/auth/google", { token });
      toast.success(res.data.message)
      login(res.data.user, res.data.token,true);
    } catch (error) {
      console.log("google signup failed", error);
    }
  };

  const handleSubmit = async (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    if (!validator.isStrongPassword(password)) {
      setIsSubmitting(false)
      return toast.error("Password must be strong : >=8chars, upper and lower case chars, digits and special symbols")
    }
    try {
      const res = await api.post("/auth/signup", { name, email, password });
      toast.success(res.data.message)
      login(res.data.user, res.data.token,true);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log("google signup failed", error.response?.data?.message);
      }
    } finally {
      setIsSubmitting(false)
    }
    console.log({ name, email, password });
  };

  return (
  <div className="min-h-screen bg-black text-white flex items-center justify-center px-4 py-12">
    <div className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-950 p-8 shadow-2xl shadow-black/40">
      
      <div className="mb-8 text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
          Create account
        </p>

        <h1 className="mt-3 text-3xl font-semibold text-white">
          Sign up to get started
        </h1>

        <p className="mt-2 text-sm text-zinc-400">
          Create an account with email and password or continue with Google.
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>

        <div>
          <label
            htmlFor="name"
            className="mb-2 block text-sm font-medium text-white"
          >
            Full name
          </label>

          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white outline-none transition-colors placeholder:text-zinc-500 focus:border-zinc-500"
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-medium text-white"
          >
            Email
          </label>

          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white outline-none transition-colors placeholder:text-zinc-500 focus:border-zinc-500"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-2 block text-sm font-medium text-white"
          >
            Password
          </label>

          <div className="relative">

            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 pr-12 text-white outline-none transition-colors placeholder:text-zinc-500 focus:border-zinc-500"
            />

            <button
              type="button"
              onClick={() =>
                setShowPassword((prev) => !prev)
              }
              className="absolute inset-y-0 right-3 flex items-center text-zinc-400 hover:text-white"
              aria-label={
                showPassword
                  ? "Hide password"
                  : "Show password"
              }
            >

              {showPassword ? (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-5 w-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.98 8.223A10.477 10.477 0 0 0 2.5 12s2.5 6.5 9.5 6.5c1.454 0 2.722-.234 3.823-.618"
                  />

                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6.679 6.68A10.453 10.453 0 0 1 12 5.5c7 0 9.5 6.5 9.5 6.5a14.745 14.745 0 0 1-2.663 3.669"
                  />

                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m4 4 16 16"
                  />

                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.879 9.879A3 3 0 1 0 14.12 14.12"
                  />
                </svg>
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-5 w-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.5 12S5 5.5 12 5.5 21.5 12 21.5 12 19 18.5 12 18.5 2.5 12 2.5 12Z"
                  />

                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 15.5A3.5 3.5 0 1 0 12 8.5a3.5 3.5 0 0 0 0 7Z"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-xl bg-white px-4 py-3 font-semibold text-black transition-all hover:bg-zinc-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting
            ? "Creating account..."
            : "Sign up"}
        </button>
      </form>

      <div className="my-6 flex items-center gap-3 text-zinc-500">
        <div className="h-px flex-1 bg-zinc-800" />

        <span className="text-xs uppercase tracking-[0.3em]">
          or
        </span>

        <div className="h-px flex-1 bg-zinc-800" />
      </div>

      <div className="flex justify-center">
        <GoogleLogin
          text="continue_with"
          onSuccess={handleSuccess}
          onError={() => {
            console.log("signup failed");
          }}
        />
      </div>

      <p className="mt-6 text-center text-sm text-zinc-400">
        Already have an account?{" "}

        <Link
          to="/login"
          className="font-medium text-white hover:underline"
        >
          Login
        </Link>
      </p>
    </div>
  </div>
);
}

export default Signup;