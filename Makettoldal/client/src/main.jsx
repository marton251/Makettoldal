import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AdatProvider } from "./context/AdatContext";
import { AuthProvider } from "./context/AuthContext";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <AdatProvider>
          <App />
        </AdatProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
