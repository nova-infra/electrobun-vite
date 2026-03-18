import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./styles.css";

const container = document.querySelector("#root");

if (!container) {
  throw new Error("Missing #root element.");
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
