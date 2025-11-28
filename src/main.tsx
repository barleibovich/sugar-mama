import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles.css";
import { MeasurementProvider } from "./context/MeasurementProvider";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <MeasurementProvider>
      <App />
    </MeasurementProvider>
  </React.StrictMode>
);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/service-worker.js").catch((err) => {
      console.error("Service worker registration failed:", err);
    });
  });
}
