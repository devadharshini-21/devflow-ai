import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import "./index.css";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#1F2937",
            color: "#fff",
            border: "1px solid #374151",
          },
        }}
      />

      <App />

    </BrowserRouter>
  </React.StrictMode>
);