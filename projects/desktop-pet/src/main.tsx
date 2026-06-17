import React from "react";
import { createRoot } from "react-dom/client";
import { PetPreviewSheet } from "./ui/PetPreviewSheet";
import { App } from "./ui/App";
import "./styles.css";

const isPetPreviewView = new URLSearchParams(window.location.search).get("view") === "pet-preview";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {isPetPreviewView ? <PetPreviewSheet /> : <App />}
  </React.StrictMode>
);
