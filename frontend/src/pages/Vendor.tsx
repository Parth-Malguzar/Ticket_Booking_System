import { useCallback, useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import axios from "axios"
import toast from "react-hot-toast"
import api from "../lib/axios.ts"
import type { CatalogItem } from "../types"
import { useAuthStore } from "../stores/authStore.ts"

const initialForm = {
    title: "",
    image: "",
    venue: "",
    price: "",
    availableSeats: "100",
    details: "",
}

const categoryMeta = {
    movies: {
        title: "Movie Listings",
        description: "Create new movie entries and keep them visible in the Movies tab for users.",
    },
    train: {
        title: "Train Listings",
        description: "Publish train journeys with departure times, routes, and pricing.",
    },
    concert: {
        title: "Concert Listings",
        description: "Add concert events with venues, dates, and live-show details.",
    },
} as const

const Vendor = () => {
    const { user } = useAuthStore()
    const [searchParams] = useSearchParams()
    const activeTab = searchParams.get("tab") || "dashboard"
    const category = activeTab === "movies" || activeTab === "train" || activeTab === "concert" ? activeTab : null

    const [form, setForm] = useState(initialForm)
    const [items, setItems] = useState<CatalogItem[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [stats, setStats] = useState({ totalMovies: 0, totalConcerts: 0, totalTrains: 0, movieEarnings: 0, concertEarnings: 0, trainEarnings: 0 })

    useEffect(() => {
        if (activeTab === "dashboard") {
            const fetchStats = async () => {
                try {
                    const res = await api.get("/vendors/stats")

                    setStats({
                        totalMovies: res.data.totalMovies || 0,
                        totalConcerts: res.data.totalConcerts || 0,
                        totalTrains: res.data.totalTrains || 0,
                        movieEarnings: res.data.movieEarnings || 0,
                        concertEarnings: res.data.concertEarnings || 0,
                        trainEarnings: res.data.trainEarnings || 0,
                    })
                } catch (error) {
                    console.error("Failed to load vendor stats", error)
                }
            }
            void fetchStats()
        }
    }, [activeTab])

    const title = {
        dashboard: "Vendor Dashboard",
        movies: categoryMeta.movies.title,
        train: categoryMeta.train.title,
        concert: categoryMeta.concert.title,
    }[activeTab] ?? "Vendor Dashboard"

    const loadItems = useCallback(async () => {
        if (!category) {
            setItems([])
            return
        }

        setIsLoading(true)

        try {
            const res = await api.get("/catalog", {
                params: { category },
            })

            setItems(res.data.items || [])
        } catch (error) {
            console.log(error);

            if (axios.isAxiosError(error)) {
                toast.error(
                    error.response?.data?.message ||
                    "Failed to load listings"
                )
            } else {
                toast.error("Failed to load listings")
            }
        } finally {
            setIsLoading(false)
        }
    }, [category])

    useEffect(() => {
        void loadItems()
    }, [loadItems])

    const handleChange = (key: keyof typeof initialForm, value: string) => {
        setForm((current) => ({
            ...current,
            [key]: value,
        }))
    }

    const resetForm = () => {
        setForm(initialForm)
    }

    const handleSubmit = async (event: React.SyntheticEvent<HTMLFormElement>) => {
        event.preventDefault()

        if (!category) {
            toast.error("Choose Movies, Train, or Concert to add a listing")
            return
        }

        setIsSubmitting(true)

        try {
            const payload = {
                category,
                title: form.title.trim(),
                image: form.image.trim(),
                venue: form.venue.trim(),
                price: form.price.trim(),
                availableSeats: Number(form.availableSeats) || 0,
                details: form.details,
            }

            const res = await api.post("/catalog", payload)
            toast.success(res.data.message || "Listing created")
            setItems((prev) => [res.data.item, ...prev])
            resetForm()
        } catch (error) {
            if (axios.isAxiosError(error)) {
                toast.error(error.response?.data?.message || "Failed to create listing")
            } else {
                toast.error("Failed to create listing")
            }
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async (id: string) => {
        setDeletingId(id)

        try {
            const res = await api.patch(`/catalog/${id}/request-removal`)
            toast.success(res.data.message || "Removal requested")
            setItems((prev) =>
                prev.map((item) => item.id === id ? { ...item, requestRemoval: true } : item)
            )
        } catch (error) {
            if (axios.isAxiosError(error)) {
                toast.error(error.response?.data?.message || "Failed to request removal")
            } else {
                toast.error("Failed to request removal")
            }
        } finally {
            setDeletingId(null)
        }
    }
    const renderDashboard = () => {
        return (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl border border-(--app-border) bg-(--app-surface-2) p-4">
                    <p className="text-xs uppercase tracking-[0.25em] text-(--app-muted)">
                        Movies
                    </p>
                    <p className="mt-2 text-3xl font-semibold text-(--app-fg)">
                        {stats.totalMovies}
                    </p>
                    <p className="mt-1 text-sm text-(--app-muted)">
                        ₹{stats.movieEarnings}
                    </p>
                </div>

                <div className="rounded-2xl border border-(--app-border) bg-(--app-surface-2) p-4">
                    <p className="text-xs uppercase tracking-[0.25em] text-(--app-muted)">
                        Concerts
                    </p>
                    <p className="mt-2 text-3xl font-semibold text-(--app-fg)">
                        {stats.totalConcerts}
                    </p>
                    <p className="mt-1 text-sm text-(--app-muted)">
                        ₹{stats.concertEarnings}
                    </p>
                </div>

                <div className="rounded-2xl border border-(--app-border) bg-(--app-surface-2) p-4">
                    <p className="text-xs uppercase tracking-[0.25em] text-(--app-muted)">
                        Trains
                    </p>
                    <p className="mt-2 text-3xl font-semibold text-(--app-fg)">
                        {stats.totalTrains}
                    </p>
                    <p className="mt-1 text-sm text-(--app-muted)">
                        ₹{stats.trainEarnings}
                    </p>
                </div>

                <div className="rounded-2xl border border-(--app-border) bg-(--app-surface-2) p-4">
                    <p className="text-xs uppercase tracking-[0.25em] text-(--app-muted)">
                        Total Earnings
                    </p>
                    <p className="mt-2 text-3xl font-semibold text-(--app-fg)">
                        ₹{stats.trainEarnings + stats.movieEarnings + stats.concertEarnings}
                    </p>
                    <p className="mt-1 text-sm text-(--app-muted)">
                        Across all listings
                    </p>
                </div>
            </div>
        )
    }

    const renderCategoryManager = () => {
        if (!category) {
            return null
        }

        const meta = categoryMeta[category]

        return (
            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                <form onSubmit={handleSubmit} className="rounded-3xl border border-(--app-border) bg-(--app-surface-2) p-5 sm:p-6">
                    <p className="text-sm uppercase tracking-[0.3em] text-(--app-muted)">Create listing</p>
                    <h2 className="mt-3 text-2xl font-semibold">{meta.title}</h2>
                    <p className="mt-2 text-sm text-(--app-muted)">{meta.description}</p>

                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                        <label className="space-y-2">
                            <span className="text-sm text-(--app-muted)">Title</span>
                            <input
                                value={form.title}
                                onChange={(event) => handleChange("title", event.target.value)}
                                required
                                className="w-full rounded-2xl border border-(--app-border) bg-(--app-surface) px-4 py-3 text-sm outline-none focus:border-(--app-accent)"
                                placeholder="Midnight Premiere"
                            />
                        </label>

                        <label className="space-y-2">
                            <span className="text-sm text-(--app-muted)">Image URL</span>
                            <input
                                value={form.image}
                                onChange={(event) => handleChange("image", event.target.value)}
                                required
                                className="w-full rounded-2xl border border-(--app-border) bg-(--app-surface) px-4 py-3 text-sm outline-none focus:border-(--app-accent)"
                                placeholder="/cover-images/1.jpg"
                            />
                        </label>

                        <label className="space-y-2 sm:col-span-2">
                            <span className="text-sm text-(--app-muted)">Venue / Route</span>
                            <input
                                value={form.venue}
                                onChange={(event) => handleChange("venue", event.target.value)}
                                required
                                className="w-full rounded-2xl border border-(--app-border) bg-(--app-surface) px-4 py-3 text-sm outline-none focus:border-(--app-accent)"
                                placeholder={category === "train" ? "Delhi to Shimla" : "Arena One, Mumbai"}
                            />
                        </label>

                        <label className="space-y-2">
                            <span className="text-sm text-(--app-muted)">Price ($) </span>
                            <input
                                type="number"
                                min={0}
                                value={form.price}
                                onChange={(event) => handleChange("price", event.target.value)}
                                required
                                className="w-full rounded-2xl border border-(--app-border) bg-(--app-surface) px-4 py-3 text-sm outline-none focus:border-(--app-accent)"
                                placeholder="$12"
                            />
                        </label>

                        <label className="space-y-2">
                            <span className="text-sm text-(--app-muted)">Available Seats</span>
                            <input
                                type="number"
                                min={1}
                                value={form.availableSeats}
                                onChange={(event) => handleChange("availableSeats", event.target.value)}
                                required
                                className="w-full rounded-2xl border border-(--app-border) bg-(--app-surface) px-4 py-3 text-sm outline-none focus:border-(--app-accent)"
                                placeholder="100"
                            />
                        </label>

                        <label className="space-y-2 sm:col-span-2">
                            <span className="text-sm text-(--app-muted)">Details</span>
                            <textarea
                                value={form.details}
                                onChange={(event) => handleChange("details", event.target.value)}
                                className="min-h-28 w-full rounded-2xl border border-(--app-border) bg-(--app-surface) px-4 py-3 text-sm outline-none focus:border-(--app-accent)"
                                placeholder={category === "train" ? "AC 2-tier, 14h 10m, Breakfast included" : "Hindi, 2h 18m, Dolby Atmos"}
                            />
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="mt-6 rounded-full bg-(--app-accent) px-5 py-3 text-sm font-semibold text-(--app-accent-fg) transition-all hover:bg-(--app-accent-hover) disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        {isSubmitting ? "Publishing..." : `Publish ${category}`}
                    </button>
                </form>

                <div className="rounded-3xl border border-(--app-border) bg-(--app-surface-2) p-5 sm:p-6">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="text-sm uppercase tracking-[0.3em] text-(--app-muted)">Your listings</p>
                            <h2 className="mt-3 text-2xl font-semibold capitalize">{category}</h2>
                        </div>
                        <span className="rounded-full border border-(--app-border) px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-(--app-muted)">
                            {items.length} items
                        </span>
                    </div>

                    {isLoading ? (
                        <p className="mt-6 text-sm text-(--app-muted)">Loading listings...</p>
                    ) : items.length === 0 ? (
                        <p className="mt-6 text-sm text-(--app-muted)">No listings yet. Add the first one using the form.</p>
                    ) : (
                        <div className="mt-6 space-y-4">
                            {items.map((item) => (
                                <article key={item.id} className="overflow-hidden rounded-2xl border border-(--app-border) bg-(--app-surface)">
                                    <div className="flex gap-4 p-4">
                                        <img src={item.image} alt={item.title} className="h-24 w-24 rounded-2xl object-cover" />
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <h3 className="truncate text-base font-semibold">{item.title}</h3>
                                                    <p className="mt-1 text-sm text-(--app-muted)">{item.venue}</p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(item.id)}
                                                    disabled={deletingId === item.id || item.requestRemoval}
                                                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all disabled:cursor-not-allowed ${item.requestRemoval
                                                        ? "border border-zinc-700 bg-zinc-800 text-zinc-500 opacity-60"
                                                        : "border border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/20 disabled:opacity-70"
                                                        }`}
                                                >
                                                    {deletingId === item.id ? "Removing..." : item.requestRemoval ? "Requested" : "Req Remove"}
                                                </button>
                                            </div>

                                            <div className="mt-3 flex flex-wrap gap-2 text-xs text-(--app-muted)">
                                                <span className="rounded-full border border-(--app-border) px-2.5 py-1">${item.price}</span>
                                                {item.availableSeats !== undefined && (
                                                    <span className="rounded-full border border-(--app-border) px-2.5 py-1">Seats: {item.availableSeats}</span>
                                                    //it will show only initial seats for live update will do websockets
                                                )}

                                            </div>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        )
    }

    if (user && user.vendorStatus !== "approved") {
        return (
            <div className="min-h-[calc(100vh-8rem)] bg-(--app-bg) px-4 py-12 flex items-center justify-center text-(--app-fg)">
                <div className="w-full max-w-lg rounded-3xl border border-(--app-border) bg-(--app-surface) p-8 text-center shadow-2xl shadow-black/30 sm:p-10">
                    {user.vendorStatus === "rejected" ? (
                        <>
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-red-500/20 bg-red-500/10 text-red-500">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-8 w-8">
                                    <circle cx="12" cy="12" r="10" />
                                    <path d="m15 9-6 6M9 9l6 6" />
                                </svg>
                            </div>
                            <h1 className="mt-6 text-2xl font-bold tracking-tight">Vendor Application Rejected</h1>
                            <p className="mt-4 text-sm text-(--app-muted) leading-relaxed">
                                Unfortunately, your request to become a vendor has been rejected by our administrative team.
                            </p>
                            <p className="mt-2 text-sm text-(--app-muted)">
                                If you believe this was an error, please reach out to <a href="mailto:support@bookmyticket.com" className="font-medium text-(--app-fg) underline hover:text-(--app-accent)">support@bookmyticket.com</a>.
                            </p>
                            <div className="mt-8 border-t border-(--app-border) pt-6">
                                <p className="text-xs text-(--app-muted)">
                                    Want to start over? You can delete this account from the top-right profile dropdown to register again.
                                </p>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-amber-500/20 bg-amber-500/10 text-amber-500">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-8 w-8 animate-pulse">
                                    <circle cx="12" cy="12" r="10" />
                                    <path d="M12 6v6l4 2" />
                                </svg>
                            </div>
                            <h1 className="mt-6 text-2xl font-bold tracking-tight">Application Under Review</h1>
                            <p className="mt-4 text-sm text-(--app-muted) leading-relaxed">
                                Your vendor request has been submitted successfully and is currently pending review by our administrator team.
                            </p>
                            <p className="mt-2 text-sm text-(--app-muted)">
                                Once approved, your account will be granted full access to the vendor dashboard. Please check back later.
                            </p>
                        </>
                    )}
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-[calc(100vh-8rem)] bg-(--app-bg) px-4 py-10 text-(--app-fg)">
            <div className="mx-auto flex max-w-6xl flex-col gap-6 rounded-3xl border border-(--app-border) bg-(--app-surface) p-8 shadow-2xl shadow-black/30 sm:p-10">
                <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-(--app-muted)">Vendor panel</p>
                    <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">{title}</h1>
                    <p className="mt-2 max-w-2xl text-sm text-(--app-muted)">
                        Vendors can add and manage movie, train, and concert listings here.
                    </p>
                </div>

                {activeTab === "dashboard" ? renderDashboard() : renderCategoryManager()}
            </div>
        </div>
    )
}

export default Vendor