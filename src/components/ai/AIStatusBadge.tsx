import { Zap, Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";

type AIStatus = "active" | "listening" | "processing" | "idle";

interface AIStatusBadgeProps {
  status: AIStatus;
  aiName: string;
  className?: string;
}

const statusConfig = {
  active: { color: "neon-green", icon: Zap, label: "Active" },
  listening: { color: "neon-cyan", icon: Bot, label: "Listening" },
  processing: { color: "neon-purple", icon: Bot, label: "Processing" },
  idle: { color: "muted-foreground", icon: User, label: "Idle" },
};

export function AIStatusBadge({ status, aiName, className }: AIStatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <div className={cn(
      "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm",
      `bg-${config.color}/10 border border-${config.color}/30`,
      className
    )}>
      <span className={`w-2 h-2 rounded-full bg-${config.color} ${status !== "idle" ? "animate-pulse" : ""}`} />
      <span className={`text-${config.color} font-medium`}>{aiName}</span>
      <config.icon className={`w-3 h-3 text-${config.color}`} />
    </div>
  );
}
