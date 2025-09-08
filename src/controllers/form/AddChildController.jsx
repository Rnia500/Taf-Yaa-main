// src/controllers/AddChildController.jsx
import React, { useState, useEffect } from "react";
import AddChildForm from "../../components/Add Relatives/Child/AddChildForm.jsx";
import { addChild } from "../tree/addChild"; 
import dataService from "../../services/dataService.js";

const AddChildController = ({ treeId, parentId, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isLoadingForm, setIsLoadingForm] = useState(true);
  const [formProps, setFormProps] = useState({
    parent1Name: "",
    parent2Name: "",
    wives: [],
    defaultMotherId: null,
  });
  const [parent, setParent] = useState(null);
  const [parentMarriage, setParentMarriage] = useState(null);


  useEffect(() => {
    async function prepareForm() {
      try {
        const fetchedParent = await dataService.getPerson(parentId);
        if (!fetchedParent) throw new Error("Parent not found");

        const marriages = await dataService.getMarriagesByPersonId(parentId);

        const fetchedParentMarriage = marriages.find(m =>
          (m.marriageType === 'monogamous' && m.spouses.includes(fetchedParent.id)) ||
          (m.marriageType === 'polygamous' && (m.husbandId === fetchedParent.id || m.wives.some(w => w.wifeId === fetchedParent.id)))
        );

        setParent(fetchedParent);
        setParentMarriage(fetchedParentMarriage);

        let props = {
          parent1Name: fetchedParent.name,
          parent2Name: "",
          wives: [],
          defaultMotherId: null,
        };

        if (fetchedParentMarriage) {
          if (fetchedParentMarriage.marriageType === 'monogamous') {
            const otherSpouseId = fetchedParentMarriage.spouses.find(id => id !== fetchedParent.id);
            const otherSpouse = await dataService.getPerson(otherSpouseId);
            props.parent2Name = otherSpouse ? otherSpouse.name : 'Partner';
          } else if (fetchedParentMarriage.marriageType === 'polygamous') {
            const husband = await dataService.getPerson(fetchedParentMarriage.husbandId);
            props.parent1Name = husband ? husband.name : 'Unknown Husband';
            props.wives = await Promise.all(
              fetchedParentMarriage.wives.map(async w => {
                const wife = await dataService.getPerson(w.wifeId);
                return wife ? { id: wife.id, name: wife.name } : null;
              })
            ).then(wives => wives.filter(Boolean));

            if (fetchedParent.gender === 'female') {
              props.defaultMotherId = fetchedParent.id;
            }
          }
        }

        setFormProps(props);
      } catch (err) {
        setError("Failed to load data for the form.");
        console.error("Error preparing form:", err);
      } finally {
        setIsLoadingForm(false);
      }
    }
    prepareForm();
  }, [parentId]);


  const handleSubmit = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      const options = {
        childData: formData,
        marriageId: parentMarriage ? parentMarriage.id : null,
        motherId: formData.motherId || null,
        parentId: !parentMarriage ? parent.id : null,
      };


      const result = await addChild(treeId, options);
     
      if (onSuccess) onSuccess(result.child);

    } catch (err) {
      console.error("Error in AddChildController:", err);
      setError("Failed to add child.");
    } finally {
      setLoading(false);
    }
  };


  if (isLoadingForm) {
    return <div>Loading form...</div>;
  }

  return (
    <>
      {error && <div style={{ color: "red" }}>{error}</div>}
      <AddChildForm
        onSubmit={handleSubmit}
        onCancel={onCancel}
        {...formProps}
      />
      {loading && <div>Saving child...</div>}
    </>
  );
};

export default AddChildController;