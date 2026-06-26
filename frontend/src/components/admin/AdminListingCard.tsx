import type { CatalogItem } from "../../types";

interface AdminListingCardProps {
  item: CatalogItem;
  onRemove: (id: string) => void;
  onRejectRemoval: (id: string) => void;
  isRemoving: boolean;
  isRejectingRemoval: boolean;
}

export const AdminListingCard = ({
  item,
  onRemove,
  onRejectRemoval,
  isRemoving,
  isRejectingRemoval,
}: AdminListingCardProps) => {
  return (
    <article className="overflow-hidden rounded-2xl border border-(--app-border) bg-(--app-surface)">
      <div className="flex gap-4 p-4">
        {item.image && (
          <img
            src={item.image}
            alt={item.title}
            className="h-24 w-24 rounded-2xl object-cover"
          />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="truncate text-base font-semibold">{item.title}</h3>
                {item.requestRemoval && (
                  <span className="rounded-full bg-red-500/20 border border-red-500/30 px-2 py-0.5 text-[10px] font-semibold text-red-300 animate-pulse">
                    Req Removal
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-(--app-muted)">{item.venue}</p>
            </div>
            <div className="flex gap-2">
              {item.requestRemoval && (
                <button
                  type="button"
                  onClick={() => onRejectRemoval(item.id)}
                  disabled={isRejectingRemoval || isRemoving}
                  className="rounded-full border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs font-semibold text-zinc-300 transition-all hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isRejectingRemoval ? "Rejecting..." : "Reject"}
                </button>
              )}
              <button
                type="button"
                onClick={() => onRemove(item.id)}
                disabled={isRemoving || isRejectingRemoval}
                className="rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-300 transition-all hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isRemoving ? "Removing..." : "Remove"}
              </button>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2 text-xs text-(--app-muted)">
            <span className="rounded-full border border-(--app-border) px-2.5 py-1">
              ${item.price}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
};
