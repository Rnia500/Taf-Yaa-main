// src/App.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import "./styles/Colors.css";
import BaseLayout from "./pages/BaseLayout";
import GlobalModals from "./pages/GlobalModals";

function App() {
  return (
    <>
      <BaseLayout />
      <GlobalModals />
      <Outlet /> {/* <-- This is where FamilyTreePage will render */}
    </>
  );
}

export default App;
