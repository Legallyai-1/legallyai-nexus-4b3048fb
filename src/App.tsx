import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import GeneratePage from "./pages/GeneratePage";
import ChatPage from "./pages/ChatPage";
import CustodyPage from "./pages/CustodyPage";
import LawyerPage from "./pages/LawyerPage";
import PricingPage from "./pages/PricingPage";
import SignupPage from "./pages/SignupPage";
import LoginPage from "./pages/LoginPage";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";
import CasesPage from "./pages/CasesPage";
import AppointmentsPage from "./pages/AppointmentsPage";
import MessagesPage from "./pages/MessagesPage";
import TimeClockPage from "./pages/TimeClockPage";
import EmployeePortalPage from "./pages/EmployeePortalPage";
import AdminPage from "./pages/AdminPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/generate" element={<GeneratePage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/custody" element={<CustodyPage />} />
          <Route path="/lawyers" element={<LawyerPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/cases" element={<CasesPage />} />
          <Route path="/appointments" element={<AppointmentsPage />} />
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/timeclock" element={<TimeClockPage />} />
          <Route path="/employee" element={<EmployeePortalPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
