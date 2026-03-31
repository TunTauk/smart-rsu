import * as React from "react"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "default", ...props }, ref) => {
    
    // Base styles
    const baseStyles = "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
    
    // Variant styles
    const variants = {
      default: "bg-[#171717] text-[#fafafa] shadow-sm hover:bg-[#171717]/90",
      outline: "border border-[#e5e5e5] bg-white shadow-sm hover:bg-[#f5f5f5] text-[#0a0a0a]"
    }

    // Size styles (fixed to 'large' from design: padding [8, 24], height fits content)
    const sizes = "py-2 px-6"

    return (
      <button
        className={`${baseStyles} ${variants[variant]} ${sizes} ${className}`}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
