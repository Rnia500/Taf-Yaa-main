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
  },
  {
    path: "/create-tree",
    element: <CreateTreePage />, 
  },
  {
    path: "/deleted-persons",
    element: <DeletedPersonsPage />,
  },
  {
    path: "/deleted-persons/:treeId",
    element: <DeletedPersonsPage />,
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
