interface StatsCardProps {
  title: string;
  value: string | number;
  footer?: string | number;
}

export const StatsCard = ({ title, value, footer }: StatsCardProps) => {
  return (
    <div className="rounded-2xl border border-(--app-border) bg-(--app-surface-2) p-4">
      <p className="text-xs uppercase tracking-[0.25em] text-(--app-muted)">
        {title}
      </p>
      <p className="mt-2 text-3xl font-semibold text-(--app-fg)">
        {value}
      </p>
      {footer !== undefined && (
        <p className="mt-1 text-sm text-(--app-muted)">
          {footer}
        </p>
      )}
    </div>
  );
};
