import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import ThemeContextWrapper from "./context/ThemeContextWrapper.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { BrowserRouter } from "react-router-dom";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    
    <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
      <ThemeContextWrapper>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ThemeContextWrapper>
    </BrowserRouter>

  </React.StrictMode>
);
