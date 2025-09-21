// src/main.jsx
import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider, useNavigate, useLocation } from "react-router-dom";
import "./index.css";
import "./styles/fonts.css";
import App from "./App.jsx";
import RedirectToTree from "./pages/RedirectToTreePage";
import ExportPage from "./pages/ExportPage.jsx";
import { CreateTreePage } from "./pages/CreateTreePage.jsx";
import DeletedPersonsPage from "./pages/DeletedPersonsPage.jsx";
import NotificationsPage from "./pages/NotificationsPage.jsx";
import SuggestionsPage from "./pages/SuggestionsPage.jsx";
import FamilyTreePage from "./pages/FamilyTreePage.jsx";

// Component to redirect to proper nested routes
const RedirectToNestedRoute = ({ targetPath }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    // Try to get treeId from URL first
    const pathMatch = location.pathname.match(/\/family-tree\/([^\/]+)/);
    let treeId = pathMatch ? pathMatch[1] : null;
    
    // If not in URL, try to get from localStorage
    if (!treeId) {
      treeId = localStorage.getItem('currentTreeId');
    }
    
    // Final fallback
    if (!treeId) {
      treeId = 'tree001';
    }
    
    navigate(`/family-tree/${treeId}${targetPath}`, { replace: true });
  }, [navigate, location.pathname, targetPath]);
  
  return <div>Redirecting...</div>;
};

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
        index: true,
        element: <FamilyTreePage />,
      },
      {
        path: "deleted-persons",
        element: <DeletedPersonsPage />,
      },
      {
        path: "export",
        element: <ExportPage />,
      },
      {
        path: "notifications",
        element: <NotificationsPage />,
      },
      {
        path: "suggestions",
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
    path: "/notifications",
    element: <RedirectToNestedRoute targetPath="/notifications" />,
  },
  {
    path: "/suggestions", 
    element: <RedirectToNestedRoute targetPath="/suggestions" />,
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
