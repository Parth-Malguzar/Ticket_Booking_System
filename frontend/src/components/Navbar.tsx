import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../stores/authStore.ts";
import { useThemeStore } from "../stores/themeStore.ts";
import { useEffect, useRef, useState } from "react";
import { Eye, EyeOff, Trash2, User } from "lucide-react";
import api from "../lib/axios.ts";
import toast from "react-hot-toast";
import axios from "axios";

const SunIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
        <circle cx="12" cy="12" r="4" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v2.5M12 19.5V22M4.93 4.93l1.77 1.77M17.3 17.3l1.77 1.77M2 12h2.5M19.5 12H22M4.93 19.07l1.77-1.77M17.3 6.7l1.77-1.77" />
    </svg>
)

const MoonIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.7A8.7 8.7 0 1 1 11.3 3a7 7 0 0 0 9.7 9.7Z" />
    </svg>
)

const roleNavItems = {
    user: [
        {
            label: "Dashboard",
            to: "/user?tab=dashboard",
            tab: "dashboard"
        },
        {
            label: "Movies",
            to: "/user?tab=movies",
            tab: "movies"
        },
        {
            label: "Concert",
            to: "/user?tab=concert",
            tab: "concert"
        },
        {
            label: "Train",
            to: "/user?tab=train",
            tab: "train"
        },
    ],
    admin: [
        { label: "Dashboard", to: "/admin?tab=dashboard", tab: "dashboard" },
        { label: "User", to: "/admin?tab=user", tab: "user" },
        { label: "Vendor", to: "/admin?tab=vendor", tab: "vendor" },
        { label: "Movies", to: "/admin?tab=movies", tab: "movies" },
        { label: "Train", to: "/admin?tab=train", tab: "train" },
        { label: "Concert", to: "/admin?tab=concert", tab: "concert" },
    ],
    vendor: [
        { label: "Dashboard", to: "/vendor?tab=dashboard", tab: "dashboard" },
        { label: "Movies", to: "/vendor?tab=movies", tab: "movies" },
        { label: "Train", to: "/vendor?tab=train", tab: "train" },
        { label: "Concert", to: "/vendor?tab=concert", tab: "concert" },
    ],
} as const

