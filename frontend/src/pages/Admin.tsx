import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import api from "../lib/axios.ts";
import type { User, CatalogItem } from "../types";
import { socket } from "../lib/socket.ts";
import { StatsCard } from "../components/dashboard/StatsCard";
import { PendingRequestCard } from "../components/admin/PendingRequestCard";
import { AdminListingCard } from "../components/admin/AdminListingCard";

type VendorRequest = Pick<User, "id" | "name" | "email" | "role" | "vendorStatus" | "createdAt">;

const Admin = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [vendors, setVendors] = useState<User[]>([]);
  const [requests, setRequests] = useState<VendorRequest[]>([]);
  const [movies, setMovies] = useState<CatalogItem[]>([]);
  const [concerts, setConcerts] = useState<CatalogItem[]>([]);
  const [trains, setTrains] = useState<CatalogItem[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);
  const [rejectingItemId, setRejectingItemId] = useState<string | null>(null);

  const [searchParams] = useSearchParams();

  const rawTab = searchParams.get("tab") || "dashboard";
  const activeTab = rawTab === "user" ? "users" :
                    rawTab === "vendor" ? "vendors" :
                    rawTab === "train" ? "trains" :
                    rawTab === "concert" ? "concerts" :
                    rawTab;

  const formatDate = (value?: string) => {
    if (!value) return "Recently added";

    return new Intl.DateTimeFormat("en", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(value));
  };

  const loadAdminData = async () => {
    try {
      const [usersRes, vendorsRes, requestsRes, moviesRes, concertsRes, trainsRes] =
        await Promise.all([
          api.get("/users", { params: { role: "user" } }),
          api.get("/users", { params: { role: "vendor" } }),
          api.get("/vendors"),
          api.get("/catalog/movies"),
          api.get("/catalog/concert"),
          api.get("/catalog/train"),
        ]);

      setUsers(usersRes.data.users || []);
      setVendors(vendorsRes.data.users || []);
      setRequests(requestsRes.data.requests || []);
      setMovies(moviesRes.data.items || []);
      setConcerts(concertsRes.data.items || []);
      setTrains(trainsRes.data.items || []);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Failed to load admin data");
      } else {
        toast.error("Failed to load admin data");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveCatalogItem = async (id: string) => {
    setDeletingItemId(id);
    try {
      const res = await api.delete(`/catalog/${id}`);
      toast.success(res.data.message || "Listing removed successfully");
      await loadAdminData();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Failed to remove listing");
      } else {
        toast.error("Failed to remove listing");
      }
    } finally {
      setDeletingItemId(null);
    }
  };

  const handleRejectCatalogItem = async (id: string) => {
    setRejectingItemId(id);
    try {
      const res = await api.patch(`/catalog/${id}/reject-removal`);
      toast.success(res.data.message || "Removal request rejected");
      await loadAdminData();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Failed to reject removal request");
      } else {
        toast.error("Failed to reject removal request");
      }
    } finally {
      setRejectingItemId(null);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadAdminData();
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    socket.on("stats_update", () => {
      console.log("Admin Socket: stats updated, reloading data...");
      void loadAdminData();
    });

    return () => {
      socket.off("stats_update");
    };
  }, []);

  const handleApprove = async (id: string) => {
    setApprovingId(id);

    try {
      const res = await api.patch(`/vendors/${id}/approve`);
      toast.success(res.data.message || "Vendor approved");
      await loadAdminData();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Failed to approve vendor");
      } else {
        toast.error("Failed to approve vendor");
      }
    } finally {
      setApprovingId(null);
    }
  };

  const handleReject = async (id: string) => {
    setRejectingId(id);

    try {
      const res = await api.patch(`/vendors/${id}/reject`);
      toast.success(res.data.message || "Vendor rejected");
      await loadAdminData();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Failed to reject vendor");
      } else {
        toast.error("Failed to reject vendor");
      }
    } finally {
      setRejectingId(null);
    }
  };

  const handleDeleteAccount = async (id: string, kind: string) => {
    setDeletingId(id);

    try {
      const res = await api.delete(`/users/${id}`);
      toast.success(res.data.message || `${kind} deleted`);
      await loadAdminData();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || `Failed to delete ${kind}`);
      } else {
        toast.error(`Failed to delete ${kind}`);
      }
    } finally {
      setDeletingId(null);
    }
  };

  const renderPendingRequests = () => {
    if (requests.length === 0) {
      return <p className="text-sm text-(--app-muted)">No pending vendor requests right now.</p>;
    }

    return (
      <div className="space-y-3">
        {requests.map((request) => (
          <PendingRequestCard
            key={request.id}
            request={request}
            onApprove={handleApprove}
            onReject={handleReject}
            isApproving={approvingId === request.id}
            isRejecting={rejectingId === request.id}
          />
        ))}
      </div>
    );
  };

  const renderUsersTable = () => {
    const list = activeTab === "users" ? users : vendors;
    const kind = activeTab === "users" ? "User" : "Vendor";

    if (isLoading) {
      return <p className="text-sm text-(--app-muted)">Loading accounts...</p>;
    }

    if (list.length === 0) {
      return <p className="text-sm text-(--app-muted)">No {kind.toLowerCase()}s found.</p>;
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-(--app-border) text-xs uppercase tracking-[0.2em] text-(--app-muted)">
              <th className="py-4 font-medium">Name</th>
              <th className="py-4 font-medium">Email</th>
              <th className="py-4 font-medium">Joined</th>
              <th className="py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-(--app-border) text-sm">
            {list.map((item) => (
              <tr key={item.id} className="group">
                <td className="py-4 font-semibold text-(--app-fg)">{item.name}</td>
                <td className="py-4 text-(--app-muted)">{item.email}</td>
                <td className="py-4 text-(--app-muted)">{formatDate(item.createdAt)}</td>
                <td className="py-4 text-right">
                  <button
                    type="button"
                    onClick={() => handleDeleteAccount(item.id, kind)}
                    disabled={deletingId === item.id}
                    className="rounded-xl border border-red-500/30 bg-red-500/10 px-3.5 py-1.5 text-xs font-semibold text-red-300 transition-all hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {deletingId === item.id ? "Deleting..." : `Delete ${kind}`}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderCatalogTab = () => {
    const currentItems =
      activeTab === "movies" ? movies : activeTab === "concerts" ? concerts : trains;

    return (
      <div className="space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-(--app-muted)">
            Category Listings
          </p>
          <h2 className="mt-2 text-2xl font-bold capitalize">{activeTab}</h2>
        </div>

        {isLoading ? (
          <p className="text-sm text-(--app-muted)">Loading listings...</p>
        ) : currentItems.length === 0 ? (
          <p className="text-sm text-(--app-muted)">No listings found in this category.</p>
        ) : (
          <div className="mt-6 space-y-4">
            {currentItems.map((item) => (
              <AdminListingCard
                key={item.id}
                item={item}
                onRemove={handleRemoveCatalogItem}
                onRejectRemoval={handleRejectCatalogItem}
                isRemoving={deletingItemId === item.id}
                isRejectingRemoval={rejectingItemId === item.id}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderDashboard = () => {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatsCard
          title="Users"
          value={users.length}
          footer="Registered customer accounts"
        />
        <StatsCard
          title="Vendors & Requests"
          value={`${vendors.length} / ${requests.length}`}
          footer={`Active: ${vendors.length} | Pending: ${requests.length}`}
        />
        <StatsCard
          title="Movie Events"
          value={movies.length}
          footer="Published movie listings"
        />
        <StatsCard
          title="Concert Events"
          value={concerts.length}
          footer="Published concert listings"
        />
        <StatsCard
          title="Train Journeys"
          value={trains.length}
          footer="Published train journeys"
        />
        <StatsCard
          title="Total"
          value={trains.length + movies.length + concerts.length}
          footer="Total Events & Journeys"
        />
      </div>
    );
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] bg-(--app-bg) px-4 py-10 text-(--app-fg)">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 rounded-3xl border border-(--app-border) bg-(--app-surface) p-8 shadow-2xl shadow-black/30 sm:p-10">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-(--app-muted)">Admin panel</p>
          <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">
            {activeTab === "dashboard"
              ? "Dashboard"
              : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-(--app-muted)">
            Use the tabs below to move between users, vendors, and media sections.
          </p>
        </div>

        {activeTab === "dashboard" && renderDashboard()}
        {(activeTab === "users" || activeTab === "vendors") && renderUsersTable()}
        {activeTab === "requests" && renderPendingRequests()}
        {(activeTab === "movies" || activeTab === "concerts" || activeTab === "trains") &&
          renderCatalogTab()}
      </div>
    </div>
  );
};

export default Admin;