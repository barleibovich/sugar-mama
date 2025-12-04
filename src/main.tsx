import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles.css";
import { MeasurementProvider } from "./context/MeasurementProvider";
import { AuthProvider } from "./context/AuthProvider";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <AuthProvider>
      <MeasurementProvider>
        <App />
      </MeasurementProvider>
    </AuthProvider>
  </React.StrictMode>
);
const ENABLE_SW = import.meta.env.VITE_ENABLE_SW === "true";

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.getRegistrations().then((regs) => regs.forEach((reg) => reg.unregister()));
    if ("caches" in window) {
      caches
        .keys()
        .then((keys) => keys.filter((key) => key.startsWith("sugarmama-cache")).forEach((key) => caches.delete(key)));
    }

    if (ENABLE_SW) {
      navigator.serviceWorker.register("/service-worker.js").catch((err) => {
        console.error("Service worker registration failed:", err);
      });
    }
  });
}
