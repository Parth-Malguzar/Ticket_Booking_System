import { useEffect, useState } from "react"
import { useParams, useNavigate, useSearchParams } from "react-router-dom"
import api from "@/lib/axios"
import axios from "axios"
import toast from "react-hot-toast"
import type { CatalogItem } from "../types"
import { Input } from "../components/Input"
import { socket } from "@/lib/socket.ts"
import SeatGrid from "@/components/vendor/SeatGrid.tsx"

const initialForm = {
    date: "",
    time: "",
    seats: 0,
    seatNumbers: [] as number[],
    source: "",
    destination: "",
}

const BookingPage = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const bookingId = searchParams.get("bookingId")

    const [item, setItem] = useState<CatalogItem | null>(null)
    const [form, setForm] = useState(initialForm)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [selectingSeats, setSelectingSeats] = useState(false)

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

    useEffect(() => {
        if (!bookingId) return;

        const fetchBookingDetails = async () => {
            try {
                const res = await api.get("/users/bookings")
                const bookings = res.data.bookings || []
                const found = bookings.find((b: any) => b.id === bookingId)
                if (found) {
                    setForm({
                        date: found.date,
                        time: found.time,
                        seats: found.seats,
                        seatNumbers: found.seatNumbers || [],
                        source: found.source || "",
                        destination: found.destination || "",
                    })
                } else {
                    toast.error("Booking not found")
                    navigate("/user")
                }
            } catch (error) {
                console.error(error)
                toast.error("Failed to load booking details for update")
            }
        }

        void fetchBookingDetails()
    }, [bookingId, navigate])

    useEffect(() => {
        if (!id) return;

        // Join the item-specific socket room
        socket.emit("join_item_room", id);

        // Listen for real-time seats update
        const handleSeatsUpdate = (data: { itemId: string; availableSeats: number; occupiedSeats?: number[] }) => {
            console.log("Real-time seats update:", data);
            if (data.itemId === id) {
                setItem((prevItem) => {
                    if (!prevItem) return null;
                    return {
                        ...prevItem,
                        availableSeats: data.availableSeats,
                        occupiedSeats: data.occupiedSeats || prevItem.occupiedSeats,
                    };
                });
            }
        };

        socket.on("seats_update", handleSeatsUpdate);

        // Cleanup on unmount/id change
        return () => {
            socket.emit("leave_item_room", id);
            socket.off("seats_update", handleSeatsUpdate);
        };
    }, [id]);

    const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            if (form.seatNumbers.length === 0) {
                toast.error("Please select at least one seat.")
                setIsSubmitting(false)
                return
            }

            if (bookingId) {
                await api.put("/bookings", {
                    bookingId,
                    date: form.date,
                    time: form.time,
                    seats: form.seats,
                    seatNumbers: form.seatNumbers,
                    source: item?.category === "train" ? form.source : undefined,
                    destination: item?.category === "train" ? form.destination : undefined,
                })
                toast.success("Ticket updated successfully!")
            } else {
                await api.post("/bookings", {
                    itemId: item?.id,
                    date: form.date,
                    time: form.time,
                    seats: form.seats,
                    seatNumbers: form.seatNumbers,
                    source: item?.category === "train" ? form.source : undefined,
                    destination: item?.category === "train" ? form.destination : undefined,
                })
                toast.success("Ticket booked successfully!")
            }
            navigate("/user")
        } catch (error) {
            if (axios.isAxiosError(error)) {
                toast.error(error.response?.data?.message || "Failed to submit booking")
            } else {
                toast.error("Failed to submit booking")
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
                        {bookingId ? "Update Booking" : "Book Ticket"}
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
                                    <Input
                                        label="Select Date"
                                        type="date"
                                        value={form.date}
                                        onChange={(e) =>
                                            handleChange("date", e.target.value)
                                        }
                                        required
                                    />

                                    <Input
                                        label="Select Time"
                                        type="time"
                                        value={form.time}
                                        onChange={(e) =>
                                            handleChange("time", e.target.value)
                                        }
                                        required
                                    />

                                    {item.category === "train" && (
                                        <>
                                            <Input
                                                label="Source"
                                                type="text"
                                                value={form.source}
                                                onChange={(e) =>
                                                    handleChange("source", e.target.value)
                                                }
                                                required
                                                placeholder="Departure station"
                                            />

                                            <Input
                                                label="Destination"
                                                type="text"
                                                value={form.destination}
                                                onChange={(e) =>
                                                    handleChange("destination", e.target.value)
                                                }
                                                required
                                                placeholder="Arrival station"
                                            />
                                        </>
                                    )}

                                    {form.seatNumbers.length > 0 && (
                                        <div className="flex items-center justify-between mb-3 px-1">
                                            <span className="text-xs uppercase tracking-wider text-(--app-muted) font-semibold">
                                                Selected Seats
                                            </span>
                                            <span className="text-sm font-bold text-(--app-accent)">
                                                {form.seatNumbers.sort((a, b) => a - b).join(", ")}
                                            </span>
                                        </div>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => setSelectingSeats(true)}
                                        className="w-full rounded-xl border border-(--app-border) bg-(--app-surface) hover:bg-(--app-surface-hover) px-4 py-3.5 text-sm font-semibold text-(--app-fg) transition-all active:scale-[0.98] shadow-sm hover:shadow"
                                    >
                                        Select Seats
                                    </button>
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
                                    {isSubmitting
                                        ? (bookingId ? "Updating..." : "Booking...")
                                        : (bookingId ? "Update Booking" : "Book Ticket")}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
            {selectingSeats && (
                <SeatGrid
                    onClose={() => setSelectingSeats(false)}
                    totalSeats={item.totalSeats || item.availableSeats || 0}
                    occupiedSeats={
                        (item.occupiedSeats || []).filter(
                            (seat) => !(form.seatNumbers || []).includes(seat)
                        )
                    }
                    initialSelectedSeats={form.seatNumbers}
                    onConfirm={(selectedSeats) => {
                        setForm((prev) => ({
                            ...prev,
                            seats: selectedSeats.length,
                            seatNumbers: selectedSeats,
                        }))
                        setSelectingSeats(false)
                    }}
                />
            )}
        </div>
    )
}

export default BookingPage