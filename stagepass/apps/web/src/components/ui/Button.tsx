import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import React from "react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
};

export default function Button({ 
  variant = "secondary", 
  size = "md", 
  className, 
  ...props 
}: Props) {
  const base = "inline-flex items-center justify-center rounded-xl font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-stage-mint/50 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-stage-indigo text-white shadow-glowIndigo hover:bg-stage-indigo/90 border border-transparent",
    secondary: "bg-stage-panel text-white border border-white/10 hover:border-white/20 hover:bg-stage-panel2",
    ghost: "bg-transparent text-stage-mutetext hover:text-white hover:bg-white/5",
    destructive: "bg-red-900/50 text-red-200 border border-red-500/20 hover:bg-red-900/70"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base"
  };

  return (
    <button 
      className={twMerge(base, variants[variant], sizes[size], className)} 
      {...props} 
    />
  );
}