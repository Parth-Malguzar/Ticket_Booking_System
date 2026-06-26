import type { CatalogItem } from "../../types";

interface VendorListingCardProps {
  item: CatalogItem;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

export const VendorListingCard = ({ item, onDelete, isDeleting }: VendorListingCardProps) => {
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
              <h3 className="truncate text-base font-semibold">{item.title}</h3>
              <p className="mt-1 text-sm text-(--app-muted)">{item.venue}</p>
            </div>
            <button
              type="button"
              onClick={() => onDelete(item.id)}
              disabled={isDeleting || item.requestRemoval}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all disabled:cursor-not-allowed ${
                item.requestRemoval
                  ? "border border-zinc-700 bg-zinc-800 text-zinc-500 opacity-60"
                  : "border border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/20 disabled:opacity-70"
              }`}
            >
              {isDeleting ? "Removing..." : item.requestRemoval ? "Requested" : "Req Remove"}
            </button>
          </div>

          <div className="mt-3 flex flex-wrap gap-2 text-xs text-(--app-muted)">
            <span className="rounded-full border border-(--app-border) px-2.5 py-1">
              ${item.price}
            </span>
            {item.availableSeats !== undefined && (
              <span className="rounded-full border border-(--app-border) px-2.5 py-1">
                Seats: {item.availableSeats}
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};
