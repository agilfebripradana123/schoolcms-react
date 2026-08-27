import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/index.css";
import { AuthProvider } from "@/features/auth/AuthContext";
import { Toaster } from "sonner";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <Toaster position="bottom-right" richColors closeButton />
      <App />
    </AuthProvider>
  </React.StrictMode>,
);
