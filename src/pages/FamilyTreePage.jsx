// src/pages/FamilyTreePage.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TreeCanvasWrapper from "../components/tree/TreeCanvas";
import dataService from "../services/dataService";

export default function FamilyTreePage() {
  const { treeId } = useParams();
  const [tree, setTree] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [notFound, setNotFound] = useState(false);

  // Fetch tree data on mount or when treeId changes
  useEffect(() => {
    let mounted = true;
    
    dataService.getTree(treeId).then((t) => {
      if (mounted) {
        setTree(t);
        setLoading(false);
      }
    }).catch(err => {

      console.error("Failed to fetch tree:", err);
      if (mounted) {
        setTree(null); 
        setLoading(false);
      }
    });
    return () => { mounted = false; };
  }, [treeId]);

 

 
  useEffect(() => {
    
    if (!loading && !tree) {
      
      setNotFound(true);
      
      const timer = setTimeout(() => {
        navigate("/create-tree");
      }, 3000); 

      return () => clearTimeout(timer);
    }
  }, [loading, tree, navigate]); 
if (loading) {
  return <div>Loading tree...</div>;
}

if (notFound || !tree) {
  return <div>Tree not found. Redirecting you to the homepage...</div>;
}

return (
  <div style={{ height: "calc(100vh - var(--topbar-height))", width: "100%" }}>
    <TreeCanvasWrapper treeId={tree.id} />
  </div>
);

}