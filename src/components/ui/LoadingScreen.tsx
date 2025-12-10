import { motion } from "framer-motion";
import { Scale, Sparkles } from "lucide-react";

export function LoadingScreen() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed inset-0 z-[100] bg-background flex items-center justify-center overflow-hidden"
    >
      {/* Background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,212,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,212,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
      
      {/* Radial gradient overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,hsl(var(--background))_70%)]" />
      
      {/* Animated rings */}
      <div className="absolute">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full border border-legal-cyan/20"
            style={{
              width: 200 + i * 100,
              height: 200 + i * 100,
              left: -(100 + i * 50),
              top: -(100 + i * 50),
            }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ 
              scale: [0.8, 1.2, 0.8], 
              opacity: [0.1, 0.3, 0.1],
              rotate: 360 
            }}
            transition={{ 
              duration: 4 + i, 
              repeat: Infinity, 
              ease: "linear",
              delay: i * 0.3 
            }}
          />
        ))}
      </div>

      {/* Main logo container */}
      <div className="relative flex flex-col items-center">
        {/* Glow effect */}
        <motion.div
          className="absolute w-32 h-32 bg-legal-cyan/20 rounded-full blur-3xl"
          animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        
        {/* Logo icon */}
        <motion.div
          className="relative"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
        >
          <div className="relative bg-background/50 p-6 rounded-2xl border border-legal-gold/30 backdrop-blur-sm">
            {/* Inner glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-legal-gold/10 to-transparent rounded-2xl" />
            
            <motion.div
              animate={{ rotateY: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            >
              <Scale className="h-16 w-16 text-legal-gold drop-shadow-[0_0_20px_hsl(var(--legal-gold)/0.5)]" />
            </motion.div>
            
            {/* Sparkles */}
            <motion.div
              className="absolute -top-2 -right-2"
              animate={{ rotate: 360, scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Sparkles className="h-6 w-6 text-legal-cyan" />
            </motion.div>
          </div>
          
          {/* Orbiting dots */}
          <motion.div
            className="absolute inset-0"
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          >
            <div className="absolute -top-2 left-1/2 w-2 h-2 bg-legal-cyan rounded-full shadow-[0_0_10px_hsl(var(--legal-cyan))]" />
          </motion.div>
          <motion.div
            className="absolute inset-0"
            animate={{ rotate: -360 }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          >
            <div className="absolute top-1/2 -right-2 w-1.5 h-1.5 bg-legal-gold rounded-full shadow-[0_0_8px_hsl(var(--legal-gold))]" />
          </motion.div>
        </motion.div>

        {/* Logo text */}
        <motion.div
          className="mt-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h1 className="font-display text-3xl font-bold">
            <span className="text-foreground">Legally</span>
            <span className="text-legal-gold">AI</span>
          </h1>
          <motion.p
            className="text-legal-cyan/70 text-sm mt-2 tracking-widest uppercase"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            Legal Intelligence
          </motion.p>
        </motion.div>

        {/* Loading bar */}
        <motion.div
          className="mt-8 w-48 h-1 bg-muted rounded-full overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <motion.div
            className="h-full bg-gradient-to-r from-legal-cyan via-legal-gold to-legal-cyan rounded-full"
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
      </div>

      {/* Scan line effect */}
      <motion.div
        className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-legal-cyan/50 to-transparent"
        initial={{ top: 0 }}
        animate={{ top: "100%" }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      />
    </motion.div>
  );
}
