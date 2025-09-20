import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import dataService from "../services/dataService"; 
export default function RedirectToTree() {
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAndRedirect = async () => {
      try {
        const latestTree = await dataService.getUserLatestTree();
        const treeId = latestTree?.id || "tree001"; 
        navigate(`/family-tree/${treeId}`, { replace: true });
      } catch (err) {
        console.error("RedirectToTree failed:", err);
        navigate("/create-tree", { replace: true });
      }
    };

    fetchAndRedirect();
  }, [navigate]);

  return <div>Loading your family tree...</div>;
}
