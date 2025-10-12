// src/controllers/TreeCreationController.jsx
import React, { useState, useRef } from "react";
import TreeCreationForm from "../../components/AddTree/TreeCreationForm.jsx";
import { addTree } from "../tree/addTree.js";

import useToastStore from "../../store/useToastStore.js";
import useModalStore from "../../store/useModalStore.js";

const TreeCreationController = ({ onSuccess, onCancel, createdBy, isEdit = false, treeToEdit = null }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const hasSubmitted = useRef(false);

  const addToast = useToastStore((state) => state.addToast);
  const { closeModal } = useModalStore();

  const handleSubmit = async (formData) => {
    if (isSubmitting || hasSubmitted.current) return;

    setIsSubmitting(true);
    setError(null);

    try {
      let result;
      if (isEdit && treeToEdit) {
        // Remove edit tree functionality by not allowing updateTree call
        // Instead, just close modal and notify user that editing is now done via settings page
        addToast("Editing trees via creation modal is disabled. Please use the Settings page to edit your tree.", "info");
        closeModal("treeModal");
        return;
      } else {
        result = await addTree(formData, {
          createdBy,
          onError: (msg, type) => addToast(msg, type || "error"),
        });

        if (result && !hasSubmitted.current) {
          hasSubmitted.current = true;
          addToast("Tree created successfully!", "success");
          onSuccess?.(result);
          closeModal("treeModal");
        }
      }

      if (!result && !hasSubmitted.current) {
        setError("Operation could not be completed. Please check inputs.");
        setIsSubmitting(false);
        closeModal("treeModal");
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
        key={isEdit ? 'edit' : 'create'}
        onSubmit={handleSubmit}
        onCancel={onCancel}
        isSubmitting={isSubmitting}
        isEdit={isEdit}
        treeToEdit={treeToEdit}
      />
    </>
  );
};

export default TreeCreationController;
