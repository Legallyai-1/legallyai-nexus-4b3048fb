import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { PageTransition } from "@/components/ui/PageTransition";

import Index from "@/pages/Index";
import GeneratePage from "@/pages/GeneratePage";
import ChatPage from "@/pages/ChatPage";
import CustodyPage from "@/pages/CustodyPage";
import LawyerPage from "@/pages/LawyerPage";
import PricingPage from "@/pages/PricingPage";
import SignupPage from "@/pages/SignupPage";
import LoginPage from "@/pages/LoginPage";
import AuthPage from "@/pages/AuthPage";
import DashboardPage from "@/pages/DashboardPage";
import CasesPage from "@/pages/CasesPage";
import AppointmentsPage from "@/pages/AppointmentsPage";
import MessagesPage from "@/pages/MessagesPage";
import TimeClockPage from "@/pages/TimeClockPage";
import EmployeePortalPage from "@/pages/EmployeePortalPage";
import AdminPage from "@/pages/AdminPage";
import TermsPage from "@/pages/TermsPage";
import PrivacyPage from "@/pages/PrivacyPage";
import ClientPortalPage from "@/pages/ClientPortalPage";
import DocumentSigningPage from "@/pages/DocumentSigningPage";
import InvoicesPage from "@/pages/InvoicesPage";
import ConsultationsPage from "@/pages/ConsultationsPage";
import PaymentSuccessPage from "@/pages/PaymentSuccessPage";
import AIAssistantsPage from "@/pages/AIAssistantsPage";
import NotFound from "@/pages/NotFound";

export function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Index /></PageTransition>} />
        <Route path="/generate" element={<PageTransition><GeneratePage /></PageTransition>} />
        <Route path="/chat" element={<PageTransition><ChatPage /></PageTransition>} />
        <Route path="/custody" element={<PageTransition><CustodyPage /></PageTransition>} />
        <Route path="/lawyers" element={<PageTransition><LawyerPage /></PageTransition>} />
        <Route path="/pricing" element={<PageTransition><PricingPage /></PageTransition>} />
        <Route path="/signup" element={<PageTransition><SignupPage /></PageTransition>} />
        <Route path="/login" element={<PageTransition><LoginPage /></PageTransition>} />
        <Route path="/auth" element={<PageTransition><AuthPage /></PageTransition>} />
        <Route path="/dashboard" element={<PageTransition><DashboardPage /></PageTransition>} />
        <Route path="/cases" element={<PageTransition><CasesPage /></PageTransition>} />
        <Route path="/appointments" element={<PageTransition><AppointmentsPage /></PageTransition>} />
        <Route path="/messages" element={<PageTransition><MessagesPage /></PageTransition>} />
        <Route path="/timeclock" element={<PageTransition><TimeClockPage /></PageTransition>} />
        <Route path="/employee" element={<PageTransition><EmployeePortalPage /></PageTransition>} />
        <Route path="/admin" element={<PageTransition><AdminPage /></PageTransition>} />
        <Route path="/terms" element={<PageTransition><TermsPage /></PageTransition>} />
        <Route path="/privacy" element={<PageTransition><PrivacyPage /></PageTransition>} />
        <Route path="/client-portal" element={<PageTransition><ClientPortalPage /></PageTransition>} />
        <Route path="/document-signing" element={<PageTransition><DocumentSigningPage /></PageTransition>} />
        <Route path="/invoices" element={<PageTransition><InvoicesPage /></PageTransition>} />
        <Route path="/consultations" element={<PageTransition><ConsultationsPage /></PageTransition>} />
        <Route path="/payment-success" element={<PageTransition><PaymentSuccessPage /></PageTransition>} />
        <Route path="/ai-assistants" element={<PageTransition><AIAssistantsPage /></PageTransition>} />
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
}
