import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import api from "@/lib/axios"
import axios from "axios"
import toast from "react-hot-toast"
import type { CatalogItem } from "../types"

const initialForm = {
    date: "",
    time: "",
    seats: 1,
}

const BookingPage = () => {
    const { id } = useParams()
    const navigate = useNavigate()

    const [item, setItem] = useState<CatalogItem | null>(null)
    const [form, setForm] = useState(initialForm)
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        const fetchItem = async () => {
            try {
                const res = await api.get(`/catalog/${id}`)
                setItem(res.data.item)
            } catch (error) {
                console.error(error)
                toast.error("Failed to load catalog details")
            }
        }

        void fetchItem()
    }, [id])

    const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            await api.post("/bookings", {
                itemId: item?.id,
                date: form.date,
                time: form.time,
                seats: form.seats,
            })
            toast.success("Ticket booked successfully!")
            navigate("/user")
        } catch (error) {
            if (axios.isAxiosError(error)) {
                toast.error(error.response?.data?.message || "Failed to book ticket")
            } else {
                toast.error("Failed to book ticket")
            }
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleChange = (
        key: keyof typeof initialForm,
        value: string | number
    ) => {
        setForm((current) => ({
            ...current,
            [key]: value,
        }))
    }

    if (!item) {
        return (
            <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center bg-(--app-bg) text-(--app-fg)">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-(--app-border) border-t-(--app-accent)" />
                    <p className="text-sm font-semibold tracking-wide text-(--app-muted)">Loading event details...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center bg-(--app-bg) px-4 py-10 text-(--app-fg)">
            <div className="w-full max-w-4xl">
                <form
                    onSubmit={handleSubmit}
                    className="overflow-hidden rounded-3xl border border-(--app-border) bg-(--app-surface) p-6 shadow-2xl shadow-black/30 sm:p-8"
                >
                    <h2 className="mb-6 text-2xl font-bold tracking-tight text-(--app-fg) sm:text-3xl">
                        Book Ticket
                    </h2>

                    <div className="grid gap-8 md:grid-cols-2">
                        {/* Left Column: Event details & Image */}
                        <div className="flex flex-col gap-6 sm:flex-row md:flex-col lg:flex-row items-start lg:items-center">
                            <img
                                src={item.image}
                                alt={item.title}
                                className="w-full sm:w-48 md:w-full lg:w-48 h-64 sm:h-48 md:h-64 lg:h-48 rounded-2xl object-cover shadow-lg border border-(--app-border)"
                            />
                            <div className="flex-1 space-y-4">
                                <h1 className="text-2xl font-bold tracking-tight text-(--app-fg)">
                                    {item.title}
                                </h1>

                                <div className="space-y-2 text-sm">
                                    <div>
                                        <span className="block text-xs uppercase tracking-wider text-(--app-muted) font-semibold">
                                            Venue / Route
                                        </span>
                                        <span className="text-(--app-fg) font-medium">{item.venue}</span>
                                    </div>

                                    <div>
                                        <span className="block text-xs uppercase tracking-wider text-(--app-muted) font-semibold">
                                            Category
                                        </span>
                                        <span className="inline-flex items-center rounded-full bg-(--app-accent)/10 px-2.5 py-0.5 text-xs font-semibold text-(--app-accent) capitalize">
                                            {item.category}
                                        </span>
                                    </div>

                                    {item.availableSeats !== undefined && (
                                        <div>
                                            <span className="block text-xs uppercase tracking-wider text-(--app-muted) font-semibold">
                                                Available Capacity
                                            </span>
                                            <span className="text-(--app-fg) font-semibold text-base">
                                                {item.availableSeats} seats remaining
                                            </span>
                                        </div>
                                    )}

                                    {item.details && (
                                        <div>
                                            <span className="block text-xs uppercase tracking-wider text-(--app-muted) font-semibold">
                                                Description / Details
                                            </span>
                                            {Array.isArray(item.details) ? (
                                                <ul className="list-disc pl-4 space-y-1 text-xs text-(--app-muted)">
                                                    {item.details.map((detail, index) => (
                                                        <li key={index}>{detail}</li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <p className="text-xs text-(--app-muted)">{item.details}</p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="pt-2 border-t border-(--app-border)/60">
                                    <span className="block text-xs uppercase tracking-wider text-(--app-muted) font-semibold">
                                        Ticket Price
                                    </span>
                                    <p className="text-3xl font-extrabold text-(--app-fg)">
                                        ₹{item.price}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Form inputs */}
                        <div className="flex flex-col justify-between rounded-2xl border border-(--app-border) bg-(--app-surface-2) p-5 sm:p-6 space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold text-(--app-fg)">
                                    Booking Details
                                </h3>
                                <p className="text-xs text-(--app-muted) mt-1">
                                    Select your preferred date, time and number of seats.
                                </p>

                                <div className="mt-6 space-y-4">
                                    <label className="block space-y-2">
                                        <span className="text-xs font-semibold uppercase tracking-wider text-(--app-muted)">
                                            Select Date
                                        </span>
                                        <input
                                            type="date"
                                            value={form.date}
                                            onChange={(e) =>
                                                handleChange("date", e.target.value)
                                            }
                                            required
                                            className="w-full rounded-xl border border-(--app-border) bg-(--app-surface) px-4 py-3 text-sm text-(--app-fg) outline-none transition-all focus:border-(--app-accent) focus:ring-1 focus:ring-(--app-accent)"
                                        />
                                    </label>

                                    <label className="block space-y-2">
                                        <span className="text-xs font-semibold uppercase tracking-wider text-(--app-muted)">
                                            Select Time
                                        </span>
                                        <input
                                            type="time"
                                            value={form.time}
                                            onChange={(e) =>
                                                handleChange("time", e.target.value)
                                            }
                                            required
                                            className="w-full rounded-xl border border-(--app-border) bg-(--app-surface) px-4 py-3 text-sm text-(--app-fg) outline-none transition-all focus:border-(--app-accent) focus:ring-1 focus:ring-(--app-accent)"
                                        />
                                    </label>

                                    <label className="block space-y-2">
                                        <span className="text-xs font-semibold uppercase tracking-wider text-(--app-muted)">
                                            Number of Seats
                                        </span>
                                        <input
                                            type="number"
                                            min={1}
                                            max={item.availableSeats}
                                            value={form.seats}
                                            onChange={(e) =>
                                                handleChange(
                                                    "seats",
                                                    Number(e.target.value)
                                                )
                                            }
                                            required
                                            className="w-full rounded-xl border border-(--app-border) bg-(--app-surface) px-4 py-3 text-sm text-(--app-fg) outline-none transition-all focus:border-(--app-accent) focus:ring-1 focus:ring-(--app-accent)"
                                        />
                                    </label>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-(--app-border)/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <span className="block text-xs uppercase tracking-wider text-(--app-muted) font-semibold">
                                        Total Amount
                                    </span>
                                    <p className="text-3xl font-extrabold text-(--app-fg)">
                                        ₹{Number(item.price || 0) * form.seats}
                                    </p>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full sm:w-auto rounded-xl bg-(--app-accent) px-6 py-3.5 text-sm font-semibold text-(--app-accent-fg) transition-all hover:bg-(--app-accent-hover) hover:shadow-lg hover:shadow-(--app-accent)/20 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
                                >
                                    {isSubmitting ? "Booking..." : "Book Ticket"}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default BookingPage