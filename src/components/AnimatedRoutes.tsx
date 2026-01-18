import { lazy, Suspense } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { PageTransition } from "@/components/ui/PageTransition";
import { Loader2 } from "lucide-react";

// Eagerly load critical pages for better UX
import Index from "@/pages/Index";
import LoginPage from "@/pages/LoginPage";
import SignupPage from "@/pages/SignupPage";
import AuthPage from "@/pages/AuthPage";

// Lazy load all other pages
const GeneratePage = lazy(() => import("@/pages/GeneratePage"));
const ChatPage = lazy(() => import("@/pages/ChatPage"));
const CustodyPage = lazy(() => import("@/pages/CustodyPage"));
const LawyerPage = lazy(() => import("@/pages/LawyerPage"));
const PricingPage = lazy(() => import("@/pages/PricingPage"));
const ForgotPasswordPage = lazy(() => import("@/pages/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("@/pages/ResetPasswordPage"));
const DashboardPage = lazy(() => import("@/pages/DashboardPage"));
const CasesPage = lazy(() => import("@/pages/CasesPage"));
const ClientsPage = lazy(() => import("@/pages/ClientsPage"));
const SettingsPage = lazy(() => import("@/pages/SettingsPage"));
const AppointmentsPage = lazy(() => import("@/pages/AppointmentsPage"));
const MessagesPage = lazy(() => import("@/pages/MessagesPage"));
const TimeClockPage = lazy(() => import("@/pages/TimeClockPage"));
const EmployeePortalPage = lazy(() => import("@/pages/EmployeePortalPage"));
const AdminPage = lazy(() => import("@/pages/AdminPage"));
const TermsPage = lazy(() => import("@/pages/TermsPage"));
const PrivacyPage = lazy(() => import("@/pages/PrivacyPage"));
const ClientPortalPage = lazy(() => import("@/pages/ClientPortalPage"));
const DocumentSigningPage = lazy(() => import("@/pages/DocumentSigningPage"));
const InvoicesPage = lazy(() => import("@/pages/InvoicesPage"));
const ConsultationsPage = lazy(() => import("@/pages/ConsultationsPage"));
const PaymentSuccessPage = lazy(() => import("@/pages/PaymentSuccessPage"));
const AIAssistantsPage = lazy(() => import("@/pages/AIAssistantsPage"));
const OnboardingPage = lazy(() => import("@/pages/OnboardingPage"));
const PayrollPage = lazy(() => import("@/pages/PayrollPage"));
const JobBoardPage = lazy(() => import("@/pages/JobBoardPage"));
const WorkplaceLegalAidPage = lazy(() => import("@/pages/WorkplaceLegalAidPage"));
const ProBonoPage = lazy(() => import("@/pages/ProBonoPage"));
const DocumentTemplatesPage = lazy(() => import("@/pages/DocumentTemplatesPage"));
const TicketsDefensePage = lazy(() => import("@/pages/TicketsDefensePage"));
const ProbationParolePage = lazy(() => import("@/pages/ProbationParolePage"));
const LegalAcademyPage = lazy(() => import("@/pages/LegalAcademyPage"));
const QuizPage = lazy(() => import("@/pages/QuizPage"));
const TelephonyPage = lazy(() => import("@/pages/TelephonyPage"));
const CustomerSupportPage = lazy(() => import("@/pages/CustomerSupportPage"));
const MonetizationPage = lazy(() => import("@/pages/MonetizationPage"));
const CourtRecordsPage = lazy(() => import("@/pages/CourtRecordsPage"));
const BusinessHubPage = lazy(() => import("@/pages/BusinessHubPage"));
const DUIHubPage = lazy(() => import("@/pages/DUIHubPage"));
const WillHubPage = lazy(() => import("@/pages/WillHubPage"));
const MarriageDivorcePage = lazy(() => import("@/pages/MarriageDivorcePage"));
const EnhancedCustodyPage = lazy(() => import("@/pages/EnhancedCustodyPage"));
const EnhancedParolePage = lazy(() => import("@/pages/EnhancedParolePage"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const StoreAssetsPage = lazy(() => import("@/pages/StoreAssetsPage"));
const TestingPage = lazy(() => import("@/pages/TestingPage"));
const NotificationsPage = lazy(() => import("@/pages/NotificationsPage"));

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

export function AnimatedRoutes() {
  const location = useLocation();

  // Helper to wrap lazy-loaded components
  const LazyRoute = ({ children }: { children: React.ReactNode }) => (
    <Suspense fallback={<LoadingFallback />}>{children}</Suspense>
  );

  return (
    <AnimatePresence mode="sync">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Index /></PageTransition>} />
        <Route path="/generate" element={<PageTransition><LazyRoute><GeneratePage /></LazyRoute></PageTransition>} />
        <Route path="/chat" element={<PageTransition><LazyRoute><ChatPage /></LazyRoute></PageTransition>} />
        <Route path="/custody" element={<PageTransition><LazyRoute><CustodyPage /></LazyRoute></PageTransition>} />
        <Route path="/enhanced-custody" element={<PageTransition><LazyRoute><EnhancedCustodyPage /></LazyRoute></PageTransition>} />
        <Route path="/lawyers" element={<PageTransition><LazyRoute><LawyerPage /></LazyRoute></PageTransition>} />
        <Route path="/pricing" element={<PageTransition><LazyRoute><PricingPage /></LazyRoute></PageTransition>} />
        <Route path="/signup" element={<PageTransition><SignupPage /></PageTransition>} />
        <Route path="/login" element={<PageTransition><LoginPage /></PageTransition>} />
        <Route path="/auth" element={<PageTransition><AuthPage /></PageTransition>} />
        <Route path="/forgot-password" element={<PageTransition><LazyRoute><ForgotPasswordPage /></LazyRoute></PageTransition>} />
        <Route path="/reset-password" element={<PageTransition><LazyRoute><ResetPasswordPage /></LazyRoute></PageTransition>} />
        <Route path="/dashboard" element={<PageTransition><LazyRoute><DashboardPage /></LazyRoute></PageTransition>} />
        <Route path="/cases" element={<PageTransition><LazyRoute><CasesPage /></LazyRoute></PageTransition>} />
        <Route path="/clients" element={<PageTransition><LazyRoute><ClientsPage /></LazyRoute></PageTransition>} />
        <Route path="/settings" element={<PageTransition><LazyRoute><SettingsPage /></LazyRoute></PageTransition>} />
        <Route path="/appointments" element={<PageTransition><LazyRoute><AppointmentsPage /></LazyRoute></PageTransition>} />
        <Route path="/messages" element={<PageTransition><LazyRoute><MessagesPage /></LazyRoute></PageTransition>} />
        <Route path="/timeclock" element={<PageTransition><LazyRoute><TimeClockPage /></LazyRoute></PageTransition>} />
        <Route path="/employee" element={<PageTransition><LazyRoute><EmployeePortalPage /></LazyRoute></PageTransition>} />
        <Route path="/admin" element={<PageTransition><LazyRoute><AdminPage /></LazyRoute></PageTransition>} />
        <Route path="/terms" element={<PageTransition><LazyRoute><TermsPage /></LazyRoute></PageTransition>} />
        <Route path="/privacy" element={<PageTransition><LazyRoute><PrivacyPage /></LazyRoute></PageTransition>} />
        <Route path="/client-portal" element={<PageTransition><LazyRoute><ClientPortalPage /></LazyRoute></PageTransition>} />
        <Route path="/document-signing" element={<PageTransition><LazyRoute><DocumentSigningPage /></LazyRoute></PageTransition>} />
        <Route path="/invoices" element={<PageTransition><LazyRoute><InvoicesPage /></LazyRoute></PageTransition>} />
        <Route path="/consultations" element={<PageTransition><LazyRoute><ConsultationsPage /></LazyRoute></PageTransition>} />
        <Route path="/payment-success" element={<PageTransition><LazyRoute><PaymentSuccessPage /></LazyRoute></PageTransition>} />
        <Route path="/ai-assistants" element={<PageTransition><LazyRoute><AIAssistantsPage /></LazyRoute></PageTransition>} />
        <Route path="/onboarding" element={<PageTransition><LazyRoute><OnboardingPage /></LazyRoute></PageTransition>} />
        <Route path="/payroll" element={<PageTransition><LazyRoute><PayrollPage /></LazyRoute></PageTransition>} />
        <Route path="/jobs" element={<PageTransition><LazyRoute><JobBoardPage /></LazyRoute></PageTransition>} />
        <Route path="/job-board" element={<PageTransition><LazyRoute><JobBoardPage /></LazyRoute></PageTransition>} />
        <Route path="/workplace-legal-aid" element={<PageTransition><LazyRoute><WorkplaceLegalAidPage /></LazyRoute></PageTransition>} />
        <Route path="/pro-bono" element={<PageTransition><LazyRoute><ProBonoPage /></LazyRoute></PageTransition>} />
        <Route path="/templates" element={<PageTransition><LazyRoute><DocumentTemplatesPage /></LazyRoute></PageTransition>} />
        <Route path="/tickets-defense" element={<PageTransition><LazyRoute><TicketsDefensePage /></LazyRoute></PageTransition>} />
        <Route path="/probation-parole" element={<PageTransition><LazyRoute><ProbationParolePage /></LazyRoute></PageTransition>} />
        <Route path="/enhanced-parole" element={<PageTransition><LazyRoute><EnhancedParolePage /></LazyRoute></PageTransition>} />
        <Route path="/legal-academy" element={<PageTransition><LazyRoute><LegalAcademyPage /></LazyRoute></PageTransition>} />
        <Route path="/quiz" element={<PageTransition><LazyRoute><QuizPage /></LazyRoute></PageTransition>} />
        <Route path="/telephony" element={<PageTransition><LazyRoute><TelephonyPage /></LazyRoute></PageTransition>} />
        <Route path="/support" element={<PageTransition><LazyRoute><CustomerSupportPage /></LazyRoute></PageTransition>} />
        <Route path="/monetization" element={<PageTransition><LazyRoute><MonetizationPage /></LazyRoute></PageTransition>} />
        <Route path="/court-records" element={<PageTransition><LazyRoute><CourtRecordsPage /></LazyRoute></PageTransition>} />
        <Route path="/business-hub" element={<PageTransition><LazyRoute><BusinessHubPage /></LazyRoute></PageTransition>} />
        <Route path="/dui-hub" element={<PageTransition><LazyRoute><DUIHubPage /></LazyRoute></PageTransition>} />
        <Route path="/will-hub" element={<PageTransition><LazyRoute><WillHubPage /></LazyRoute></PageTransition>} />
        <Route path="/marriage-divorce" element={<PageTransition><LazyRoute><MarriageDivorcePage /></LazyRoute></PageTransition>} />
        <Route path="/store-assets" element={<PageTransition><LazyRoute><StoreAssetsPage /></LazyRoute></PageTransition>} />
        <Route path="/testing" element={<PageTransition><LazyRoute><TestingPage /></LazyRoute></PageTransition>} />
        <Route path="/notifications" element={<PageTransition><LazyRoute><NotificationsPage /></LazyRoute></PageTransition>} />
        <Route path="*" element={<PageTransition><LazyRoute><NotFound /></LazyRoute></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
}
