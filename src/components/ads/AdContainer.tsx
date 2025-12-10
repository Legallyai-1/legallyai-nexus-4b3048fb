import { ReactNode } from "react";

interface AdContainerProps {
  children: ReactNode;
  position?: "top" | "bottom" | "inline";
  className?: string;
}

export default function AdContainer({ children, position = "inline", className = "" }: AdContainerProps) {
  const positionClasses = {
    top: "w-full mb-4",
    bottom: "w-full mt-4",
    inline: "my-4",
  };

  return (
    <div className={`ad-wrapper ${positionClasses[position]} ${className}`}>
      <div className="text-center">
        <span className="text-xs text-muted-foreground/50 block mb-1">Advertisement</span>
        {children}
      </div>
    </div>
  );
}
