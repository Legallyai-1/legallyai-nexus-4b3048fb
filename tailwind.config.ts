import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        display: ['Orbitron', 'Space Grotesk', 'monospace'],
        body: ['Inter', 'Space Grotesk', 'system-ui', 'sans-serif'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Neon colors
        neon: {
          cyan: "hsl(var(--neon-cyan))",
          blue: "hsl(var(--neon-blue))",
          purple: "hsl(var(--neon-purple))",
          pink: "hsl(var(--neon-pink))",
          green: "hsl(var(--neon-green))",
          orange: "hsl(var(--neon-orange))",
        },
        // Section accent colors
        section: {
          home: "hsl(var(--section-home))",
          chat: "hsl(var(--section-chat))",
          custody: "hsl(var(--section-custody))",
          lawyers: "hsl(var(--section-lawyers))",
          clients: "hsl(var(--section-clients))",
          employees: "hsl(var(--section-employees))",
          templates: "hsl(var(--section-templates))",
          premium: "hsl(var(--section-premium))",
        },
        // Legacy legal colors
        legal: {
          navy: "hsl(var(--legal-navy))",
          gold: "hsl(var(--legal-gold))",
          cyan: "hsl(var(--legal-cyan))",
          slate: "hsl(var(--legal-slate))",
          cream: "hsl(var(--legal-cream))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "calc(var(--radius) + 4px)",
        "2xl": "calc(var(--radius) + 8px)",
      },
      boxShadow: {
        'glow-sm': '0 0 10px hsl(var(--neon-cyan) / 0.3)',
        'glow-md': '0 0 20px hsl(var(--neon-cyan) / 0.4), 0 0 40px hsl(var(--neon-cyan) / 0.2)',
        'glow-lg': '0 0 30px hsl(var(--neon-cyan) / 0.5), 0 0 60px hsl(var(--neon-cyan) / 0.3), 0 0 90px hsl(var(--neon-cyan) / 0.1)',
        'glow-purple': '0 0 20px hsl(var(--neon-purple) / 0.4), 0 0 40px hsl(var(--neon-purple) / 0.2)',
        'glow-pink': '0 0 20px hsl(var(--neon-pink) / 0.4), 0 0 40px hsl(var(--neon-pink) / 0.2)',
        'glow-green': '0 0 20px hsl(var(--neon-green) / 0.4), 0 0 40px hsl(var(--neon-green) / 0.2)',
        'inner-glow': 'inset 0 0 20px hsl(var(--neon-cyan) / 0.1)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(var(--tw-gradient-stops))',
        'cyber-grid': `
          linear-gradient(hsl(var(--neon-cyan) / 0.03) 1px, transparent 1px),
          linear-gradient(90deg, hsl(var(--neon-cyan) / 0.03) 1px, transparent 1px)
        `,
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 20px hsl(var(--neon-cyan) / 0.3)" },
          "50%": { boxShadow: "0 0 40px hsl(var(--neon-cyan) / 0.5)" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "glow-pulse": {
          "0%, 100%": { opacity: "0.5" },
          "50%": { opacity: "1" },
        },
        "orbit": {
          "0%": { transform: "rotate(0deg) translateX(30px) rotate(0deg)" },
          "100%": { transform: "rotate(360deg) translateX(30px) rotate(-360deg)" },
        },
        "scan-line": {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "float": "float 6s ease-in-out infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
        "orbit": "orbit 10s linear infinite",
        "scan-line": "scan-line 3s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
