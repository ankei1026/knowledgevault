// resources/js/components/ui/input.tsx

import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // Luxury/Editorial styling - no rounded corners, clean borders
        "w-full border-b border-[#1A1A1A]/20 bg-transparent px-0 py-2 font-sans text-sm transition-all duration-500",
        "placeholder:text-[#6C6863] placeholder:italic placeholder:font-sans",
        "focus:border-[#D4AF37] focus:outline-none",
        "disabled:cursor-not-allowed disabled:opacity-50",
        // Remove default styling
        "focus-visible:ring-0 focus-visible:ring-offset-0",
        // Hover effect
        "hover:border-[#D4AF37]/50",
        className
      )}
      {...props}
    />
  )
}

export { Input }
