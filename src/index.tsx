import React from "react";
import { createRoot } from "react-dom/client"; // Importación correcta para React 18
import "./index.css";
import App from "./App";
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";

// Obtenemos el elemento root
const container = document.getElementById("root");
// Creamos el root de React 18
const root = createRoot(container!);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Registro del Service Worker
serviceWorkerRegistration.register({
onUpdate: async (registration: ServiceWorkerRegistration) => {    if (registration && registration.waiting) {
      await registration.unregister();
      registration.waiting.postMessage({ type: "SKIP_WAITING" });
      window.location.reload();
    }
  },
});