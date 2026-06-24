import { useEffect, useState } from "react";
import api from "../lib/axios.ts";
import type { UserBooking } from "../types";
import toast from "react-hot-toast";
import { Calendar, Clock, MapPin, Ticket, Train } from "lucide-react";

const UserBookings = () => {
    const [bookings, setBookings] = useState<UserBooking[]>([]);
    const [loading, setLoading] = useState(true);

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
            <div className="flex h-64 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-(--app-accent) border-t-transparent"></div>
            </div>
        );
    }

    if (bookings.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="rounded-full bg-(--app-surface-2) p-4 text-(--app-muted) mb-4">
                    <Ticket className="h-10 w-10" />
                </div>
                <h3 className="text-lg font-semibold text-(--app-fg)">No Bookings Found</h3>
                <p className="text-sm text-(--app-muted) mt-1 max-w-sm">
                    You haven't booked any tickets yet. Explore catalog categories to reserve tickets.
                </p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-(--app-fg)">Your Bookings</h2>
                    <p className="text-sm text-(--app-muted) mt-1">
                        View and manage your current and past ticket reservations.
                    </p>
                </div>
                <span className="rounded-full bg-(--app-accent)/10 px-3 py-1 text-xs font-semibold text-(--app-accent)">
                    {bookings.length} {bookings.length === 1 ? "Booking" : "Bookings"}
                </span>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {bookings.map((booking) => (
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
                                    className={`rounded-full px-2.5 py-1 text-xs font-medium uppercase tracking-wider ${
                                        booking.status === "confirmed"
                                            ? "bg-emerald-500/10 text-emerald-500"
                                            : booking.status === "pending"
                                            ? "bg-amber-500/10 text-amber-500"
                                            : "bg-rose-500/10 text-rose-500"
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
                                    <Calendar className="h-3.5 w-3.5" />
                                    <span>{booking.date}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Clock className="h-3.5 w-3.5" />
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
                                        <MapPin className="h-3.5 w-3.5" />
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
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default UserBookings;