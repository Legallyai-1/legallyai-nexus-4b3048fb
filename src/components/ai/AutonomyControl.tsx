import { useState } from "react";
import { motion } from "framer-motion";
import { Settings2, Zap, User, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type AutonomyLevel = "full" | "assisted" | "manual";

interface AutonomyControlProps {
  level: AutonomyLevel;
  onChange: (level: AutonomyLevel) => void;
  className?: string;
}

const levels = [
  { id: "full" as const, label: "Full Auto", icon: Bot, desc: "AI handles everything autonomously", color: "neon-green" },
  { id: "assisted" as const, label: "Assisted", icon: Zap, desc: "AI suggests, you approve", color: "neon-cyan" },
  { id: "manual" as const, label: "Manual", icon: User, desc: "Full control, AI assists on request", color: "neon-purple" },
];

export function AutonomyControl({ level, onChange, className }: AutonomyControlProps) {
  const [isOpen, setIsOpen] = useState(false);

  const currentLevel = levels.find(l => l.id === level) || levels[1];

  return (
    <div className={cn("relative", className)}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="gap-2 text-muted-foreground hover:text-foreground"
      >
        <Settings2 className="w-4 h-4" />
        <span className="text-xs">{currentLevel.label}</span>
        <span className={`w-2 h-2 rounded-full bg-${currentLevel.color} animate-pulse`} />
      </Button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full right-0 mt-2 w-64 glass-card rounded-xl p-3 border border-border/50 z-50"
        >
          <p className="text-xs text-muted-foreground mb-3 px-2">AI Autonomy Level</p>
          <div className="space-y-2">
            {levels.map((l) => (
              <button
                key={l.id}
                onClick={() => {
                  onChange(l.id);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-lg transition-all",
                  level === l.id
                    ? `bg-${l.color}/20 border border-${l.color}/50`
                    : "hover:bg-muted/50"
                )}
              >
                <l.icon className={`w-5 h-5 text-${l.color}`} />
                <div className="text-left">
                  <p className="text-sm font-medium text-foreground">{l.label}</p>
                  <p className="text-xs text-muted-foreground">{l.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
