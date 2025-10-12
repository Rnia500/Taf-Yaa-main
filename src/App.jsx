// src/App.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import "./styles/Colors.css";
import BaseLayout from "./pages/BaseLayout";

function App() {
  return (
    <>
      <BaseLayout />
    </>
  );
}

export default App;
