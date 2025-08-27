import React, { useState } from 'react';
import AddChildForm from '../../components/Add Relatives/Child/AddChildForm';
import realTimeDataService from '../../services/realTimeDataService';

const AddChildController = ({ treeId, onSuccess, onCancel, parent1Name, parent2Name }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (childData) => {
    setLoading(true);
    setError(null);
    
    try {
      // Add treeId to the child data
      const dataWithTreeId = {
        ...childData,
        treeId: treeId || 'tree001'
      };

      const result = await realTimeDataService.addChild(dataWithTreeId);
      
      if (result.success) {
        console.log('Child added successfully:', result.data);
        if (onSuccess) onSuccess(result.data); // Pass the created child data
      } else {
        setError(result.message || 'Failed to add child');
        console.error('Error adding child:', result.error);
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Error adding child:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {error && (
        <div className="error-message" style={{ 
          color: 'red', 
          padding: '10px', 
          margin: '10px 0', 
          border: '1px solid red', 
          borderRadius: '4px',
          backgroundColor: '#ffe6e6'
        }}>
          {error}
        </div>
      )}
      
      <AddChildForm
        onSubmit={handleSubmit}
        onCancel={onCancel}
        parent1Name={parent1Name}
        parent2Name={parent2Name}
      />
      
      {loading && (
        <div className="loading-message" style={{ 
          padding: '10px', 
          margin: '10px 0', 
          textAlign: 'center',
          color: '#666'
        }}>
          Saving child...
        </div>
      )}
    </>
  );
};

export default AddChildController;
