import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export default function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={twMerge(
        "w-full rounded-xl border border-white/10 bg-stage-bg px-4 py-3 text-sm text-white outline-none placeholder:text-stage-mutetext transition-all focus:border-stage-mint focus:ring-1 focus:ring-stage-mint focus:shadow-glowMint",
        className
      )}
      {...props}
    />
  );
}