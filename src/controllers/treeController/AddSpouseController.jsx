// src/controllers/AddSpouseController.jsx
import React, { useState, useEffect, useRef } from "react";
import AddSpouseForm from "../../components/Add Relatives/Spouse/AddSpouseForm.jsx";
import * as treeController from "./treeController.js";
import dataService from "../../services/dataService.js";
import { MarriageModel } from "../../models/treeModels/MarriageModel.js";
import useToastStore from "../../store/useToastStore";
import useModalStore from "../../store/useModalStore";

const AddSpouseController = ({ treeId, existingSpouseId, onSuccess, onCancel }) => {
  // --------------------------
  // State & Stores
  // --------------------------
  const [isLoadingForm, setIsLoadingForm] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const addToast = useToastStore((state) => state.addToast);
  const { openModal, closeModal } = useModalStore();

  // Guard: prevents double-submit or double-success
  const hasSubmitted = useRef(false);

  // Form props (populated by prepareForm)
  const [formProps, setFormProps] = useState({
    husbandName: "",
    isFirstSpouse: false,
    suggestedWifeOrder: 1,
  });

  // --------------------------
  // Prepare form on mount
  // --------------------------
  useEffect(() => {
    async function prepareForm() {
      try {
        const targetPerson = await dataService.getPerson(existingSpouseId);
        if (!targetPerson) throw new Error("Target person not found");

        const existingMarriages = await dataService.getMarriagesByPersonId(existingSpouseId);
        const isFirstSpouse = existingMarriages.length === 0;

        // Default wife order = 1, unless we detect existing polygamous marriage
        let suggestedOrder = 1;
        const polygamousMarriage = existingMarriages.find(m => m.marriageType === "polygamous");
        if (polygamousMarriage) {
          const model = new MarriageModel(polygamousMarriage);
          suggestedOrder = model.getNextWifeOrder();
        }

        setFormProps({
          husbandName: targetPerson.name,
          isFirstSpouse,
          suggestedWifeOrder: suggestedOrder,
        });

      } catch (err) {
        setError("Failed to load data for the form.");
        console.error("DBG:prepareForm ->", err);
      } finally {
        setIsLoadingForm(false);
      }
    }
    prepareForm();
  }, [existingSpouseId]);

  // --------------------------
  // Handle form submission
  // --------------------------
  const handleSubmit = async (formData) => {
    // Prevent double-submit
    if (isSubmitting || hasSubmitted.current) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await treeController.addSpouse(treeId, existingSpouseId, formData, {
        onError: (message, type) => addToast(message, type),
        confirmConvert: () => {
          // Wrap modal confirmation into a Promise
          return new Promise((resolve) => {
            openModal("confirmationModal", {
              title: "Convert to Polygamous Marriage?",
              message: `This person is currently in a monogamous marriage. 
                        Do you want to convert it to a polygamous one 
                        to add this new spouse?`,
              confirmText: "Yes, Convert",
              cancelText: "No, Cancel",
              onConfirm: () => {
                closeModal("confirmationModal");
                resolve(true); // user agrees
              },
              onCancel: () => {
                closeModal("confirmationModal");
                resolve(false); // user cancels
              },
            });
          });
        }
      });

      // Success path
      if (result && !hasSubmitted.current) {
        hasSubmitted.current = true;
        addToast("Spouse added successfully!", "success");
        if (onSuccess) onSuccess(result);
      } 
      // User canceled conversion
      else if (!result) {
        addToast("Operation cancelled.", "info");
      }

    } catch (err) {
      if (!hasSubmitted.current) {
        setError(err.message || "Failed to add spouse");
      }
      console.error("DBG:handleSubmit -> error:", err);

    } finally {
      // Always reset submitting flag (avoids stuck loading state)
      setIsSubmitting(false);
    }
  };

  // --------------------------
  // Render
  // --------------------------
  if (isLoadingForm) return <div>Loading form...</div>;

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
