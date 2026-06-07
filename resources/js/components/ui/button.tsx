// resources/js/components/ui/button.tsx

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center border border-transparent bg-clip-padding font-sans text-xs font-medium tracking-[0.2em] uppercase whitespace-nowrap transition-all duration-500 outline-none select-none focus-visible:ring-1 focus-visible:ring-[#D4AF37] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-[#1A1A1A] text-white border-[#1A1A1A] hover:bg-[#D4AF37] hover:border-[#D4AF37] hover:text-white active:translate-y-px",
        outline:
          "bg-transparent text-[#1A1A1A] border-[#1A1A1A]/20 hover:border-[#D4AF37] hover:bg-[#D4AF37]/5 hover:text-[#D4AF37] active:translate-y-px",
        secondary:
          "bg-[#EBE5DE] text-[#1A1A1A] border-[#EBE5DE] hover:bg-[#D4AF37] hover:text-white active:translate-y-px",
        ghost:
          "bg-transparent text-[#1A1A1A] border-transparent hover:bg-[#1A1A1A]/5 hover:text-[#D4AF37] active:translate-y-px",
        destructive:
          "bg-red-50 text-red-600 border-red-200 hover:bg-red-100 hover:border-red-300 active:translate-y-px",
        link:
          "text-[#1A1A1A] underline-offset-4 hover:text-[#D4AF37] hover:underline border-transparent",
      },
      size: {
        default: "h-10 gap-2 px-6 text-[11px]",
        xs: "h-7 gap-1 px-3 text-[9px]",
        sm: "h-8 gap-1.5 px-4 text-[10px]",
        lg: "h-12 gap-2.5 px-8 text-xs",
        icon: "size-10 p-0",
        "icon-xs": "size-7 p-0",
        "icon-sm": "size-8 p-0",
        "icon-lg": "size-12 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
