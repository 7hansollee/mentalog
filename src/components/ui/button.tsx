import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary-600 text-white hover:bg-primary-700 shadow-md hover:shadow-lg rounded-xl",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl shadow-md hover:shadow-lg",
        outline:
          "border-2 border-primary-300 bg-white text-primary-700 hover:bg-primary-50 hover:border-primary-400 rounded-xl shadow-sm hover:shadow-md",
        secondary:
          "bg-secondary-200 text-secondary-800 hover:bg-secondary-300 rounded-xl shadow-sm hover:shadow-md",
        ghost: "hover:bg-primary-50 hover:text-primary-700 rounded-xl",
        link: "text-primary-600 underline-offset-4 hover:underline hover:text-primary-700",
      },
      size: {
        default: "h-11 px-6 py-2.5 rounded-xl",
        sm: "h-9 px-4 py-2 rounded-lg text-sm",
        lg: "h-13 px-8 py-3 rounded-xl text-base",
        icon: "h-11 w-11 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
