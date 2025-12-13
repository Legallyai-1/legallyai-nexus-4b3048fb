import React from "react";
import Home from "@/components/Home";
import FloatingActions from "@/components/FloatingActions";

export default function Index() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Home />
      <FloatingActions />
    </div>
  );
}
