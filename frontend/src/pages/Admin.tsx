import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import axios from "axios"
import toast from "react-hot-toast"
import api from "../lib/axios.ts"
import type { User, CatalogItem } from "../types"

type VendorRequest = Pick<User, "id" | "name" | "email" | "role" | "vendorStatus" | "createdAt">
//pick is used to create a type from already existing type

const Admin = () => {
    const [users, setUsers] = useState<User[]>([])
    const [vendors, setVendors] = useState<User[]>([])
    const [requests, setRequests] = useState<VendorRequest[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [approvingId, setApprovingId] = useState<string | null>(null)
    const [rejectingId, setRejectingId] = useState<string | null>(null)
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [movies, setMovies] = useState<CatalogItem[]>([])
    const [concerts, setConcerts] = useState<CatalogItem[]>([])
    const [trains, setTrains] = useState<CatalogItem[]>([])
    const [deletingItemId, setDeletingItemId] = useState<string | null>(null)
    const [rejectingItemId, setRejectingItemId] = useState<string | null>(null)

    const [searchParams] = useSearchParams()//we can also set query params with this but for now using just search (location gives more info but for now they are doing same work)

    const activeTab = searchParams.get("tab") || "dashboard"

    const formatDate = (value?: string) => {
        if (!value) return "Recently added"

        return new Intl.DateTimeFormat("en", {
            month: "short",
            day: "numeric",
            year: "numeric",
        }).format(new Date(value))
    }

    const loadAdminData = async () => {
        try {
            const [usersRes, vendorsRes, requestsRes, moviesRes, concertsRes, trainsRes] = await Promise.all([
                api.get("/users", { params: { role: "user" } }),
                api.get("/users", { params: { role: "vendor" } }),
                api.get("/vendors"),
                api.get("/catalog/movies"),
                api.get("/catalog/concert"),
                api.get("/catalog/train"),
            ])

            setUsers(usersRes.data.users || [])
            setVendors(vendorsRes.data.users || [])
            setRequests(requestsRes.data.requests || [])
            setMovies(moviesRes.data.items || [])
            setConcerts(concertsRes.data.items || [])
            setTrains(trainsRes.data.items || [])
        } catch (error) {
            if (axios.isAxiosError(error)) {
                toast.error(error.response?.data?.message || "Failed to load admin data")
            } else {
                toast.error("Failed to load admin data")
            }
        } finally {
            setIsLoading(false)
        }
    }

    const handleRemoveCatalogItem = async (id: string) => {
        setDeletingItemId(id)
        try {
            const res = await api.delete(`/catalog/${id}`)
            toast.success(res.data.message || "Listing removed successfully")
            await loadAdminData()
        } catch (error) {
            if (axios.isAxiosError(error)) {
                toast.error(error.response?.data?.message || "Failed to remove listing")
            } else {
                toast.error("Failed to remove listing")
            }
        } finally {
            setDeletingItemId(null)
        }
    }

    const handleRejectCatalogItem = async (id: string) => {
        setRejectingItemId(id)
        try {
            const res = await api.patch(`/catalog/${id}/reject-removal`)
            toast.success(res.data.message || "Removal request rejected")
            await loadAdminData()
        } catch (error) {
            if (axios.isAxiosError(error)) {
                toast.error(error.response?.data?.message || "Failed to reject removal request")
            } else {
                toast.error("Failed to reject removal request")
            }
        } finally {
            setRejectingItemId(null)
        }
    }

    useEffect(() => {
        const timer = window.setTimeout(() => {
            void loadAdminData()
        }, 0)

        return () => window.clearTimeout(timer)
    }, [])

    const handleApprove = async (id: string) => {
        setApprovingId(id)

        try {
            const res = await api.patch(`/vendors/${id}/approve`)
            toast.success(res.data.message || "Vendor approved")
            await loadAdminData()
        } catch (error) {
            if (axios.isAxiosError(error)) {
                toast.error(error.response?.data?.message || "Failed to approve vendor")
            } else {
                toast.error("Failed to approve vendor")
            }
        } finally {
            setApprovingId(null)
        }
    }

    const handleReject = async (id: string) => {
        setRejectingId(id)

        try {
            const res = await api.patch(`/vendors/${id}/reject`)
            toast.success(res.data.message || "Vendor rejected")
            await loadAdminData()
        } catch (error) {
            if (axios.isAxiosError(error)) {
                toast.error(error.response?.data?.message || "Failed to reject vendor")
            } else {
                toast.error("Failed to reject vendor")
            }
        } finally {
            setRejectingId(null)
        }
    }

    const handleDeleteAccount = async (id: string, kind: string) => {
        setDeletingId(id)

        try {
            const res = await api.delete(`/users/${id}`)
            toast.success(res.data.message || `${kind} deleted`)
            await loadAdminData()
        } catch (error) {
            if (axios.isAxiosError(error)) {
                toast.error(error.response?.data?.message || `Failed to delete ${kind}`)
            } else {
                toast.error(`Failed to delete ${kind}`)
            }
        } finally {
            setDeletingId(null)
        }
    }

    const renderPendingRequests = () => {
        if (requests.length === 0) {
            return <p className="text-sm text-(--app-muted)">No pending vendor requests right now.</p>
        }

        return (
            <div className="space-y-3">
                {requests.map((request) => (
                    <div key={request.id} className="flex flex-col gap-4 rounded-2xl border border-(--app-border) bg-(--app-surface) p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-1">
                            <p className="text-base font-semibold text-(--app-fg)">{request.name}</p>
                            <p className="text-sm text-(--app-muted)">{request.email}</p>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <button
                                type="button"
                                onClick={() => handleApprove(request.id)}
                                disabled={approvingId === request.id}
                                className="rounded-xl bg-(--app-accent) px-4 py-2 text-sm font-semibold text-(--app-accent-fg) transition-all hover:bg-(--app-accent-hover) disabled:cursor-not-allowed disabled:opacity-70"
                            >
                                {approvingId === request.id ? "Approving..." : "Approve vendor"}
                            </button>
                            <button
                                type="button"
                                onClick={() => handleReject(request.id)}
                                disabled={rejectingId === request.id}
                                className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-300 transition-all hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-70"
                            >
                                {rejectingId === request.id ? "Rejecting..." : "Reject vendor"}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    const renderActiveVendors = () => {
        const activeVendors = vendors.filter(vendor => vendor.vendorStatus === "approved")
        if (activeVendors.length === 0) {
            return <p className="text-sm text-(--app-muted)">No active vendor accounts found.</p>
        }
        return (
            <div className="space-y-3">
                {activeVendors.map((vendor) => (
                    <div key={vendor.id} className="flex flex-col gap-4 rounded-2xl border border-(--app-border) bg-(--app-surface) p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-1">
                            <p className="text-base font-semibold text-(--app-fg)">{vendor.name}</p>
                            <p className="text-sm text-(--app-muted)">{vendor.email}</p>
                            <div className="flex flex-wrap gap-2 pt-1 text-xs text-(--app-muted)">
                                <span className="rounded-full border border-(--app-border) px-3 py-1 capitalize">{vendor.vendorStatus || "none"}</span>
                                <span className="rounded-full border border-(--app-border) px-3 py-1">Joined {formatDate(vendor.createdAt)}</span>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <span className="inline-flex rounded-full border border-(--app-border) px-3 py-1 text-xs font-medium uppercase tracking-[0.22em] text-emerald-400 bg-emerald-500/10">
                                Active vendor
                            </span>
                            <button
                                type="button"
                                onClick={() => handleDeleteAccount(vendor.id, "vendor")}
                                disabled={deletingId === vendor.id}
                                className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-300 transition-all hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-70"
                            >
                                {deletingId === vendor.id ? "Deleting..." : "Remove vendor"}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    const renderRejectedVendors = () => {
        const rejectedVendors = vendors.filter(vendor => vendor.vendorStatus === "rejected")
        if (rejectedVendors.length === 0) {
            return <p className="text-sm text-(--app-muted)">No rejected vendor accounts found.</p>
        }
        return (
            <div className="space-y-3">
                {rejectedVendors.map((vendor) => (
                    <div key={vendor.id} className="flex flex-col gap-4 rounded-2xl border border-(--app-border) bg-(--app-surface) p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-1">
                            <p className="text-base font-semibold text-(--app-fg)">{vendor.name}</p>
                            <p className="text-sm text-(--app-muted)">{vendor.email}</p>
                            <div className="flex flex-wrap gap-2 pt-1 text-xs text-(--app-muted)">
                                <span className="rounded-full border border-(--app-border) px-3 py-1 capitalize">{vendor.vendorStatus || "none"}</span>
                                <span className="rounded-full border border-(--app-border) px-3 py-1">Joined {formatDate(vendor.createdAt)}</span>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <span className="inline-flex rounded-full border border-(--app-border) px-3 py-1 text-xs font-medium uppercase tracking-[0.22em] text-red-400 bg-red-500/10">
                                Rejected vendor
                            </span>
                            <button
                                type="button"
                                onClick={() => handleApprove(vendor.id)}
                                disabled={approvingId === vendor.id}
                                className="rounded-xl bg-(--app-accent) px-4 py-2 text-sm font-semibold text-(--app-accent-fg) transition-all hover:bg-(--app-accent-hover) disabled:cursor-not-allowed disabled:opacity-70"
                            >
                                {approvingId === vendor.id ? "Approving..." : "Approve vendor"}
                            </button>
                            <button
                                type="button"
                                onClick={() => handleDeleteAccount(vendor.id, "vendor")}
                                disabled={deletingId === vendor.id}
                                className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-300 transition-all hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-70"
                            >
                                {deletingId === vendor.id ? "Deleting..." : "Remove vendor"}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    const renderUserList = () => {
        if (users.length === 0) {
            return <p className="text-sm text-(--app-muted)">No customer users found.</p>
        }

        return (
            <div className="space-y-3">
                {users.map((user) => (
                    <div key={user.id} className="flex flex-col gap-4 rounded-2xl border border-(--app-border) bg-(--app-surface) p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-1">
                            <p className="text-xs uppercase tracking-[0.25em] text-(--app-muted)">User</p>
                            <p className="text-base font-semibold text-(--app-fg)">{user.name}</p>
                            <p className="text-sm text-(--app-muted)">{user.email}</p>
                            <div className="flex flex-wrap gap-2 pt-1 text-xs text-(--app-muted)">
                                <span className="rounded-full border border-(--app-border) px-3 py-1">{user.verified ? "Verified" : "Pending verification"}</span>
                                <span className="rounded-full border border-(--app-border) px-3 py-1">Joined {formatDate(user.createdAt)}</span>
                                <span className="rounded-full border border-(--app-border) px-3 py-1">Balance ${user.balance}</span>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => handleDeleteAccount(user.id, "user")}
                            disabled={deletingId === user.id}
                            className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-300 transition-all hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            {deletingId === user.id ? "Deleting..." : "Remove user"}
                        </button>
                    </div>
                ))}
            </div>
        )
    }

    const renderContent = () => {
        if (activeTab === "vendor") {
            return (
                <div className="space-y-6 rounded-2xl border border-(--app-border) bg-(--app-surface-2) p-4 sm:p-6">
                    {isLoading ? (
                        <p className="text-sm text-(--app-muted)">Loading vendor data...</p>
                    ) : (
                        <>
                            <div>
                                <h2 className="text-lg font-semibold">Pending vendor requests</h2>
                                <div className="mt-4">{renderPendingRequests()}</div>
                            </div>

                            <div>
                                <h2 className="text-lg font-semibold">Active Vendors</h2>
                                <div className="mt-4">{renderActiveVendors()}</div>
                            </div>

                            <div>
                                <h2 className="text-lg font-semibold">Rejected Vendors</h2>
                                <div className="mt-4">{renderRejectedVendors()}</div>
                            </div>
                        </>
                    )}
                </div>
            )
        }

        if (activeTab === "user") {
            return (
                <div className="space-y-6 rounded-2xl border border-(--app-border) bg-(--app-surface-2) p-4 sm:p-6">
                    {isLoading ? (
                        <p className="text-sm text-(--app-muted)">Loading user data...</p>
                    ) : (
                        <>
                            <div>
                                <h2 className="text-lg font-semibold">User accounts</h2>
                                <p className="mt-2 text-sm text-(--app-muted)">Review user accounts and remove any account that should no longer stay active.</p>
                                <div className="mt-4">{renderUserList()}</div>
                            </div>
                        </>
                    )}
                </div>
            )
        }

        if (activeTab === "movies" || activeTab === "train" || activeTab === "concert") {
            const currentItems = {//shortcut to write currentItems instead of ifelse
                movies: movies,
                concert: concerts,
                train: trains,
            }[activeTab] || []

            return (
                <div className="space-y-6 rounded-2xl border border-(--app-border) bg-(--app-surface-2) p-4 sm:p-6">
                    <div>
                        <h2 className="text-lg font-semibold capitalize">{activeTab} Listings</h2>
                        <p className="mt-2 text-sm text-(--app-muted)">Moderate and remove {activeTab} listings.</p>
                    </div>

                    {isLoading ? (
                        <p className="text-sm text-(--app-muted)">Loading listings...</p>
                    ) : currentItems.length === 0 ? (
                        <p className="text-sm text-(--app-muted)">No listings found in this category.</p>
                    ) : (
                        <div className="mt-6 space-y-4">
                            {currentItems.map((item) => (
                                //iterate over current items like movies,etc
                                //unique key for react
                                <article key={item.id} className="overflow-hidden rounded-2xl border border-(--app-border) bg-(--app-surface)">
                                    <div className="flex gap-4 p-4">
                                        <img src={item.image} alt={item.title} className="h-24 w-24 rounded-2xl object-cover" />
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="truncate text-base font-semibold">{item.title}</h3>
                                                        {item.requestRemoval && (
                                                            <span className="rounded-full bg-red-500/20 border border-red-500/30 px-2 py-0.5 text-[10px] font-semibold text-red-300 animate-pulse">
                                                                Req Removal
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="mt-1 text-sm text-(--app-muted)">{item.venue}</p>
                                                </div>
                                                <div className="flex gap-2">
                                                    {item.requestRemoval && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRejectCatalogItem(item.id)}
                                                            disabled={rejectingItemId === item.id || deletingItemId === item.id}
                                                            className="rounded-full border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs font-semibold text-zinc-300 transition-all hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-70"
                                                        >
                                                            {rejectingItemId === item.id ? "Rejecting..." : "Reject"}
                                                        </button>
                                                    )}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveCatalogItem(item.id)}
                                                        disabled={deletingItemId === item.id || rejectingItemId === item.id}
                                                        className="rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-300 transition-all hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-70"
                                                    >
                                                        {deletingItemId === item.id ? "Removing..." : "Remove"}
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="mt-3 flex flex-wrap gap-2 text-xs text-(--app-muted)">
                                                <span className="rounded-full border border-(--app-border) px-2.5 py-1">${item.price}</span>
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </div>
            )
        }

        return (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-2xl border border-(--app-border) bg-(--app-surface-2) p-4">
                    <p className="text-xs uppercase tracking-[0.25em] text-(--app-muted)">Users</p>
                    <p className="mt-2 text-3xl font-semibold text-(--app-fg)">{users.length}</p>
                    <p className="mt-1 text-sm text-(--app-muted)">Registered customer accounts</p>
                </div>
                <div className="rounded-2xl border border-(--app-border) bg-(--app-surface-2) p-4">
                    <p className="text-xs uppercase tracking-[0.25em] text-(--app-muted)">Vendors & Requests</p>
                    <p className="mt-2 text-3xl font-semibold text-(--app-fg)">{vendors.length} / {requests.length}</p>
                    <p className="mt-1 text-sm text-(--app-muted)">Active: {vendors.length} | Pending: {requests.length}</p>
                </div>
                <div className="rounded-2xl border border-(--app-border) bg-(--app-surface-2) p-4">
                    <p className="text-xs uppercase tracking-[0.25em] text-(--app-muted)">Movie Events</p>
                    <p className="mt-2 text-3xl font-semibold text-(--app-fg)">{movies.length}</p>
                    <p className="mt-1 text-sm text-(--app-muted)">Published movie listings</p>
                </div>
                <div className="rounded-2xl border border-(--app-border) bg-(--app-surface-2) p-4">
                    <p className="text-xs uppercase tracking-[0.25em] text-(--app-muted)">Concert Events</p>
                    <p className="mt-2 text-3xl font-semibold text-(--app-fg)">{concerts.length}</p>
                    <p className="mt-1 text-sm text-(--app-muted)">Published concert listings</p>
                </div>
                <div className="rounded-2xl border border-(--app-border) bg-(--app-surface-2) p-4">
                    <p className="text-xs uppercase tracking-[0.25em] text-(--app-muted)">Train Journeys</p>
                    <p className="mt-2 text-3xl font-semibold text-(--app-fg)">{trains.length}</p>
                    <p className="mt-1 text-sm text-(--app-muted)">Published train journeys</p>
                </div>
                <div className="rounded-2xl border border-(--app-border) bg-(--app-surface-2) p-4">
                    <p className="text-xs uppercase tracking-[0.25em] text-(--app-muted)">Total</p>
                    <p className="mt-2 text-3xl font-semibold text-(--app-fg)">{trains.length+movies.length+concerts.length}</p>
                    <p className="mt-1 text-sm text-(--app-muted)">Total Events & Journeys</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-[calc(100vh-8rem)] bg-(--app-bg) px-4 py-10 text-(--app-fg)">
            <div className="mx-auto flex max-w-6xl flex-col gap-6 rounded-3xl border border-(--app-border) bg-(--app-surface) p-8 shadow-2xl shadow-black/30 sm:p-10">
                <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-(--app-muted)">Admin panel</p>
                    <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">
                        {activeTab === "dashboard" ? "Dashboard" : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                    </h1>
                    <p className="mt-2 max-w-2xl text-sm text-(--app-muted)">
                        Use the tabs below to move between users, vendors, and media sections.
                    </p>
                </div>
                {renderContent()}
            </div>
        </div>
    )
}

export default Admin