import { twMerge } from "tailwind-merge";

export default function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={twMerge(
        "w-full rounded-xl border border-white/10 bg-stage-panel px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 transition-all focus:border-stage-mint/50 focus:bg-stage-panel",
        className
      )}
      {...props}
    />
  );
}
