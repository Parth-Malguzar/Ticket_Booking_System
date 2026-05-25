import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../stores/authStore.ts";
import { useThemeStore } from "../stores/themeStore.ts";

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

const Navbar = () => {
    const { user, logout } = useAuthStore()
    const { theme, toggleTheme } = useThemeStore();
    const location = useLocation();
    const isLoginPage = location.pathname === "/login";
    const isSignupPage = location.pathname === "/signup";
    const isResetPage = location.pathname.startsWith("/reset-password")
    return (
        <nav className="border-b border-(--app-border) bg-(--app-surface) text-(--app-fg) shadow-[0_1px_0_rgba(255,255,255,0.04)]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center gap-3">
                        <img width={30} src="/favicon.svg" alt="" />
                        <Link to="/" className="text-2xl font-semibold tracking-tight text-(--app-fg)">
                            BookMyTicket
                        </Link>
                    </div>

                    <div className="flex items-center gap-3">
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

                                <span>{user.email}</span>

                                <Link onClick={logout}
                                    to="/login"
                                    className="rounded-full bg-(--app-accent) px-4 py-2 text-sm font-medium text-(--app-accent-fg) transition-all hover:bg-(--app-accent-hover) active:scale-[0.98]"
                                >
                                    Logout
                                </Link>

                            </div>
                        )}

                    </div>
                </div>
            </div>
        </nav>
    )
}

export default Navbar