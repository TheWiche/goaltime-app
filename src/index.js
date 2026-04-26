/**
=========================================================
* GoalTime App - v2.2.0
=========================================================

* Product Page: https://www.goaltime.site/product/material-dashboard-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "app/App";

// GoalTime App Context Provider
import { MaterialUIControllerProvider } from "shared/context";
import { AuthProvider } from "shared/context/AuthContext";

const container = document.getElementById("app");
const root = createRoot(container);

root.render(
  <BrowserRouter>
    <MaterialUIControllerProvider>
      <AuthProvider>
        {" "}
        <App />
      </AuthProvider>
    </MaterialUIControllerProvider>
  </BrowserRouter>
);
