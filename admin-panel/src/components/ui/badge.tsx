import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "warning" | "danger" | "info"
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        {
          "border-transparent bg-[rgb(var(--accent))] text-white": variant === "default",
          "border-transparent bg-[rgb(var(--success))] text-white": variant === "success",
          "border-transparent bg-[rgb(var(--warning))] text-white": variant === "warning",
          "border-transparent bg-[rgb(var(--danger))] text-white": variant === "danger",
          "border-transparent bg-[rgb(var(--info))] text-white": variant === "info",
        },
        className
      )}
      {...props}
    />
  )
}

export { Badge }
