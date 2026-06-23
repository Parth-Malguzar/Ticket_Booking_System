import { useSearchParams } from "react-router-dom";

const Vendor = () => {
    const [searchParams] = useSearchParams()
    const activeTab = searchParams.get("tab") || "dashboard"

    const title = {
        dashboard: "Vendor Dashboard",
        movies: "Movie Listings",
        train: "Train Listings",
        concert: "Concert Listings",
    }[activeTab] ?? "Vendor Dashboard"

    const renderSection = () => {
        if (activeTab === "movies" || activeTab === "train" || activeTab === "concert") {
            return (
                <div className="rounded-2xl border border-(--app-border) bg-(--app-surface-2) p-6">
                    <h2 className="text-lg font-semibold capitalize">{activeTab} tools</h2>
                    <p className="mt-2 text-sm text-(--app-muted)">
                        Manage {activeTab} inventory, pricing, and schedules from this section.
                    </p>
                </div>
            )
        }

        return (
            <>
                <div className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl border border-(--app-border) bg-(--app-surface-2) p-4">
                        <p className="text-xs uppercase tracking-[0.25em] text-(--app-muted)">Shows</p>
                        <p className="mt-2 text-3xl font-semibold text-(--app-fg)">0</p>
                        <p className="mt-1 text-sm text-(--app-muted)">Active listings</p>
                    </div>
                    <div className="rounded-2xl border border-(--app-border) bg-(--app-surface-2) p-4">
                        <p className="text-xs uppercase tracking-[0.25em] text-(--app-muted)">Bookings</p>
                        <p className="mt-2 text-3xl font-semibold text-(--app-fg)">0</p>
                        <p className="mt-1 text-sm text-(--app-muted)">Pending confirmations</p>
                    </div>
                    <div className="rounded-2xl border border-(--app-border) bg-(--app-surface-2) p-4">
                        <p className="text-xs uppercase tracking-[0.25em] text-(--app-muted)">Earnings</p>
                        <p className="mt-2 text-3xl font-semibold text-(--app-fg)">$0</p>
                        <p className="mt-1 text-sm text-(--app-muted)">This month</p>
                    </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                    <div className="rounded-2xl border border-(--app-border) bg-(--app-surface-2) p-5">
                        <h2 className="text-lg font-semibold">Quick actions</h2>
                        <div className="mt-4 flex flex-wrap gap-3">
                            <button type="button" className="rounded-full border border-(--app-border) bg-(--app-surface) px-4 py-2 text-sm font-medium transition-all hover:border-(--app-accent) hover:bg-(--app-accent) hover:text-(--app-accent-fg)">
                                Add show
                            </button>
                            <button type="button" className="rounded-full border border-(--app-border) bg-(--app-surface) px-4 py-2 text-sm font-medium transition-all hover:border-(--app-accent) hover:bg-(--app-accent) hover:text-(--app-accent-fg)">
                                View bookings
                            </button>
                            <button type="button" className="rounded-full border border-(--app-border) bg-(--app-surface) px-4 py-2 text-sm font-medium transition-all hover:border-(--app-accent) hover:bg-(--app-accent) hover:text-(--app-accent-fg)">
                                Update inventory
                            </button>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-(--app-border) bg-(--app-surface-2) p-5">
                        <h2 className="text-lg font-semibold">Today</h2>
                        <p className="mt-2 text-sm text-(--app-muted)">
                            Your vendor workspace will show bookings, listings, and payouts here.
                        </p>
                    </div>
                </div>
            </>
        )
    }

    return (
        <div className="min-h-[calc(100vh-8rem)] bg-(--app-bg) px-4 py-10 text-(--app-fg)">
            <div className="mx-auto flex max-w-6xl flex-col gap-6 rounded-3xl border border-(--app-border) bg-(--app-surface) p-8 shadow-2xl shadow-black/30 sm:p-10">
                <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-(--app-muted)">Vendor panel</p>
                    <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">{title}</h1>
                    <p className="mt-2 max-w-2xl text-sm text-(--app-muted)">
                        Use the vendor tabs to switch between dashboard and media management sections.
                    </p>
                </div>

                {renderSection()}
            </div>
        </div>
    )
}

export default Vendor