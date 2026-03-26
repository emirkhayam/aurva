import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-[rgb(var(--accent))] text-white hover:bg-[rgb(var(--accent-hover))] shadow-aurva": variant === "default",
            "bg-[rgb(var(--danger))] text-white hover:bg-[rgb(var(--danger))]/90": variant === "destructive",
            "border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] hover:bg-[rgb(var(--bg-card-hover))]": variant === "outline",
            "bg-[rgb(var(--bg-surface))] text-[rgb(var(--text))] hover:bg-[rgb(var(--bg-surface))]/80": variant === "secondary",
            "hover:bg-[rgb(var(--bg-surface))] hover:text-[rgb(var(--text))]": variant === "ghost",
            "text-[rgb(var(--accent))] underline-offset-4 hover:underline": variant === "link",
            "h-10 px-4 py-2": size === "default",
            "h-9 rounded-md px-3": size === "sm",
            "h-11 rounded-md px-8": size === "lg",
            "h-10 w-10": size === "icon",
          },
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
