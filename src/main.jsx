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
import ExportPage from "./pages/ExportPage.jsx";
import { CreateTreePage } from "./pages/CreateTreePage.jsx";
import DeletedPersonsPage from "./pages/DeletedPersonsPage.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RedirectToTree />, 
  },
  {
    path: "/family-tree/:treeId",
    element: <App />,
    children: [
      {
        path: "deleted-persons",
        element: <DeletedPersonsPage />,
      },
      {
        path: "export",
        element: <ExportPage />,
      },

    ],
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
