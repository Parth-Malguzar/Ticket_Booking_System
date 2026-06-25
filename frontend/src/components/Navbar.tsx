import { Link, useLocation, useSearchParams } from "react-router-dom";
import { useAuthStore } from "../stores/authStore.ts";
//very imp zustand use
import { useThemeStore } from "../stores/themeStore.ts";
import { useEffect, useRef, useState } from "react";
import { Eye, EyeOff, Trash2, User, Camera, Upload } from "lucide-react";
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
            label: "Bookings",
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

const AVATAR_PRESETS = [
    "https://api.dicebear.com/7.x/adventurer/svg?seed=Felix",
    "https://api.dicebear.com/7.x/adventurer/svg?seed=Aneka",
    "https://api.dicebear.com/7.x/adventurer/svg?seed=Jack",
    "https://api.dicebear.com/7.x/adventurer/svg?seed=Buster",
    "https://api.dicebear.com/7.x/adventurer/svg?seed=Bella",
];

const Navbar = () => {

    const { user, logout, setUser } = useAuthStore()
    const { theme, toggleTheme } = useThemeStore();
    const location = useLocation();

    const [searchParams] = useSearchParams()
    //use location is very imp here it notices the change in url by link used to switch tabs without reloading and updates ui(for location u have to use new url search params to create an object search params is easier)
    const activeTab = searchParams.get("tab") ?? "dashboard"//object to read query params
    const isLoginPage = location.pathname === "/login";
    const isSignupPage = location.pathname === "/signup";
    const isResetPage = location.pathname.startsWith("/reset-password")
    const isVerifyEmailPage = location.pathname.startsWith("/verify-email/")

    const [open, setOpen] = useState(false)
    const [delPopup, setDelPopup] = useState(false)
    const [password, setPassword] = useState("")
    const [showDeletePassword, setShowDeletePassword] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    // Edit Profile Modal states
    const [editProfilePopup, setEditProfilePopup] = useState(false)
    const [editName, setEditName] = useState("")
    const [editProfilePic, setEditProfilePic] = useState("")
    const [editCurrentPassword, setEditCurrentPassword] = useState("")
    const [editNewPassword, setEditNewPassword] = useState("")
    const [showCurrentPassword, setShowCurrentPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)

    const dropdownRef = useRef<HTMLDivElement>(null)
    const delPopupRef = useRef<HTMLDivElement>(null)
    const editProfilePopupRef = useRef<HTMLFormElement>(null)
    useEffect(() => {
        setOpen(false);
        setDelPopup(false);
        setEditProfilePopup(false);
    }, [location])//don't use location.pathname because it doesn't check whole path

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
                editProfilePopup &&
                editProfilePopupRef.current &&
                !editProfilePopupRef.current.contains(e.target as Node)
            ) {
                setEditProfilePopup(false)
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

    const handleUpdateProfile = async (e: React.SyntheticEvent) => {
        e.preventDefault()
        setIsUpdatingProfile(true)
        const loadingId = toast.loading("Updating profile...")

        try {
            const res = await api.put("/users/profile", {
                name: editName,
                profilePic: editProfilePic,
                currentPassword: editCurrentPassword || undefined,
                newPassword: editNewPassword || undefined,
            })
            toast.success(res.data?.message || "Profile updated", { id: loadingId })
            setUser(res.data.user)
            setEditProfilePopup(false)
        } catch (error: any) {
            console.error("Profile update error:", error)
            const errMsg = error.response?.data?.message || "Failed to update profile"
            toast.error(errMsg, { id: loadingId })
        } finally {
            setIsUpdatingProfile(false)
        }
    }
    const handleProfilePicChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = e.target.files?.[0];

        if (!file) return;

        if (file.size > 500 * 1024) {
            toast.error("Image size must be less than 500KB");
            return;
        }

        const reader = new FileReader();

        reader.onloadend = () => {
            setEditProfilePic(reader.result as string);
        };

        reader.readAsDataURL(file);
    };
    const renderControls = () => (
        <>
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
                            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-(--app-border) bg-(--app-surface-2) text-(--app-fg) transition-all hover:border-(--app-accent) hover:bg-(--app-accent) hover:text-(--app-accent-fg) active:scale-[0.98] overflow-hidden"
                            aria-label="Open account menu"
                        >
                            {user.profilePic ? (
                                <img src={user.profilePic} alt="Profile" className="h-full w-full object-cover" />
                            ) : (
                                <User size={18} />
                            )}
                        </button>
                        {open && (
                            <div className="absolute right-0 top-12 w-fit overflow-hidden rounded-2xl border border-(--app-border) bg-(--app-surface) p-2 shadow-2xl shadow-black/30 z-50">
                                <div className="px-3 pb-2 pt-1 text-xs tracking-[0.25em] text-(--app-muted)">
                                    <p className="text-xs uppercase tracking-[0.25em] text-(--app-muted)">
                                        Account
                                    </p>

                                    <p className="mt-1 text-sm font-semibold text-(--app-fg)">
                                        {user.name}
                                    </p>
                                    <p className="text-xs text-(--app-muted) mt-0.5">
                                        {user.email}
                                    </p>
                                </div>
                                <button
                                    onClick={() => {
                                        setOpen(false)
                                        setEditName(user.name)
                                        setEditProfilePic(user.profilePic || "")
                                        setEditCurrentPassword("")
                                        setEditNewPassword("")
                                        setEditProfilePopup(true)
                                    }}
                                    className="w-full rounded-xl px-3 py-2 text-left text-sm text-(--app-fg) transition-colors hover:bg-(--app-surface-2)"
                                >
                                    Edit Profile
                                </button>
                                {user.role !== "admin" && user.role !== "vendor" && (
                                    <button className="w-full rounded-xl px-3 py-2 text-left text-sm text-(--app-fg) transition-colors hover:bg-(--app-surface-2)">
                                        Balance : ${user.balance}
                                    </button>
                                )}


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

                                <button onClick={() => { setOpen(false); setDelPopup(true); }} className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm text-red-500 transition-colors hover:bg-red-500/10 hover:text-red-400">
                                    <span>Delete Account</span>
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    )

    return (
        <>
            <nav className="border-b border-(--app-border) bg-(--app-surface) text-(--app-fg) shadow-[0_1px_0_rgba(255,255,255,0.04)] sticky top-0 z-40 backdrop-blur-md bg-opacity-95">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between py-3 md:h-16 gap-3">
                        {/* Top row / Left on desktop */}
                        <div className="flex items-center justify-between w-full md:w-auto">
                            <div className="flex items-center gap-3">
                                <img width={30} src="/favicon.svg" alt="" />
                                <Link to="/" className="text-2xl font-semibold tracking-tight text-(--app-fg)">
                                    BookMyTicket
                                </Link>
                            </div>

                            {/* Mobile controls */}
                            <div className="flex items-center gap-3 md:hidden">
                                {renderControls()}
                            </div>
                        </div>

                        {/* Navigation Links */}
                        {user && (user.role !== "vendor" || user.vendorStatus === "approved") && (
                            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 md:py-0 justify-start md:justify-center">
                                {roleNavItems[
                                    user.role as keyof typeof roleNavItems
                                ].map((item) => {
                                    const isActive = activeTab === item.tab
                                    return (
                                        <Link
                                            key={item.to}
                                            to={item.to}
                                            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all active:scale-[0.98] ${isActive
                                                ? "bg-(--app-accent) text-(--app-accent-fg)"
                                                : "text-(--app-muted) hover:bg-(--app-surface-2) hover:text-(--app-fg)"
                                                }`}
                                        >
                                            {item.label}
                                        </Link>
                                    )
                                })}
                            </div>
                        )}

                        {/* Desktop controls */}
                        <div className="hidden md:flex items-center gap-4">
                            {renderControls()}
                        </div>
                    </div>
                </div>
            </nav>

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

            {editProfilePopup && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
                    <form
                        onSubmit={handleUpdateProfile}
                        ref={editProfilePopupRef}
                        className="w-full max-w-md rounded-3xl border border-(--app-border) bg-(--app-surface) p-8 shadow-2xl shadow-black/40 text-(--app-fg) space-y-5"
                    >
                        <div className="text-center">
                            <p className="text-sm uppercase tracking-[0.3em] text-(--app-muted)">Settings</p>
                            <h2 className="mt-2 text-3xl font-semibold">Edit Profile</h2>
                        </div>

                        {/* Profile Picture Preview & Selectors */}
                        <div className="flex flex-col items-center gap-5">
                            <div className="flex flex-col items-center gap-3">
                                <label
                                    htmlFor="profile-pic-upload"
                                    className="group relative h-24 w-24 cursor-pointer overflow-hidden rounded-full border-2 border-(--app-accent) bg-(--app-surface-2) shadow-lg transition-all hover:scale-105 active:scale-95 flex items-center justify-center"
                                >
                                    {editProfilePic ? (
                                        <img src={editProfilePic} alt="Preview" className="h-full w-full object-cover transition-all group-hover:scale-110 group-hover:brightness-75" />
                                    ) : (
                                        <User size={40} className="text-(--app-muted) transition-all group-hover:scale-110" />
                                    )}
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                                        <Camera size={20} className="text-white" />
                                        <span className="text-[10px] font-bold text-white uppercase tracking-wider mt-1">Upload</span>
                                    </div>
                                </label>

                                <input
                                    type="file"
                                    id="profile-pic-upload"
                                    accept="image/*"
                                    onChange={handleProfilePicChange}
                                    className="hidden"
                                />

                                <label
                                    htmlFor="profile-pic-upload"
                                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-(--app-border) bg-(--app-surface-2) px-3 py-1.5 text-xs font-medium text-(--app-fg) transition-all hover:border-(--app-accent) hover:bg-(--app-accent) hover:text-(--app-accent-fg) active:scale-[0.98]"
                                >
                                    <Upload size={13} />
                                    <span>Upload from Device</span>
                                </label>
                            </div>

                            <div className="flex flex-col items-center gap-2 w-full">
                                <span className="text-xs font-semibold text-(--app-muted) uppercase tracking-wide">
                                    Or choose a preset avatar
                                </span>
                                <div className="flex gap-2 justify-center">
                                    {AVATAR_PRESETS.map((preset) => (
                                        <button
                                            key={preset}
                                            type="button"
                                            onClick={() => setEditProfilePic(preset)}
                                            className={`h-10 w-10 overflow-hidden rounded-full border-2 transition-all hover:scale-105 active:scale-95 ${editProfilePic === preset ? "border-(--app-accent)" : "border-transparent"
                                                }`}
                                        >
                                            <img src={preset} alt="avatar option" className="h-full w-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Name Input */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-(--app-fg) uppercase tracking-wide">
                                Name
                            </label>
                            <input
                                type="text"
                                required
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                placeholder="Your Name"
                                className="w-full rounded-xl border border-(--app-border) bg-(--app-surface-2) px-4 py-2.5 text-(--app-fg) outline-none transition-colors focus:border-(--app-accent)"
                            />
                        </div>

                        {/* Password change fields (optional) */}
                        <div className="border-t border-(--app-border)/60 pt-4 space-y-3">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-(--app-muted)">
                                Change Password (Optional)
                            </h3>

                            {/* Current Password */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-(--app-fg)">
                                    Current Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showCurrentPassword ? "text" : "password"}
                                        value={editCurrentPassword}
                                        onChange={(e) => setEditCurrentPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full rounded-xl border border-(--app-border) bg-(--app-surface-2) px-4 py-2.5 pr-12 text-(--app-fg) outline-none transition-colors focus:border-(--app-accent)"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowCurrentPassword((prev) => !prev)}
                                        className="absolute inset-y-0 right-3 flex items-center text-(--app-muted) hover:text-(--app-fg)"
                                    >
                                        {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>

                            {/* New Password */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-(--app-fg)">
                                    New Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showNewPassword ? "text" : "password"}
                                        value={editNewPassword}
                                        onChange={(e) => setEditNewPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full rounded-xl border border-(--app-border) bg-(--app-surface-2) px-4 py-2.5 pr-12 text-(--app-fg) outline-none transition-colors focus:border-(--app-accent)"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword((prev) => !prev)}
                                        className="absolute inset-y-0 right-3 flex items-center text-(--app-muted) hover:text-(--app-fg)"
                                    >
                                        {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setEditProfilePopup(false)}
                                className="flex-1 rounded-xl border border-(--app-border) bg-(--app-surface-2) px-4 py-3 font-medium text-(--app-fg) transition-all hover:border-(--app-accent) hover:bg-(--app-accent) hover:text-(--app-accent-fg) active:scale-[0.98]"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={isUpdatingProfile}
                                className="flex-1 rounded-xl bg-(--app-accent) px-4 py-3 font-semibold text-(--app-accent-fg) transition-all hover:bg-(--app-accent-hover) active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
                            >
                                {isUpdatingProfile ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </>
    )
}

export default Navbar