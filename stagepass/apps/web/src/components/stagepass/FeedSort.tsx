"use client";

export default function FeedSort({
  value,
  onChange
}: {
  value: "NEWEST" | "MOST_DISCUSSED" | "TRENDING";
  onChange: (v: "NEWEST" | "MOST_DISCUSSED" | "TRENDING") => void;
}) {
  return (
    <div className="flex items-center gap-3 text-sm font-medium">
      <span className="text-stage-mutetext uppercase tracking-wider text-xs">Sort:</span>
      <select
        className="rounded-xl border border-white/10 bg-stage-panel px-4 py-2 text-white outline-none focus:border-stage-mint focus:shadow-glowMint transition-all appearance-none cursor-pointer hover:bg-white/5"
        value={value}
        onChange={(e) => onChange(e.target.value as any)}
      >
        <option value="NEWEST">Newest (Chronological)</option>
        <option value="MOST_DISCUSSED">Most Discussed</option>
        <option value="TRENDING">Trending (Disclosed)</option>
      </select>
    </div>
  );
}