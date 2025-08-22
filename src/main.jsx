import React from 'react'
import ReactDom from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'


import './index.css'
import App from './App.jsx'
import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'
import Join from './pages/Join.jsx'
import Create from './pages/Create.jsx'
import Settings from './pages/Settings.jsx'
// import { MyAppNav } from './pages/MyAppNav.jsx'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/signup',
    element: <Signup />,
  },
  {
    path: '/create',
    element: <Create />,
  },
  {
    path: '/join',
    element: <Join />,
  },
  {
    path: '/settings',
    element: <Settings />,
  },
  // {
  //   path: '/myappnav',
  //   element: <MyAppNav />,
  // },
])

ReactDom.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
