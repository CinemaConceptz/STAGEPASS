"use client";

export default function FeedSort({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: any) => void;
}) {
  return (
    <div className="flex items-center gap-2 text-xs" data-testid="feed-sort">
      <span className="text-zinc-500 uppercase tracking-wider font-medium">Sort:</span>
      <select
        className="rounded-lg border border-white/5 bg-stage-panel px-3 py-1.5 text-white text-xs outline-none focus:border-stage-mint/50 appearance-none cursor-pointer hover:bg-white/5 transition-colors"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        data-testid="feed-sort-select"
      >
        <option value="NEWEST">Newest</option>
        <option value="TRENDING">Trending</option>
        <option value="MOST_DISCUSSED">Most Discussed</option>
      </select>
    </div>
  );
}