const Navbar = () => {
    const { user, logout, setUser } = useAuthStore()
    const { theme, toggleTheme } = useThemeStore();
    const location = useLocation();
    const activeTab = new URLSearchParams(location.search).get("tab") ?? "dashboard"//object to read query params
    const isLoginPage = location.pathname === "/login";
    const isSignupPage = location.pathname === "/signup";
    const isResetPage = location.pathname.startsWith("/reset-password")
    const isVerifyEmailPage = location.pathname.startsWith("/verify-email/")

    const [open, setOpen] = useState(false)
    const [delPopup, setDelPopup] = useState(false)
    const [password, setPassword] = useState("")
    const [showDeletePassword, setShowDeletePassword] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    const dropdownRef = useRef<HTMLDivElement>(null)
    const delPopupRef = useRef<HTMLDivElement>(null)

    useEffect(() => {

        const handleClickOutside = (
            e: MouseEvent
        ) => {
            if (
                delPopup &&
                delPopupRef.current &&
                !delPopupRef.current.contains(e.target as Node)
            ) {
                setDelPopup(false)
            }

            if (
                open &&
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target as Node)
            ) {
                setOpen(false)
            }
        }

        document.addEventListener(
            "mousedown",
            handleClickOutside
        )

        return () => {

            document.removeEventListener(
                "mousedown",
                handleClickOutside
            )
        }

    }, [delPopup, open])

    if (isVerifyEmailPage) {
        return null
    }

    const handleDelete = async () => {
        if (!password.trim()) {
            return toast.error("Please enter your password")
        }

        setIsDeleting(true)
        const loadingId = toast.loading("Deleting account...")

        try {
            const res = await api.delete("/auth/delete", { data: { password } })
            toast.success(res.data?.message || "Account deleted", { id: loadingId })
            setDelPopup(false)
            setPassword("")
            setShowDeletePassword(false)
            setUser(null)
            window.location.href = "/login"
        } catch (error) {
            if (axios.isAxiosError(error)) {
                toast.error(error.response?.data?.message || "Unable to delete account", { id: loadingId })
            } else {
                toast.error("Unable to delete account", { id: loadingId })
            }
            console.log(error)
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <>
            <nav className="border-b border-(--app-border) bg-(--app-surface) text-(--app-fg) shadow-[0_1px_0_rgba(255,255,255,0.04)]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-3">
                            <img width={30} src="/favicon.svg" alt="" />
                            <Link to="/" className="text-2xl font-semibold tracking-tight text-(--app-fg)">
                                BookMyTicket
                            </Link>
                        </div>

                        <div className="flex items-center gap-4">
                            <button
                                type="button"
                                onClick={toggleTheme}
                                className="inline-flex items-center justify-center rounded-full border border-(--app-border) bg-(--app-surface-2) p-2 text-(--app-fg) transition-all hover:border-(--app-accent) hover:bg-(--app-accent) hover:text-(--app-accent-fg) active:scale-[0.98]"
                                aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
                                title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
                            >
                                {theme === "dark" ? <SunIcon /> : <MoonIcon />}
                            </button>

                            {!user ? (
                                <>
                                    {!isLoginPage && !isResetPage && (
                                        <Link
                                            to="/login"
                                            className="rounded-full border border-(--app-border) bg-(--app-surface-2) px-4 py-2 text-sm font-medium text-(--app-fg) transition-all hover:border-(--app-accent) hover:bg-(--app-accent) hover:text-(--app-accent-fg) active:scale-[0.98]"
                                        >
                                            Login
                                        </Link>
                                    )}

                                    {!isSignupPage && !isResetPage && (
                                        <Link
                                            to="/signup"
                                            className="rounded-full bg-(--app-accent) px-4 py-2 text-sm font-medium text-(--app-accent-fg) transition-all hover:bg-(--app-accent-hover) active:scale-[0.98]"
                                        >
                                            Sign Up
                                        </Link>
                                    )}
                                </>
                            ) : (
                                <div className="flex items-center gap-5">
                                    <div className="relative" ref={dropdownRef}>
                                        <button
                                            type="button"
                                            onClick={() => setOpen(!open)}
                                            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-(--app-border) bg-(--app-surface-2) text-(--app-fg) transition-all hover:border-(--app-accent) hover:bg-(--app-accent) hover:text-(--app-accent-fg) active:scale-[0.98]"
                                            aria-label="Open account menu"
                                        >
                                            <User size={18} />
                                        </button>
                                        {open && (
                                            <div className="absolute right-0 top-12 w-fit overflow-hidden rounded-2xl border border-(--app-border) bg-(--app-surface) p-2 shadow-2xl shadow-black/30">
                                                <div className="px-3 pb-2 pt-1 text-xs tracking-[0.25em] text-(--app-muted)">
                                                    <p className="text-xs uppercase tracking-[0.25em] text-(--app-muted)">
                                                        Account
                                                    </p>

                                                    <p className="mt-1 text-sm text-(--app-fg)">
                                                        {user.email}
                                                    </p>
                                                </div>

                                                {user.role !== "admin" && (
                                                    <button className="w-full rounded-xl px-3 py-2 text-left text-sm text-(--app-fg) transition-colors hover:bg-(--app-surface-2)">
                                                        Balance : ${user.balance}
                                                    </button>
                                                )}

                                                <button className="w-full rounded-xl px-3 py-2 text-left text-sm text-(--app-fg) transition-colors hover:bg-(--app-surface-2)">
                                                    Bookings
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setOpen(false)
                                                        logout()
                                                    }}
                                                    className="mt-1 w-full rounded-xl px-3 py-2 text-left text-sm text-(--app-fg) transition-colors hover:bg-(--app-surface-2)"
                                                >
                                                    Logout
                                                </button>

                                                <button onClick={() => setDelPopup(true)} className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm text-red-500 transition-colors hover:bg-red-500/10 hover:text-red-400">
                                                    <span>Delete Account</span>
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            </nav>

            {user && (
                <nav className="border-b border-(--app-border) bg-(--app-surface) text-(--app-fg) shadow-[0_1px_0_rgba(255,255,255,0.04)]">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex h-14 flex-wrap items-center justify-center gap-3 sm:justify-start">
                            {roleNavItems[
                                user.role as keyof typeof roleNavItems
                            ].map((item) => {

                                const isActive =
                                    activeTab === item.tab

                                return (
                                    <Link
                                        key={item.to}
                                        to={item.to}
                                        className={`rounded-full border px-4 py-2 text-sm font-medium transition-all active:scale-[0.98] ${isActive
                                            ? "border-(--app-accent) bg-(--app-accent) text-(--app-accent-fg)"
                                            : "border-(--app-border) bg-(--app-surface-2) text-(--app-fg) hover:border-(--app-accent) hover:bg-(--app-accent) hover:text-(--app-accent-fg)"
                                            }`}
                                    >
                                        {item.label}
                                    </Link>
                                )
                            })}
                        </div>
                    </div>
                </nav>
            )}

            {delPopup && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
                    <div
                        ref={delPopupRef}
                        className="w-full max-w-md rounded-3xl border border-(--app-border) bg-(--app-surface) p-8 shadow-2xl shadow-black/40"
                    >
                        <div className="mb-8 text-center">
                            <p className="text-sm uppercase tracking-[0.3em] text-(--app-muted)">Danger zone</p>
                            <h2 className="mt-3 text-3xl font-semibold text-(--app-fg)">Delete account</h2>
                            <p className="mt-2 text-sm text-(--app-muted)">
                                This action cannot be undone. Enter your password to continue or use Forgot password if you need help remembering it.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label htmlFor="delete-password" className="mb-2 block text-sm font-medium text-(--app-fg)">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        id="delete-password"
                                        type={showDeletePassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full rounded-xl border border-(--app-border) bg-(--app-surface-2) px-4 py-3 pr-12 text-(--app-fg) outline-none transition-colors placeholder:text-(--app-muted) focus:border-(--app-accent)"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowDeletePassword((prev) => !prev)}
                                        className="absolute inset-y-0 right-3 flex items-center text-(--app-muted) hover:text-(--app-fg)"
                                        aria-label={showDeletePassword ? "Hide password" : "Show password"}
                                    >
                                        {showDeletePassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between text-sm">
                                <span className="text-(--app-muted)">Need help remembering it?</span>
                                <Link
                                    to="/forgot-password"
                                    onClick={() => setDelPopup(false)}
                                    className="font-medium text-(--app-fg) hover:underline"
                                >
                                    Forgot password?
                                </Link>
                            </div>
                        </div>

                        <div className="mt-8 flex gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setDelPopup(false)
                                    setPassword("")
                                }}
                                className="flex-1 rounded-xl border border-(--app-border) bg-(--app-surface-2) px-4 py-3 font-medium text-(--app-fg) transition-all hover:border-(--app-accent) hover:bg-(--app-accent) hover:text-(--app-accent-fg) active:scale-[0.98]"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="flex-1 rounded-xl bg-red-500 px-4 py-3 font-semibold text-white transition-all hover:bg-red-600 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
                            >
                                {isDeleting ? "Deleting..." : "Delete account"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default Navbar