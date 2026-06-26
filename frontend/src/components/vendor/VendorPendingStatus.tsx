interface VendorPendingStatusProps {
  status: "none" | "pending" | "rejected";
}

export const VendorPendingStatus = ({ status }: VendorPendingStatusProps) => {
  return (
    <div className="min-h-[calc(100vh-8rem)] bg-(--app-bg) px-4 py-12 flex items-center justify-center text-(--app-fg)">
      <div className="w-full max-w-lg rounded-3xl border border-(--app-border) bg-(--app-surface) p-8 text-center shadow-2xl shadow-black/30 sm:p-10">
        {status === "rejected" ? (
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
              If you believe this was an error, please reach out to{" "}
              <a href="mailto:support@bookmyticket.com" className="font-medium text-(--app-fg) underline hover:text-(--app-accent)">
                support@bookmyticket.com
              </a>
              .
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
  );
};
