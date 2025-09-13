// src/App.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import "./styles/Colors.css";
import GlobalModals from "./pages/GlobalModals";
import BaseLayout from "./pages/BaseLayout";

function App() {
  return (
    <>
      <GlobalModals />
      <BaseLayout />
      <Outlet />
    </>
  );
}

export default App;
