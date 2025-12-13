import React from "react";

const hubs = [
  { id: "lee", name: "Lee Legal AI", icon: "👨‍⚖️", greeting: "Hi! I am Lee, your general legal assistant." },
  { id: "custody", name: "CustodiAI", icon: "👨‍👩‍👧‍👦", greeting: "Hi! I am CustodiAI, your child custody specialist." },
  { id: "marriage", name: "MaryAI", icon: "💒", greeting: "Hi! I am MaryAI, your marriage & divorce expert." },
  { id: "defense", name: "DefendAI", icon: "⚖️", greeting: "Hi! I am DefendAI, your criminal defense specialist." },
  { id: "drive", name: "DriveSafeAI", icon: "🚗", greeting: "Hi! I am DriveSafeAI, your DUI defense expert." },
  { id: "freedom", name: "Freedom AI", icon: "🔒", greeting: "Hi! I am Freedom AI, your probation/parole guide." },
  { id: "legacy", name: "LegacyAI", icon: "🏠", greeting: "Hi! I am LegacyAI, your wills & estate planner." },
  { id: "worker", name: "Worker Rights", icon: "👷", greeting: "Hi! I am your worker rights advocate." },
];

export default function App() {
  const url = window.location.pathname;
  const hubId = url.slice(1); // removes leading /
  const currentHub = hubs.find((h) => h.id === hubId);

  if (currentHub) {
    // Hub screen with chat under
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6">
        <button onClick={() => (window.location.href = "/")} className="mb-6 text-blue-400">
          ← Back to Home
        </button>
        <h1 className="text-4xl font-bold text-center mb-8">{currentHub.name}</h1>
        <div className="bg-gray-800 rounded-3xl p-6">
          <div className="bg-gray-700 rounded-2xl p-6 h-96 overflow-y-auto mb-6">
            <div className="text-left">
              <span className="inline-block p-5 rounded-2xl bg-purple-600 text-white shadow-lg">
                {currentHub.greeting}
              </span>
            </div>
          </div>
          <input
            className="w-full p-5 bg-gray-800 rounded-2xl text-white placeholder-gray-400"
            placeholder="Ask me anything..."
          />
        </div>
      </div>
    );
  }

  if (url === "/start") {
    // Where to Start role selection
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-8">
        <h1 className="text-4xl font-bold mb-12">Where to Start</h1>
        <div className="bg-gray-800 p-10 rounded-3xl w-full max-w-md">
          <p className="text-center text-xl mb-8">Choose your role:</p>
          <button
            onClick={() => (window.location.href = "/")}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 py-5 rounded-2xl mb-4 text-2xl shadow-lg"
          >
            Individual
          </button>
          <button
            onClick={() => (window.location.href = "/")}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 py-5 rounded-2xl mb-4 text-2xl shadow-lg"
          >
            Business Owner
          </button>
          <button
            onClick={() => (window.location.href = "/")}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 py-5 rounded-2xl text-2xl shadow-lg"
          >
            Lawyer
          </button>
        </div>
      </div>
    );
  }

  // Home screen
  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-4xl font-bold text-center mb-8">LegallyAI</h1>
      <div className="text-center mb-10">
        <button
          onClick={() => (window.location.href = "/start")}
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl text-xl font-semibold shadow-lg"
        >
          Where to Start
        </button>
      </div>
      <div className="grid grid-cols-2 gap-6">
        {hubs.map((hub) => (
          <button
            onClick={() => (window.location.href = "/" + hub.id)}
            key={hub.id}
            className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-2xl p-8 flex flex-col items-center shadow-2xl border border-gray-700"
          >
            <div className="text-6xl mb-4">{hub.icon}</div>
            <div className="text-center text-lg font-medium">{hub.name}</div>
          </button>
        ))}
      </div>
      {/* Only the Ask Lee floating button */}
      <button className="fixed bottom-24 right-6 bg-gradient-to-r from-teal-500 to-cyan-500 w-20 h-20 rounded-full shadow-2xl flex items-center justify-center text-5xl z-10 animate-pulse">
        📄
      </button>
    </div>
  );
}
