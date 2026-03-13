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
      "rounded-xl2 border border-white/10 bg-stage-panel p-5 relative overflow-hidden",
      hoverEffect && "transition-all duration-300 hover:border-stage-indigo/30 hover:shadow-glowIndigo hover:-translate-y-1",
      className
    )} {...props}>
      {children}
    </div>
  );
}
