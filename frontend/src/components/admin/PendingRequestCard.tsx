import type { User } from "../../types";

type VendorRequest = Pick<User, "id" | "name" | "email" | "role" | "vendorStatus" | "createdAt">;

interface PendingRequestCardProps {
  request: VendorRequest;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  isApproving: boolean;
  isRejecting: boolean;
}

export const PendingRequestCard = ({
  request,
  onApprove,
  onReject,
  isApproving,
  isRejecting,
}: PendingRequestCardProps) => {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-(--app-border) bg-(--app-surface) p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <p className="text-base font-semibold text-(--app-fg)">{request.name}</p>
        <p className="text-sm text-(--app-muted)">{request.email}</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => onApprove(request.id)}
          disabled={isApproving || isRejecting}
          className="rounded-xl bg-(--app-accent) px-4 py-2 text-sm font-semibold text-(--app-accent-fg) transition-all hover:bg-(--app-accent-hover) disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isApproving ? "Approving..." : "Approve vendor"}
        </button>
        <button
          type="button"
          onClick={() => onReject(request.id)}
          disabled={isApproving || isRejecting}
          className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-300 transition-all hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isRejecting ? "Rejecting..." : "Reject vendor"}
        </button>
      </div>
    </div>
  );
};
