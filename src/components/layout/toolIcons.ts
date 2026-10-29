import {
  MessageSquare, FileText, FileSearch, Calculator, BookOpenCheck, LayoutTemplate, Bot, Heart,
  Car, Wine, Shield, Building2, ScrollText, HeartHandshake, Landmark, GraduationCap, HandHeart,
  Scale, Briefcase, LayoutDashboard, FolderOpen, Users, BadgeDollarSign, Headphones, type LucideIcon,
} from "lucide-react";
import type { ToolIconKey } from "@/lib/toolCatalog";

// Icon for each tool catalog entry (shared by the launcher and the home page tiles).
export const TOOL_ICONS: Record<ToolIconKey, LucideIcon> = {
  chat: MessageSquare, generate: FileText, redline: FileSearch, settlement: Calculator, research: BookOpenCheck,
  templates: LayoutTemplate, assistants: Bot, custody: Heart, tickets: Car, dui: Wine, parole: Shield,
  workplace: Building2, will: ScrollText, marriage: HeartHandshake, records: Landmark, academy: GraduationCap,
  probono: HandHeart, lawyer: Scale, business: Briefcase, dashboard: LayoutDashboard, cases: FolderOpen,
  clients: Users, jobs: Briefcase, pricing: BadgeDollarSign, support: Headphones,
};
