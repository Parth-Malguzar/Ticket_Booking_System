const Movies = () => {
    return (
        <div className="min-h-[calc(100vh-8rem)] bg-(--app-bg) px-4 py-10 text-(--app-fg)">
            <div className="mx-auto flex max-w-6xl flex-col gap-6 rounded-3xl border border-(--app-border) bg-(--app-surface) p-8 shadow-2xl shadow-black/30 sm:p-10">
                <p className="text-sm uppercase tracking-[0.3em] text-(--app-muted)">Browse</p>
                <h1 className="text-3xl font-semibold sm:text-4xl">Movies</h1>
                <p className="max-w-2xl text-sm text-(--app-muted)">
                    Explore movie listings, showtimes, and booking options from this section.
                </p>
            </div>
        </div>
    )
}

export default Movies
