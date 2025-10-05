// src/main.jsx
import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider, useNavigate, useLocation } from "react-router-dom";
import "./index.css";
import "./styles/fonts.css";
import "./i18n.js";
import App from "./App.jsx";
import RedirectToTree from "./pages/RedirectToTreePage";
import ExportPage from "./pages/ExportPage.jsx";
import { CreateTreePage } from "./pages/CreateTreePage.jsx";
import DeletedPersonsPage from "./pages/DeletedPersonsPage.jsx";
import NotificationCenter from "./pages/NotificationCenter.jsx";
import SuggestionsPage from "./pages/SuggestionsPage.jsx";
import FamilyTreePage from "./pages/FamilyTreePage.jsx";
import NotificationOverviewPage from "./pages/NotificationOverviewPage.jsx";
import MyTreesPage from "./pages/MyTreesPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";

// Component to handle landing page routing
const LandingRouteWrapper = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (currentUser) {
    // Redirect logged in users to their tree context
    return <RedirectToTree />;
  }

  return children;
};

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
    
    // Final fallback to my-trees if no treeId
    if (!treeId) {
      navigate('/my-trees', { replace: true });
      return;
    }
    
    navigate(`/family-tree/${treeId}${targetPath}`, { replace: true });
  }, [navigate, location.pathname, targetPath]);
  
  return <div>Redirecting...</div>;
};

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <LandingRouteWrapper>
        <LandingPage />
      </LandingRouteWrapper>
    ),
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
        path: "notificationcenter",
        element: <NotificationCenter />,
        children: [
          {
            index: true,
            element: <NotificationOverviewPage />,
          },
          {
            path: "suggestions",
            element: <SuggestionsPage />,
          },
          {
            path: "merge",
            element: <div>Merge Requests Content</div>,
          },
          {
            path: "requests",
            element: <div>Pending Requests Content</div>,
          },
          {
            path: "activity",
            element: <div>Family Activity Content</div>,
          },
        ],
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
    element: <RedirectToNestedRoute targetPath="/notificationcenter" />,
  },
  {
    path: "/suggestions",
    element: <RedirectToNestedRoute targetPath="/suggestions" />,
  },
  {
    path: "/my-trees",
    element: <MyTreesPage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },

]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>
);
