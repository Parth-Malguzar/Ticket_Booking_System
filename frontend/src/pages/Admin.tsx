import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../lib/axios.ts";
import toast from "react-hot-toast";
import axios from "axios";

type VendorRequest = {
    id: string;
    name: string;
    email: string;
    role: "vendor";
    vendorStatus: "pending";
    createdAt?: string;
};


const Admin = () => {
    const [requests, setRequests] = useState<VendorRequest[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [approvingId, setApprovingId] = useState<string | null>(null)
    const [rejectingId, setRejectingId] = useState<string | null>(null)
    const [searchParams] = useSearchParams()

    const activeTab = searchParams.get("tab") || "dashboard"

    const loadRequests = async () => {
        setIsLoading(true)
        try {
            const res = await api.get("/auth/vendor-requests")
            setRequests(res.data.requests || [])
        } catch (error) {
            if (axios.isAxiosError(error)) {
                toast.error(error.response?.data?.message || "Failed to load vendor requests")
            }
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        const timer = window.setTimeout(() => {
            void loadRequests()
        }, 0)

        return () => window.clearTimeout(timer)
    }, [])

    const handleApprove = async (id: string) => {
        setApprovingId(id)
        try {
            const res = await api.patch(`/auth/vendor-requests/${id}/approve`)
            toast.success(res.data.message || "Vendor approved")
            await loadRequests()
        } catch (error) {
            if (axios.isAxiosError(error)) {
                toast.error(error.response?.data?.message || "Failed to approve vendor")
            }
        } finally {
            setApprovingId(null)
        }
    }

    const handleReject = async (id: string) => {
        setRejectingId(id)
        try {
            const res = await api.patch(`/auth/vendor-requests/${id}/reject`)
            toast.success(res.data.message || "Vendor rejected")
            await loadRequests()
        } catch (error) {
            if (axios.isAxiosError(error)) {
                toast.error(error.response?.data?.message || "Failed to reject vendor")
            }
        } finally {
            setRejectingId(null)
        }
    }

    const renderContent = () => {
        if (activeTab === "vendor") {
            return (
                <div className="rounded-2xl border border-(--app-border) bg-(--app-surface-2) p-4 sm:p-6">
                    {isLoading ? (
                        <p className="text-sm text-(--app-muted)">Loading pending requests...</p>
                    ) : requests.length === 0 ? (
                        <p className="text-sm text-(--app-muted)">No pending vendor requests right now.</p>
                    ) : (
                        <div className="space-y-3">
                            {requests.map((request) => (
                                <div key={request.id} className="flex flex-col gap-4 rounded-2xl border border-(--app-border) bg-(--app-surface) p-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="space-y-1">
                                        <p className="text-xs uppercase tracking-[0.25em] text-(--app-muted)">Vendor request</p>
                                        <p className="text-base font-semibold text-(--app-fg)">{request.name}</p>
                                        <p className="text-sm text-(--app-muted)">{request.email}</p>
                                        <span className="inline-flex rounded-full bg-amber-500/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.22em] text-amber-300">
                                            Pending review
                                        </span>
                                    </div>

                                    <div className="flex flex-wrap gap-3">
                                        <button
                                            type="button"
                                            onClick={() => handleApprove(request.id)}
                                            disabled={approvingId === request.id}
                                            className="rounded-xl bg-(--app-accent) px-4 py-2 text-sm font-semibold text-(--app-accent-fg) transition-all hover:bg-(--app-accent-hover) active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
                                        >
                                            {approvingId === request.id ? "Approving..." : "Approve vendor"}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleReject(request.id)}
                                            disabled={rejectingId === request.id}
                                            className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-300 transition-all hover:bg-red-500/20 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
                                        >
                                            {rejectingId === request.id ? "Rejecting..." : "Reject vendor"}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )
        }

        if (activeTab === "user") {
            return (
                <div className="rounded-2xl border border-(--app-border) bg-(--app-surface-2) p-6">
                    <h2 className="text-lg font-semibold">User management</h2>
                    <p className="mt-2 text-sm text-(--app-muted)">Review user accounts, roles, and access from this section.</p>
                </div>
            )
        }

        if (activeTab === "movies" || activeTab === "train" || activeTab === "concert") {
            return (
                <div className="rounded-2xl border border-(--app-border) bg-(--app-surface-2) p-6">
                    <h2 className="text-lg font-semibold capitalize">{activeTab} management</h2>
                    <p className="mt-2 text-sm text-(--app-muted)">Add, edit, or moderate {activeTab} entries from here.</p>
                </div>
            )
        }

        return (
            <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-(--app-border) bg-(--app-surface-2) p-4">
                    <p className="text-xs uppercase tracking-[0.25em] text-(--app-muted)">Pending vendors</p>
                    <p className="mt-2 text-3xl font-semibold text-(--app-fg)">{requests.length}</p>
                    <p className="mt-1 text-sm text-(--app-muted)">Requests awaiting review</p>
                </div>
                <div className="rounded-2xl border border-(--app-border) bg-(--app-surface-2) p-4">
                    <p className="text-xs uppercase tracking-[0.25em] text-(--app-muted)">User management</p>
                    <p className="mt-2 text-3xl font-semibold text-(--app-fg)">Active</p>
                    <p className="mt-1 text-sm text-(--app-muted)">Accounts and roles</p>
                </div>
                <div className="rounded-2xl border border-(--app-border) bg-(--app-surface-2) p-4">
                    <p className="text-xs uppercase tracking-[0.25em] text-(--app-muted)">Catalog sections</p>
                    <p className="mt-2 text-3xl font-semibold text-(--app-fg)">3</p>
                    <p className="mt-1 text-sm text-(--app-muted)">Movies, train, concert</p>
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
