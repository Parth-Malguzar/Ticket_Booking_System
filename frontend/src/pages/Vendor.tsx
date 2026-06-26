import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import api from "../lib/axios.ts";
import type { CatalogItem } from "../types";
import { useAuthStore } from "../stores/authStore.ts";
import { socket } from "../lib/socket";
import { StatsCard } from "../components/dashboard/StatsCard";
import { VendorPendingStatus } from "../components/vendor/VendorPendingStatus";
import { CreateListingForm } from "../components/vendor/CreateListingForm";
import { VendorListingCard } from "../components/vendor/VendorListingCard";

const categoryMeta = {
  movies: {
    title: "Movie Listings",
  },
  train: {
    title: "Train Listings",
  },
  concert: {
    title: "Concert Listings",
  },
} as const;

const Vendor = () => {
  const { user } = useAuthStore();
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "dashboard";
  const category =
    activeTab === "movies" || activeTab === "train" || activeTab === "concert"
      ? activeTab
      : null;

  const [items, setItems] = useState<CatalogItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalMovies: 0,
    totalConcerts: 0,
    totalTrains: 0,
    movieEarnings: 0,
    concertEarnings: 0,
    trainEarnings: 0,
  });

  const fetchStats = async () => {
    try {
      const res = await api.get("/vendors/stats");
      setStats({
        totalMovies: res.data.totalMovies || 0,
        totalConcerts: res.data.totalConcerts || 0,
        totalTrains: res.data.totalTrains || 0,
        movieEarnings: res.data.movieEarnings || 0,
        concertEarnings: res.data.concertEarnings || 0,
        trainEarnings: res.data.trainEarnings || 0,
      });
    } catch (error) {
      console.error("Failed to load vendor stats", error);
    }
  };

  useEffect(() => {
    if (user && user.vendorStatus === "approved") {
      void fetchStats();
    }
  }, [user]);

  const loadItems = useCallback(async () => {
    if (!category) return;
    setIsLoading(true);
    try {
      const res = await api.get("/catalog", {
        params: { category },
      });
      setItems(res.data.items || []);
    } catch (error) {
      console.error(error);
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Failed to load listings");
      } else {
        toast.error("Failed to load listings");
      }
    } finally {
      setIsLoading(false);
    }
  }, [category]);

  useEffect(() => {
    void loadItems();
  }, [loadItems]);

  useEffect(() => {
    // Listen for real-time stats updates
    socket.on("stats_update", (data) => {
      setStats((prev) => {
        const updated = { ...prev };
        const { category: itemCategory, amount } = data;

        if (itemCategory === "movies") {
          updated.movieEarnings += amount;
        } else if (itemCategory === "concert") {
          updated.concertEarnings += amount;
        } else if (itemCategory === "train") {
          updated.trainEarnings += amount;
        }

        return updated;
      });
    });

    // Listen for listing deletion approval / removal events
    socket.on("catalog_update", (data: { itemId: string; category: string; action: string }) => {
      const { itemId, category: itemCategory, action } = data;
      if (action === "delete") {
        // 1. Remove from local items list
        setItems((prev) => prev.filter((item) => item.id !== itemId));

        // 2. Decrement corresponding listing count
        setStats((prev) => {
          const updated = { ...prev };
          if (itemCategory === "movies") {
            updated.totalMovies = Math.max(0, updated.totalMovies - 1);
          } else if (itemCategory === "concert") {
            updated.totalConcerts = Math.max(0, updated.totalConcerts - 1);
          } else if (itemCategory === "train") {
            updated.totalTrains = Math.max(0, updated.totalTrains - 1);
          }
          return updated;
        });
      }
    });

    return () => {
      socket.off("stats_update");
      socket.off("catalog_update");
    };
  }, []);

  const handleCreateListing = async (formData: {
    title: string;
    image: string;
    venue: string;
    price: string;
    availableSeats: string;
    details: string;
  }) => {
    if (!category) {
      toast.error("Choose Movies, Train, or Concert to add a listing");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        category,
        title: formData.title.trim(),
        image: formData.image.trim(),
        venue: formData.venue.trim(),
        price: formData.price.trim(),
        availableSeats: Number(formData.availableSeats) || 0,
        details: formData.details,
      };

      const res = await api.post("/catalog", payload);
      toast.success(res.data.message || "Listing created");
      setItems((prev) => [res.data.item, ...prev]);

      // Refetch stats to keep total listing counts in sync
      void fetchStats();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Failed to create listing");
      } else {
        toast.error("Failed to create listing");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await api.patch(`/catalog/${id}/request-removal`);
      toast.success(res.data.message || "Removal requested");
      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, requestRemoval: true } : item
        )
      );
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Failed to request removal");
      } else {
        toast.error("Failed to request removal");
      }
    } finally {
      setDeletingId(null);
    }
  };

  const renderDashboard = () => {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          title="Movies"
          value={stats.totalMovies}
          footer={`₹${stats.movieEarnings}`}
        />
        <StatsCard
          title="Concerts"
          value={stats.totalConcerts}
          footer={`₹${stats.concertEarnings}`}
        />
        <StatsCard
          title="Trains"
          value={stats.totalTrains}
          footer={`₹${stats.trainEarnings}`}
        />
        <StatsCard
          title="Total Earnings"
          value={`₹${stats.trainEarnings + stats.movieEarnings + stats.concertEarnings}`}
          footer="Across all listings"
        />
      </div>
    );
  };

  const renderCategoryManager = () => {
    if (!category) return null;

    return (
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <CreateListingForm
          category={category}
          onSubmit={handleCreateListing}
          isSubmitting={isSubmitting}
        />

        <div className="rounded-3xl border border-(--app-border) bg-(--app-surface-2) p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-(--app-muted)">Your listings</p>
              <h2 className="mt-3 text-2xl font-semibold capitalize">{category}</h2>
            </div>
            <span className="rounded-full border border-(--app-border) px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-(--app-muted)">
              {items.length} items
            </span>
          </div>

          {isLoading ? (
            <p className="mt-6 text-sm text-(--app-muted)">Loading listings...</p>
          ) : items.length === 0 ? (
            <p className="mt-6 text-sm text-(--app-muted)">
              No listings yet. Add the first one using the form.
            </p>
          ) : (
            <div className="mt-6 space-y-4">
              {items.map((item) => (
                <VendorListingCard
                  key={item.id}
                  item={item}
                  onDelete={handleDelete}
                  isDeleting={deletingId === item.id}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  if (user && user.vendorStatus !== "approved") {
    return <VendorPendingStatus status={user.vendorStatus} />;
  }

  const title = category ? categoryMeta[category].title : "Vendor Dashboard";
 

  return (
    <div className="min-h-[calc(100vh-8rem)] bg-(--app-bg) px-4 py-10 text-(--app-fg)">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 rounded-3xl border border-(--app-border) bg-(--app-surface) p-8 shadow-2xl shadow-black/30 sm:p-10">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-(--app-muted)">Vendor panel</p>
          <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">{title}</h1>
          <p className="mt-2 max-w-2xl text-sm text-(--app-muted)">
            Vendors can add and manage movie, train, and concert listings here.
          </p>
        </div>

        {activeTab === "dashboard" ? renderDashboard() : renderCategoryManager()}
      </div>
    </div>
  );
};

export default Vendor;