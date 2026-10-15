import type { ButtonHTMLAttributes, Ref } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  ref?: Ref<HTMLButtonElement>;
  variant?: "primary" | "secondary" | "ghost" | "inverse";
  size?: "md" | "sm";
};

const variants = {
  primary: "bg-accent text-accent-foreground shadow-sm hover:bg-[#24598f]",
  secondary: "border border-line bg-panel text-foreground hover:bg-background",
  ghost: "text-foreground hover:bg-foreground/5",
  inverse: "border border-white/20 bg-white/10 text-panel hover:bg-white/20",
};

const sizes = {
  md: "h-11 px-4 text-sm",
  sm: "h-9 px-3 text-xs",
};

export function Button({
  ref,
  variant = "primary",
  size = "md",
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      ref={ref}
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    />
  );
}
