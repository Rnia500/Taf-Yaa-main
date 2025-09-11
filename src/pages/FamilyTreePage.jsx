// src/pages/FamilyTreePage.jsx
import React from "react";
import { useParams } from "react-router-dom";
import TreeCanvasWrapper from "../components/tree/TreeCanvas";

export default function FamilyTreePage() {
  const { treeId } = useParams(); 
  const currentTreeId = treeId || "tree001"; // fallback if none provided

  return (
    <div style={{ height: "calc(100vh - 60px)", width: "100%" }}>
      {/* Assuming a 60px navbar. Adjust as needed. */}
      <TreeCanvasWrapper treeId={currentTreeId} />
    </div>
  );
}
