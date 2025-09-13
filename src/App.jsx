// src/App.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import "./styles/Colors.css";
import GlobalModals from "./pages/GlobalModals";

function App() {
  return (
    <>
      <GlobalModals />
      <Outlet />
    </>
  );
}

export default App;
