import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow-sm hover:shadow-glow-md",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border-2 border-neon-cyan/50 bg-transparent text-neon-cyan hover:bg-neon-cyan/10 hover:border-neon-cyan hover:shadow-glow-sm",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent/20 hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        // Futuristic neon variants
        neon: "bg-gradient-to-r from-neon-cyan to-neon-blue text-background font-bold hover:shadow-glow-lg hover:scale-105 transition-all",
        "neon-purple": "bg-gradient-to-r from-neon-purple to-neon-pink text-white font-bold hover:shadow-glow-purple hover:scale-105 transition-all",
        "neon-green": "bg-gradient-to-r from-neon-green to-neon-cyan text-background font-bold hover:shadow-glow-green hover:scale-105 transition-all",
        "neon-outline": "border-2 border-neon-cyan bg-transparent text-neon-cyan hover:bg-neon-cyan/10 hover:shadow-glow-md font-bold",
        glass: "bg-white/5 backdrop-blur-md border border-white/10 text-foreground hover:bg-white/10 hover:border-neon-cyan/30 hover:shadow-glow-sm",
        // Legacy variants
        gold: "bg-section-premium text-background hover:brightness-110 shadow-lg font-bold",
        hero: "bg-gradient-to-r from-neon-cyan to-neon-blue text-background hover:scale-105 shadow-glow-md font-bold text-base transition-transform",
        premium: "bg-gradient-to-r from-section-premium to-neon-orange text-background hover:scale-105 shadow-lg font-bold",
        legal: "bg-card text-neon-cyan border border-neon-cyan/30 hover:bg-neon-cyan/10 shadow-sm font-semibold",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-lg px-3",
        lg: "h-12 rounded-xl px-8 text-base",
        xl: "h-14 rounded-2xl px-10 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
