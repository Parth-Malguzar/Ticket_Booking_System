import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/axios.ts";
import type { UserBooking } from "../types";
import toast from "react-hot-toast";
import { Calendar, Clock, MapPin, Ticket, Train } from "lucide-react";

const UserBookings = () => {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState<UserBooking[]>([]);
    const [loading, setLoading] = useState(true);
    const [cancellingId, setCancellingId] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<"all" | "cancelled">("all");

    const performCancelBooking = async (bookingId: string) => {
        try {
            await api.delete("/bookings", { data: { bookingId } });
            toast.success("Booking cancelled successfully!");
            const res = await api.get("/users/bookings");
            setBookings(res.data.bookings || []);
        } catch (error: any) {
            console.error("Cancellation error:", error);
            toast.error(error.response?.data?.message || "Failed to cancel booking");
        }
    };

    const handleHideBooking = async (bookingId: string) => {
        try {
            await api.patch("/bookings/hide", { bookingId });
            toast.success("Booking removed from view.");
            const res = await api.get("/users/bookings");
            setBookings(res.data.bookings || []);
        } catch (error: any) {
            console.error("Remove from view error:", error);
            toast.error(error.response?.data?.message || "Failed to remove booking");
        }
    };

    const filteredBookings = bookings.filter((booking) => {
        if (viewMode === "all") {
            return !booking.hiddenByUser;
        } else {
            return booking.status === "cancelled";
        }
    });

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const res = await api.get("/users/bookings");
                setBookings(res.data.bookings || []);
            } catch (error) {
                console.error("Error fetching bookings:", error);
                toast.error("Failed to load your booking history.");
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, []);

    if (loading) {
        return (
            <div className="min-h-[calc(100vh-8rem)] bg-(--app-bg) px-4 py-10 flex items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-(--app-accent) border-t-transparent"></div>
            </div>
        );
    }

    if (bookings.length === 0) {
        return (
            <div className="min-h-[calc(100vh-8rem)] bg-(--app-bg) px-4 py-10 text-(--app-fg)">
                <div className="mx-auto max-w-xl rounded-3xl border border-(--app-border) bg-(--app-surface) p-8 text-center shadow-2xl shadow-black/30 sm:p-12">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-(--app-surface-2) text-(--app-muted) mb-6 border border-(--app-border)">
                        <Ticket className="h-10 w-10 text-(--app-accent)" />
                    </div>
                    <h3 className="text-xl font-bold text-(--app-fg)">No Bookings Found</h3>
                    <p className="text-sm text-(--app-muted) mt-3 leading-relaxed">
                        You haven't booked any tickets yet. Explore catalog categories to reserve tickets.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-8rem)] bg-(--app-bg) px-4 py-10 text-(--app-fg)">
            <div className="mx-auto flex max-w-6xl flex-col gap-6 rounded-3xl border border-(--app-border) bg-(--app-surface) p-8 shadow-2xl shadow-black/30 sm:p-10">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-(--app-border) pb-6">
                    <div>
                        <h1 className="text-3xl font-semibold sm:text-4xl text-(--app-fg)">Your Bookings</h1>
                        <p className="text-sm text-(--app-muted) mt-2">
                            View and manage your current and past ticket reservations.
                        </p>
                    </div>
                    <div className="flex items-center gap-3 self-start sm:self-center">
                        <select
                            value={viewMode}
                            onChange={(e) => setViewMode(e.target.value as any)}
                            className="rounded-xl border border-(--app-border) bg-(--app-surface-2) px-3 py-1.5 text-xs font-semibold text-(--app-fg) focus:outline-none focus:ring-2 focus:ring-(--app-accent) cursor-pointer"
                        >
                            <option value="all">Active Bookings</option>
                            <option value="cancelled">Cancelled Bookings</option>
                        </select>
                        <span className="rounded-full bg-(--app-accent)/10 px-3 py-1.5 text-xs font-semibold text-(--app-accent) border border-(--app-accent)/20">
                            {filteredBookings.length} {filteredBookings.length === 1 ? "Booking" : "Bookings"}
                        </span>
                    </div>
                </div>

                {filteredBookings.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-(--app-surface-2) text-(--app-muted) mb-4 border border-(--app-border)">
                            <Ticket className="h-6 w-6 text-(--app-accent)" />
                        </div>
                        <h3 className="text-lg font-semibold text-(--app-fg)">No bookings here</h3>
                        <p className="text-xs text-(--app-muted) mt-2 max-w-sm">
                            {viewMode === "all"
                                ? "No active bookings to show."
                                : "You do not have any cancelled bookings."}
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-4">
                    {filteredBookings.map((booking) => (
                        <div
                            key={booking.id}
                            className="overflow-hidden rounded-2xl border border-(--app-border) bg-(--app-surface-2) transition-all hover:shadow-lg hover:shadow-black/10"
                        >
                            {/* Image banner */}
                            <div className="relative h-36 bg-zinc-800">
                                {booking.image ? (
                                    <img
                                        src={booking.image}
                                        alt={booking.title}
                                        className="h-full w-full object-cover opacity-80"
                                    />
                                ) : (
                                    <div className="flex h-full items-center justify-center text-(--app-muted)">
                                        <Ticket className="h-12 w-12 opacity-40" />
                                    </div>
                                )}
                                <div className="absolute top-3 right-3">
                                    <span
                                        className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${
                                            booking.status === "confirmed"
                                                ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                                                : booking.status === "pending"
                                                ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                                                : "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                                        }`}
                                    >
                                        {booking.status}
                                    </span>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-5 space-y-4">
                                <div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-(--app-accent)">
                                        {booking.category}
                                    </span>
                                    <h3 className="font-semibold text-(--app-fg) mt-0.5 line-clamp-1">
                                        {booking.title}
                                    </h3>
                                </div>

                                {/* Date and Time */}
                                <div className="grid grid-cols-2 gap-2 text-xs text-(--app-muted)">
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="h-3.5 w-3.5 text-(--app-accent)" />
                                        <span>{booking.date}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Clock className="h-3.5 w-3.5 text-(--app-accent)" />
                                        <span>{booking.time}</span>
                                    </div>
                                </div>

                                {/* Venue / Stations */}
                                <div className="space-y-1.5 text-xs border-t border-(--app-border)/60 pt-3">
                                    {booking.category === "train" && (booking.source || booking.destination) ? (
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-1.5 text-(--app-muted)">
                                                <Train className="h-3.5 w-3.5 text-(--app-accent)" />
                                                <span className="font-medium text-(--app-fg)">
                                                    {booking.source || "Unknown"} → {booking.destination || "Unknown"}
                                                </span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1.5 text-(--app-muted)">
                                            <MapPin className="h-3.5 w-3.5 text-(--app-accent)" />
                                            <span className="line-clamp-1">{booking.venue || "No Venue"}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Footer cost & seats */}
                                <div className="flex items-center justify-between border-t border-(--app-border)/60 pt-3 text-xs">
                                    <div>
                                        <span className="text-(--app-muted)">Seats:</span>{" "}
                                        <span className="font-semibold text-(--app-fg)">{booking.seats}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-(--app-muted) text-[10px] block">Total Paid</span>
                                        <span className="font-extrabold text-base text-(--app-fg)">
                                            ₹{booking.totalAmount}
                                        </span>
                                    </div>
                                </div>

                                {/* Actions: Cancel & Update with inline confirmation */}
                                {cancellingId === booking.id ? (
                                    <div className="flex flex-col gap-2 pt-3 border-t border-(--app-border)/60">
                                        <p className="text-[11px] text-rose-500 font-semibold text-center uppercase tracking-wide">
                                            Confirm cancellation?
                                        </p>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => {
                                                    void performCancelBooking(booking.id);
                                                    setCancellingId(null);
                                                }}
                                                className="flex-1 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold py-2 transition-all active:scale-[0.98] shadow-sm shadow-rose-500/20"
                                            >
                                                Yes, Cancel
                                            </button>
                                            <button
                                                onClick={() => setCancellingId(null)}
                                                className="flex-1 rounded-xl bg-(--app-surface) border border-(--app-border) hover:bg-(--app-surface-2) text-(--app-fg) text-xs font-semibold py-2 transition-all active:scale-[0.98]"
                                            >
                                                No
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    booking.status === "cancelled" ? (
                                        <div className="flex gap-2 pt-3 border-t border-(--app-border)/60">
                                            {booking.hiddenByUser ? (
                                                <span className="flex-1 text-center py-2 text-xs font-semibold text-rose-500 bg-rose-500/10 rounded-xl">
                                                    Removed from main list
                                                </span>
                                            ) : (
                                                <button
                                                    onClick={() => handleHideBooking(booking.id)}
                                                    className="flex-1 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 text-xs font-semibold py-2 transition-all active:scale-[0.98]"
                                                >
                                                    Remove from View
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex gap-2 pt-3 border-t border-(--app-border)/60">
                                            <button
                                                onClick={() => setCancellingId(booking.id)}
                                                className="flex-1 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 text-xs font-semibold py-2 transition-all active:scale-[0.98]"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={() => navigate(`/book/${booking.itemId}?bookingId=${booking.id}`)}
                                                className="flex-1 rounded-xl bg-(--app-accent)/10 hover:bg-(--app-accent)/20 text-(--app-accent) text-xs font-semibold py-2 transition-all active:scale-[0.98]"
                                            >
                                                Update
                                            </button>
                                        </div>
                                    )
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
            </div>
        </div>
    );
};

export default UserBookings;