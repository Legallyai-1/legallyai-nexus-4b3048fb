import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div className="p-8 text-red-500">
      <h2>Something went wrong</h2>
      <pre>{error.message}</pre>
      <button onClick={resetErrorBoundary} className="bg-blue-600 px-4 py-2 mt-4 rounded">
        Retry
      </button>
    </div>
  );
}

const root = createRoot(document.getElementById("root")!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

// Note: If you want full ErrorBoundary later, add react-error-boundary package
