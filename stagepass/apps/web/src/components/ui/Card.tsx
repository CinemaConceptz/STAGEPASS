import { twMerge } from "tailwind-merge";

export default function Card({
  children,
  className,
  hoverEffect = false,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={twMerge(
      "rounded-2xl border border-white/5 bg-stage-panel p-5 relative overflow-hidden",
      hoverEffect && "transition-all duration-200 hover:border-stage-indigo/30 hover:bg-white/[0.02]",
      className
    )} {...props}>
      {children}
    </div>
  );
}
