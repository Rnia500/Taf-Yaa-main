// src/main.jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import "./styles/fonts.css";
import App from "./App.jsx";
import RedirectToTree from "./pages/RedirectToTreePage";
import ExportPage from "./pages/ExportPage.jsx";
import { CreateTreePage } from "./pages/CreateTreePage.jsx";
import DeletedPersonsPage from "./pages/DeletedPersonsPage.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RedirectToTree />,
  },
  {
    path: "/base",
    element: <App />,
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
      {
       path: "/notifications",
       element: <NotificationsPage />,
      },
      {
       path: "/suggestions",
       element: <SuggestionsPage />,
      },
      
    ],
  },
  {
    path: "/create-tree",
    element: <CreateTreePage />, 
  },
  {
    path: "/members",
    element: <App />,
  },

  {
    path: "/settings",
    element: <App />,
  },
  {
    path: "/language",
    element: <App />,
  },
  {
    path: "/deleted-persons",
    element: <DeletedPersonsPage />,
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
