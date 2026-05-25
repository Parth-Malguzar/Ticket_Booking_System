import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import validator from "validator"
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../lib/axios.ts";

const EyeIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.5 12S5 5.5 12 5.5 21.5 12 21.5 12 19 18.5 12 18.5 2.5 12 2.5 12Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15.5A3.5 3.5 0 1 0 12 8.5a3.5 3.5 0 0 0 0 7Z" />
    </svg>
)

const EyeOffIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 2.5 12s2.5 6.5 9.5 6.5c1.454 0 2.722-.234 3.823-.618" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.679 6.68A10.453 10.453 0 0 1 12 5.5c7 0 9.5 6.5 9.5 6.5a14.745 14.745 0 0 1-2.663 3.669" />
        <path strokeLinecap="round" strokeLinejoin="round" d="m4 4 16 16" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 9.879A3 3 0 1 0 14.12 14.12" />
    </svg>
)

const ResetPassword = () => {
    const { token } = useParams();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isValid, setIsValid] = useState(true)
    const [isVerifying, setIsVerifying] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        let isMounted = true;
        const verifyToken = async () => {
            if (!token) {
                setIsValid(false)
                setIsVerifying(false)
                return
            }
            try {
                await api.get(`/auth/verify-reset-token/${encodeURIComponent(token)}`)
                if (isMounted) {
                    setIsValid(true)
                }
            } catch (error) {
                if (isMounted) {
                    setIsValid(false)
                }
                console.log(error);
            } finally {
                if (isMounted) {
                    setIsVerifying(false)
                }
            }

        }
        verifyToken()
        return () => {
            isMounted = false
        }
    }, [token])
    const navigate = useNavigate()
    useEffect(() => {
        if (!isVerifying && !isValid) {
            toast.error("reset link expired please try again", {
                id: "reset-link"
            })
            navigate("/forgot-password", { replace: true })
        }
    }, [isValid, isVerifying, navigate])

    if (isVerifying) {
        return (
            <div className="min-h-screen bg-(--app-bg) text-(--app-fg) flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-md rounded-3xl border border-(--app-border) bg-(--app-surface) p-8 shadow-2xl shadow-black/40 text-center">
                    <p className="text-sm uppercase tracking-[0.3em] text-(--app-muted)">Checking link</p>
                    <h1 className="mt-3 text-3xl font-semibold text-(--app-fg)">Verifying reset token...</h1>
                    <p className="mt-2 text-sm text-(--app-muted)">Please wait while we confirm your password reset link.</p>
                </div>
            </div>
        )
    }

    if (!isValid) {
        return null
    }

    console.log(isValid);


    const handleSubmit = async (event: React.SyntheticEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsSubmitting(true)
        if (password !== confirmPassword) {
            setIsSubmitting(false)
            return toast.error("password and confirm password must match")
        }
        if (!validator.isStrongPassword(password)) {
            setIsSubmitting(false)
            return toast.error("Password must be strong : >=8chars, upper and lower case chars, digits and special symbols")
        }
        try {
            const res = await api.post("/auth/reset-password", { token, password })
            console.log(res);
            setPassword("")
            setConfirmPassword("")
            toast.success(res.data.message)
            navigate("/login", { replace: true })
        } catch (error) {
            if (axios.isAxiosError(error)) {
                toast.error(error.response?.data?.message)
            }
        } finally {
            setIsSubmitting(false)
        }
    };

    return (
        <div className="min-h-screen bg-(--app-bg) text-(--app-fg) flex items-center justify-center px-4 py-12">
            <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-(--app-border) bg-(--app-surface) p-8 shadow-2xl shadow-black/40">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_45%)]" />
                <div className="relative mb-8 text-center">
                    <p className="text-sm uppercase tracking-[0.3em] text-(--app-muted)">Set new password</p>
                    <h1 className="mt-3 text-3xl font-semibold text-(--app-fg)">Reset your password</h1>
                    <p className="mt-2 text-sm text-(--app-muted)">
                        Choose a strong new password for your account.
                    </p>
                </div>

                <form className="relative space-y-4" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="password" className="mb-2 block text-sm font-medium text-(--app-fg)">
                            New password
                        </label>
                        <div className="relative">
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Create a new password"
                                className="w-full rounded-xl border border-(--app-border) bg-(--app-surface-2) px-4 py-3 pr-12 text-(--app-fg) outline-none transition-colors placeholder:text-(--app-muted) focus:border-(--app-accent)"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((prev) => !prev)}
                                className="absolute inset-y-0 right-3 flex items-center text-(--app-muted) hover:text-(--app-fg)"
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-(--app-fg)">
                            Confirm new password
                        </label>
                        <div className="relative">
                            <input
                                id="confirmPassword"
                                type={showPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm your password"
                                className="w-full rounded-xl border border-(--app-border) bg-(--app-surface-2) px-4 py-3 pr-12 text-(--app-fg) outline-none transition-colors placeholder:text-(--app-muted) focus:border-(--app-accent)"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((prev) => !prev)}
                                className="absolute inset-y-0 right-3 flex items-center text-(--app-muted) hover:text-(--app-fg)"
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full rounded-xl bg-(--app-accent) px-4 py-3 font-semibold text-(--app-accent-fg) transition-all hover:bg-(--app-accent-hover) active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        {isSubmitting ? "Resetting..." : "Reset password"}
                    </button>
                </form>

                <p className="relative mt-6 text-center text-sm text-(--app-muted)">
                    Go back to{" "}
                    <Link to="/login" className="font-medium text-(--app-fg) hover:underline">
                        Login
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default ResetPassword;
