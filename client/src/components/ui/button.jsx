import { cn } from "../../lib/utils"

export function Button({ 
  className, 
  variant = "default", 
  size = "default", 
  children, 
  ...props 
}) {
  const variants = {
    default: "bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 text-white hover:from-purple-700 hover:via-blue-700 hover:to-pink-700 shadow-lg shadow-purple-500/50",
    outline: "border-2 border-purple-500 text-purple-400 hover:bg-purple-500/10",
    ghost: "hover:bg-white/10 text-white",
    glass: "glass text-white hover:bg-white/10",
  }

  const sizes = {
    default: "px-6 py-3 text-base",
    sm: "px-4 py-2 text-sm",
    lg: "px-8 py-4 text-lg",
    icon: "p-2",
  }

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-300",
        "focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-background",
        "disabled:opacity-50 disabled:pointer-events-none",
        "transform hover:scale-105 active:scale-95",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

