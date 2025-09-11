// src/main.jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import "./styles/fonts.css";
import App from "./App.jsx";
import FamilyTreePage from "./pages/FamilyTreePage.jsx";
import RedirectToTree from "./pages/RedirectToTreePage";
import BaseLayout from "./pages/BaseLayout.jsx";
import {  } from "./pages/CreateTreePage.jsx";
import { CreateTreePage } from "./pages/CreateTreePage.jsx";


const router = createBrowserRouter([
  {
    path: "/",
    element: <RedirectToTree />, 
  },
  {
    path: "/family-tree/:treeId",
    element: <BaseLayout />,
  },
  {
    path: "/create-tree",
    element: <CreateTreePage />, 
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
