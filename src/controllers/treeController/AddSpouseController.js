// src/controllers/AddSpouseController.jsx
import React, { useState } from "react";
import AddSpouseForm from "../../components/Add Relatives/Spouse/AddSpouseForm.jsx";
import * as treeController from "../treeController";

const AddSpouseController = ({ treeId, existingSpouseId, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (spouseData) => {
    setLoading(true);
    setError(null);

    try {
      const result = await treeController.addSpouse(treeId, existingSpouseId, spouseData);
      if (onSuccess) onSuccess(result);
    } catch (err) {
      setError("Failed to add spouse");
      console.error("Error in AddSpouseController:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {error && <div style={{ color: "red" }}>{error}</div>}

      <AddSpouseForm onSubmit={handleSubmit} onCancel={onCancel} />

      {loading && <div>Saving spouse...</div>}
    </>
  );
};

export default AddSpouseController;
