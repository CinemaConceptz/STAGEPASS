import { twMerge } from "tailwind-merge";

const variants = {
  primary: "bg-stage-mint text-black font-bold hover:bg-stage-mint/90 shadow-glowMint",
  secondary: "border border-white/10 bg-white/5 text-white hover:bg-white/10",
  destructive: "bg-red-600 text-white font-bold hover:bg-red-700",
};

const sizes = {
  sm: "px-3 py-1.5 text-xs rounded-lg",
  md: "px-5 py-2.5 text-sm rounded-xl",
  lg: "px-6 py-3 text-sm rounded-xl",
};

export default function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={twMerge(
        "inline-flex items-center justify-center transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
}
