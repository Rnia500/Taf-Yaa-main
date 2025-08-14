// src/pages/FamilyTreePage.jsx
import React from 'react';
import TreeCanvasWrapper from '../components/tree/TreeCanvas';

export default function FamilyTreePage() {
  // This page will render your main layout (Navbar, etc.) and the tree canvas.
  // For now, we'll keep it simple.
  
  // We pass the treeId that the user wants to view.
  // In a real app, this might come from the URL or user state.
  const currentTreeId = 'tree001';

  return (
    <div style={{ height: 'calc(100vh - 60px)', width: '100%' }}> 
      {/* Assuming a 60px navbar. Adjust as needed. */}
      {/* <YourNavbarComponent /> */}
      <TreeCanvasWrapper treeId={currentTreeId} />
    </div>
  );
}