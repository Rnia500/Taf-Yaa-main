// src/controllers/AddSpouseController.jsx
import React, { useState, useEffect } from "react";
import AddSpouseForm from "../../components/Add Relatives/Spouse/AddSpouseForm.jsx";
import * as treeController from "./treeController.js";
import dataService from "../../services/dataService.js";
import { MarriageModel } from "../../models/treeModels/MarriageModel.js";
import useToastStore from "../../store/useToastStore";


const AddSpouseController = ({ treeId, existingSpouseId, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(true); // Start with loading true
  const [error, setError] = useState(null);
  
    const addToast = useToastStore((state) => state.addToast);

  const [formProps, setFormProps] = useState({
    husbandName: "",
    isFirstSpouse: false,
    suggestedWifeOrder: 1,
  });

  useEffect(() => {
    async function prepareForm() {
      try {
        const targetPerson = await dataService.getPerson(existingSpouseId);
        if (!targetPerson) throw new Error("Target person not found");
        
        const existingMarriages = await dataService.getMarriagesByPersonId(existingSpouseId);
        const isFirstSpouse = existingMarriages.length === 0;

        let suggestedOrder = 1;
        const polygamousMarriage = existingMarriages.find(m => m.marriageType === 'polygamous');
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
        console.error("Error preparing form:", err);
      } finally {
        setLoading(false);
      }
    }
    prepareForm();
  }, [existingSpouseId]);

  const handleSubmit = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      // Pass the prepared props along with the form data
      const finalData = { ...formData, ...formProps };
       const result = await treeController.addSpouse(treeId, existingSpouseId, finalData, {
        onError: (message, type) => addToast(message, type)
      });
      
      addToast('Spouse added successfully!', 'success');

      if (onSuccess) onSuccess(result);
    } catch (err) {
      setError(err.message || "Failed to add spouse");
      console.error("Error in AddSpouseController:", err);
      
      setLoading(false);
    }
    
  };

  if (loading) return <div>Loading form...</div>;

  return (
    <>
      {error && <div style={{ color: "red", marginBottom: '1rem' }}>{error}</div>}

      <AddSpouseForm 
        onSubmit={handleSubmit} 
        onCancel={onCancel}
        {...formProps}
      />
    </>
  );
};

export default AddSpouseController;