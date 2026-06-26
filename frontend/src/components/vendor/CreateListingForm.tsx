import React, { useState, useEffect } from "react";

const initialForm = {
  title: "",
  image: "",
  venue: "",
  price: "",
  availableSeats: "100",
  details: "",
};

const categoryMeta = {
  movies: {
    title: "Movie Listings",
    description: "Create new movie entries and keep them visible in the Movies tab for users.",
  },
  train: {
    title: "Train Listings",
    description: "Publish train journeys with departure times, routes, and pricing.",
  },
  concert: {
    title: "Concert Listings",
    description: "Add concert events with venues, dates, and live-show details.",
  },
} as const;

interface CreateListingFormProps {
  category: "movies" | "train" | "concert";
  onSubmit: (data: typeof initialForm) => Promise<void>;
  isSubmitting: boolean;
}

export const CreateListingForm = ({ category, onSubmit, isSubmitting }: CreateListingFormProps) => {
  const [form, setForm] = useState(initialForm);

  // Reset form when category changes
  useEffect(() => {
    setForm(initialForm);
  }, [category]);

  const handleChange = (key: keyof typeof initialForm, value: string) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const handleSubmit = async (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit(form);
    setForm(initialForm); // reset on success
  };

  const meta = categoryMeta[category];

  return (
    <form onSubmit={handleSubmit} className="rounded-3xl border border-(--app-border) bg-(--app-surface-2) p-5 sm:p-6">
      <p className="text-sm uppercase tracking-[0.3em] text-(--app-muted)">Create listing</p>
      <h2 className="mt-3 text-2xl font-semibold">{meta.title}</h2>
      <p className="mt-2 text-sm text-(--app-muted)">{meta.description}</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col space-y-2">
          <span className="text-sm text-(--app-muted)">Title</span>
          <input
            value={form.title}
            onChange={(event) => handleChange("title", event.target.value)}
            required
            className="w-full rounded-2xl border border-(--app-border) bg-(--app-surface) px-4 py-3 text-sm outline-none focus:border-(--app-accent)"
            placeholder="Midnight Premiere"
          />
        </label>

        <label className="flex flex-col space-y-2">
          <span className="text-sm text-(--app-muted)">Image URL</span>
          <input
            value={form.image}
            onChange={(event) => handleChange("image", event.target.value)}
            required
            className="w-full rounded-2xl border border-(--app-border) bg-(--app-surface) px-4 py-3 text-sm outline-none focus:border-(--app-accent)"
            placeholder="/cover-images/1.jpg"
          />
        </label>

        <label className="flex flex-col space-y-2 sm:col-span-2">
          <span className="text-sm text-(--app-muted)">Venue / Route</span>
          <input
            value={form.venue}
            onChange={(event) => handleChange("venue", event.target.value)}
            required
            className="w-full rounded-2xl border border-(--app-border) bg-(--app-surface) px-4 py-3 text-sm outline-none focus:border-(--app-accent)"
            placeholder={category === "train" ? "Delhi to Shimla" : "Arena One, Mumbai"}
          />
        </label>

        <label className="flex flex-col space-y-2">
          <span className="text-sm text-(--app-muted)">Price ($)</span>
          <input
            type="number"
            min={0}
            value={form.price}
            onChange={(event) => handleChange("price", event.target.value)}
            required
            className="w-full rounded-2xl border border-(--app-border) bg-(--app-surface) px-4 py-3 text-sm outline-none focus:border-(--app-accent)"
            placeholder="$12"
          />
        </label>

        <label className="flex flex-col space-y-2">
          <span className="text-sm text-(--app-muted)">Available Seats</span>
          <input
            type="number"
            min={1}
            value={form.availableSeats}
            onChange={(event) => handleChange("availableSeats", event.target.value)}
            required
            className="w-full rounded-2xl border border-(--app-border) bg-(--app-surface) px-4 py-3 text-sm outline-none focus:border-(--app-accent)"
            placeholder="100"
          />
        </label>

        <label className="flex flex-col space-y-2 sm:col-span-2">
          <span className="text-sm text-(--app-muted)">Details</span>
          <textarea
            value={form.details}
            onChange={(event) => handleChange("details", event.target.value)}
            className="min-h-28 w-full rounded-2xl border border-(--app-border) bg-(--app-surface) px-4 py-3 text-sm outline-none focus:border-(--app-accent)"
            placeholder={category === "train" ? "AC 2-tier, 14h 10m, Breakfast included" : "Hindi, 2h 18m, Dolby Atmos"}
          />
        </label>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-6 rounded-full bg-(--app-accent) px-5 py-3 text-sm font-semibold text-(--app-accent-fg) transition-all hover:bg-(--app-accent-hover) disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? "Publishing..." : `Publish ${category}`}
      </button>
    </form>
  );
};
