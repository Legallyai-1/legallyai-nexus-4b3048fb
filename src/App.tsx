import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { supabase } from "./services/supabase"; // Make sure this file exists
import Home from "./components/Home";
import Hub from "./components/Hub";
import Chat from "./components/Chat";
import ProfileSetup from "./components/ProfileSetup";
import FloatingActions from "./components/FloatingActions";

function AppContent() {
  const [session, setSession] = useState(null);
  const [profileComplete, setProfileComplete] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  useEffect(() => {
    if (session) {
      const checkProfile = async () => {
        const { data } = await supabase.from("profiles").select("role").eq("id", session.user.id).single();
        setProfileComplete(!!data);
        if (!data) navigate("/start");
      };
      checkProfile();
    }
  }, [session, navigate]);

  if (!session) return <div>Loading...</div>; // Or your login screen

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Routes>
        <Route path="/" element={profileComplete ? <Home /> : <Navigate to="/start" />} />
        <Route path="/start" element={<ProfileSetup />} />
        <Route path="/hubs/:hubId" element={<Hub />} />
        <Route path="/hubs/:hubId/chat" element={<Chat />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <FloatingActions />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
