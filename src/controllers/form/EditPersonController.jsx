import React, { useState, useEffect } from "react";
import EditPersonForm from "../../components/Edit Person/EditPersonForm.jsx";
import dataService from "../../services/dataService.js";
import useToastStore from "../../store/useToastStore.js";
import useModalStore from "../../store/useModalStore.js";

const EditPersonController = ({ personId, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState(null);

  const addToast = useToastStore((state) => state.addToast);
  const { closeModal } = useModalStore();

  useEffect(() => {
    const fetchPersonData = async () => {
      try {
        const person = await dataService.getPerson(personId);
        if (!person) throw new Error("Person not found");

        const marriages = await dataService.getMarriagesByPersonId(personId);
        const events = await dataService.getEventsByPersonId(personId);
        const stories = await dataService.getStoriesByPersonId(personId);
        const photos = person.photos || [];

        setFormData({
          person,
          marriages,
          events,
          stories,
          photos,
        });
      } catch (err) {
        setError("Failed to load person data.");
        console.error("EditPersonController:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPersonData();
  }, [personId]);

  const handleSubmit = async (updatedData) => {
    setLoading(true);
    setError(null);
    try {
      // Assuming dataService has updatePerson method
      await dataService.updatePerson(personId, updatedData.person);
      // Similarly update marriages, events, stories if needed

      addToast("Person updated successfully!", "success");
      onSuccess && onSuccess(updatedData.person);
      closeModal("editPerson");

      if (typeof window !== 'undefined' && window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('familyTreeDataUpdated', {
          detail: { updatedPersonId: personId }
        }));
      }
    } catch (err) {
      setError("Failed to update person.");
      addToast("Failed to update person.", "error");
      console.error("EditPersonController.handleSubmit:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading person data...</div>;

  return (
    <>
      {error && <div style={{ color: "red" }}>{error}</div>}
      {formData && (
        <EditPersonForm
          initialData={formData}
          onSubmit={handleSubmit}
          onCancel={onCancel}
        />
      )}
    </>
  );
};

export default EditPersonController;
