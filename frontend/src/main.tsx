
import { createRoot } from "react-dom/client";
import AppProviders from "./app/providers/AppProviders";
import AppRoutes from "./app/routes";
import "./styles/index.css";

createRoot(document.getElementById("root")!).render(
  <AppProviders>
    <AppRoutes />
  </AppProviders>,
);
  
