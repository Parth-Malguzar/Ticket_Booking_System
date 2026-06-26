import { useState } from "react";

interface SeatGridProps {
  onClose: () => void;
  totalSeats: number;
  occupiedSeats: number[];
  initialSelectedSeats: number[];
  onConfirm: (selectedSeats: number[]) => void;
}

export default function SeatGrid({
  onClose,
  totalSeats,
  occupiedSeats,
  initialSelectedSeats,
  onConfirm,
}: SeatGridProps) {
  // Store the array of selected seat numbers
  const [selectedSeats, setSelectedSeats] = useState<number[]>(initialSelectedSeats);

  const seatsArray = Array.from({ length: totalSeats }, (_, i) => i + 1);

  const toggleSeat = (seat: number) => {
    // If the seat is occupied by another booking, ignore clicks
    if (occupiedSeats.includes(seat)) return;

    setSelectedSeats((prev) =>
      prev.includes(seat)
        ? prev.filter((s) => s !== seat)
        : [...prev, seat]
    );
  };

  const handleConfirm = () => {
    onConfirm(selectedSeats);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
      <div className="relative flex flex-col max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-3xl border border-(--app-border) bg-(--app-surface) shadow-2xl p-6 md:p-8 animate-scale-in">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-(--app-border) pb-4">
          <div>
            <h3 className="text-xl font-bold text-(--app-fg)">Select Seats</h3>
            <p className="text-xs text-(--app-muted) mt-1">
              Choose your preferred seating arrangement.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-(--app-muted) hover:bg-(--app-surface-hover) hover:text-(--app-fg) transition-all"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Stage/Screen Indicator */}
        <div className="my-6 flex flex-col items-center">
          <div className="w-2/3 h-1.5 rounded-full bg-gradient-to-r from-transparent via-(--app-accent) to-transparent opacity-60 shadow-[0_4px_12px_rgba(var(--app-accent-rgb),0.5)]"></div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-(--app-muted) mt-2 font-semibold">
            Screen / Stage
          </span>
        </div>

        {/* Legend */}
        <div className="flex justify-center gap-6 mb-6 text-xs font-medium text-(--app-muted)">
          <div className="flex items-center gap-2">
            <span className="h-4 w-4 rounded bg-(--app-surface-2) border border-(--app-border)"></span>
            <span>Available</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-4 w-4 rounded bg-(--app-accent) border border-(--app-accent)"></span>
            <span className="text-(--app-fg)">Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-4 w-4 rounded bg-red-500/20 border border-red-500/30"></span>
            <span>Occupied</span>
          </div>
        </div>

        {/* Seats Grid */}
        <div className="flex-1 overflow-y-auto pr-1">
          <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-3 justify-items-center py-2">
            {seatsArray.map((seat) => {
              const isOccupied = occupiedSeats.includes(seat);
              const isSelected = selectedSeats.includes(seat);
              
              return (
                <button
                  key={seat}
                  disabled={isOccupied}
                  onClick={() => toggleSeat(seat)}
                  className={`relative flex h-10 w-10 items-center justify-center rounded-xl text-xs font-semibold transition-all duration-200 ${
                    isOccupied
                      ? "bg-red-500/10 border border-red-500/20 text-red-500/40 cursor-not-allowed"
                      : isSelected
                      ? "bg-(--app-accent) text-(--app-accent-fg) shadow-lg shadow-(--app-accent)/20 active:scale-90"
                      : "bg-(--app-surface-2) border border-(--app-border) text-(--app-fg) hover:bg-(--app-surface-hover) hover:border-(--app-muted) active:scale-90"
                  }`}
                >
                  {seat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Summary */}
        <div className="mt-6 border-t border-(--app-border) pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <span className="text-xs text-(--app-muted) font-semibold uppercase tracking-wider block">
              Selected Seats
            </span>
            <span className="text-xl font-extrabold text-(--app-fg)">
              {selectedSeats.length > 0
                ? selectedSeats.sort((a, b) => a - b).join(", ")
                : "None"}
            </span>
          </div>

          <div className="flex gap-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none rounded-xl border border-(--app-border) bg-(--app-surface) hover:bg-(--app-surface-hover) px-5 py-3 text-sm font-semibold text-(--app-fg) transition-all active:scale-[0.98]"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 sm:flex-none rounded-xl bg-(--app-accent) hover:bg-(--app-accent-hover) px-6 py-3 text-sm font-semibold text-(--app-accent-fg) transition-all shadow-lg shadow-(--app-accent)/10 active:scale-[0.98]"
            >
              Confirm
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}