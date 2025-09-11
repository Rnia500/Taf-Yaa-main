// src/controllers/TreeCreationController.jsx
import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import TreeCreationForm from "../../components/AddTree/TreeCreationForm.jsx";
import { addTree } from "../tree/addTree.js";
import useToastStore from "../../store/useToastStore.js";
import useModalStore from "../../store/useModalStore.js";

const TreeCreationController = ({ onSuccess, onCancel, createdBy }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const hasSubmitted = useRef(false);

  const navigate = useNavigate();
  const addToast = useToastStore((state) => state.addToast);
  const { closeModal } = useModalStore();

  const handleSubmit = async (formData) => {
    if (isSubmitting || hasSubmitted.current) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await addTree(formData, {
        createdBy,
        onError: (msg, type) => addToast(msg, type || "error"),
      });

      if (result && !hasSubmitted.current) {
        hasSubmitted.current = true;
        addToast("Tree created successfully!", "success");
        onSuccess?.(result);
        closeModal("createTree");

        // Navigate to TreeCanvas with rootPerson preloaded
        if (result.tree && result.rootPerson) {
          const treeId = result.tree.id || result.tree._id || null;
          const rootPersonId = result.rootPerson.id || result.rootPerson._id || null;
          if (treeId && rootPersonId) {
            // Navigate to the family tree page with the tree ID and root person ID as query param
            navigate(`/family-tree/${treeId}?root=${rootPersonId}`);
          }
        }
      } else if (!result && !hasSubmitted.current) {
        setError("Operation could not be completed. Please check inputs.");
        setIsSubmitting(false);
        closeModal("createTree");
      }
    } catch (err) {
      if (!hasSubmitted.current) {
        setError(err.message || "Failed to create tree");
        addToast(err.message || "Unexpected error", "error");
      }
      console.error("TreeCreationController.handleSubmit:", err);
    } finally {
      if (!hasSubmitted.current) {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <>
      {error && <div style={{ color: "red", marginBottom: "1rem" }}>{error}</div>}
      <TreeCreationForm
        onSubmit={handleSubmit}
        onCancel={onCancel}
        isSubmitting={isSubmitting}
      />
    </>
  );
};

export default TreeCreationController;
