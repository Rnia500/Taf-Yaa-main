// src/controllers/AddSpouseController.jsx
import React, { useState, useEffect, useRef } from "react";
import AddSpouseForm from "../../components/Add Relatives/Spouse/AddSpouseForm.jsx";
import * as treeController from "./treeController.js";
import dataService from "../../services/dataService.js";
import { MarriageModel } from "../../models/treeModels/MarriageModel.js";
import useToastStore from "../../store/useToastStore";
import useModalStore from "../../store/useModalStore";

const AddSpouseController = ({ treeId, existingSpouseId, onSuccess, onCancel }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [formProps, setFormProps] = useState(null);

  const addToast = useToastStore((state) => state.addToast);
  const { openModal, closeModal } = useModalStore();

  // Prevent duplicate submission
  const hasSubmitted = useRef(false);

  // -----------------------------
  // Prepare form defaults
  // -----------------------------
  useEffect(() => {
    const loadData = async () => {
      try {
        const targetPerson = await dataService.getPerson(existingSpouseId);
        if (!targetPerson) throw new Error("Target person not found");

        const existingMarriages = await dataService.getMarriagesByPersonId(existingSpouseId);
        const isFirstSpouse = existingMarriages.length === 0;

        // Default wife order if already polygamous
        let suggestedOrder = 1;
        const polygamousMarriage = existingMarriages.find(m => m.marriageType === "polygamous");
        if (polygamousMarriage) {
          suggestedOrder = new MarriageModel(polygamousMarriage).getNextWifeOrder();
        }

        setFormProps({
          husbandName: targetPerson.name,
          isFirstSpouse,
          suggestedWifeOrder: suggestedOrder,
        });
      } catch (err) {
        setError("Failed to load data for the form.");
        console.error("AddSpouseController.prepareForm:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [existingSpouseId]);

  // -----------------------------
  // Confirmation Modal wrapper
  // -----------------------------
  const confirmConvertMarriage = () => {
    return new Promise((resolve) => {
      openModal("confirmationModal", {
        title: "Convert to Polygamous Marriage?",
        message:
          "This is currently in a monogamous marriage. Do you want to convert it to a polygamous one to add this new spouse?",
        confirmText: "Yes, Convert",
        cancelText: "No, Cancel",
        onConfirm: () => {
          closeModal("confirmationModal");
          resolve(true);
        },
        onCancel: () => {
          closeModal("confirmationModal");
          resolve(false);
        },
      });
    });
  };

  // -----------------------------
  // Form Submit
  // -----------------------------
const handleSubmit = async (formData) => {
  if (isSubmitting || hasSubmitted.current) return;

  setIsSubmitting(true);
  setError(null);

  try {
    const result = await treeController.addSpouse(treeId, existingSpouseId, formData, {
      onError: (msg, type) => {
        // Always show toast for errors
        addToast(msg, type || "error");
      },
      confirmConvert: confirmConvertMarriage,
    });

    if (result && !hasSubmitted.current) {
      hasSubmitted.current = true;
      addToast("Spouse added successfully!", "success");
      onSuccess?.(result);
      closeModal("addSpouse"); 
    } else if (!result && !hasSubmitted.current) {
      // Null result = either rule violation OR user cancelled
      setIsSubmitting(false); // Re-enable form
      // Optionally set a generic error if not already set
      setError("Operation could not be completed. Please check the rules.");
      // Modal can be closed here if you want, or let user see error
      closeModal("addSpouse");
    }
  } catch (err) {
    if (!hasSubmitted.current) {
      setError(err.message || "Failed to add spouse");
      addToast(err.message || "Unexpected error", "error");
    }
    console.error("AddSpouseController.handleSubmit:", err);
  } finally {
    if (!hasSubmitted.current) {
      setIsSubmitting(false);
    }
  }
};


  // -----------------------------
  // Render
  // -----------------------------
  if (isLoading) return <div>Loading form...</div>;

  return (
    <>
      {error && <div style={{ color: "red", marginBottom: "1rem" }}>{error}</div>}
      <AddSpouseForm
        onSubmit={handleSubmit}
        onCancel={onCancel}
        {...formProps}
        isSubmitting={isSubmitting}
      />
    </>
  );
};

export default AddSpouseController;
