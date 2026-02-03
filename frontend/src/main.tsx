
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import AppProviders from "./app/providers/AppProviders";
import AppRoutes from "./app/routes";
import "./styles/index.css";

if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <AppProviders>
      <AppRoutes />
    </AppProviders>
  </BrowserRouter>,
);
  
