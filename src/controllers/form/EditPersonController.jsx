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
      const {
        fullName,
        gender,
        dateOfBirth,
        isDeceased,
        phoneNumber,
        email,
        dateOfDeath,
        placeOfBirth,
        placeOfDeath,
        nationality,
        countryOfResidence,
        profilePhoto,
        biography,
        tribe,
        language,
        privacyLevel,
        allowGlobalMatching,
        photos,
        stories,
      } = updatedData;

      const updates = {
        name: fullName || '',
        gender: gender || null,
        dob: dateOfBirth || null,
        isDeceased: !!isDeceased,
        phoneNumber: phoneNumber || null,
        email: email || null,
        dod: dateOfDeath || null,
        placeOfBirth: placeOfBirth || null,
        placeOfDeath: placeOfDeath || null,
        nationality: nationality || null,
        countryOfResidence: countryOfResidence || null,
        bio: biography || '',
        tribe: tribe || null,
        language: language || null,
        privacyLevel: privacyLevel || 'membersOnly',
        allowGlobalMatching: !!allowGlobalMatching,
        isPlaceholder: false 
      };

      // Upload profile photo if a File was provided
      if (profilePhoto instanceof File) {
        try {
          const uploaded = await dataService.uploadFile(profilePhoto, 'image', {
            treeId: person.treeId,
            memberId: personId,
            userId: 'current-user' // TODO: Get from auth context
          });
          updates.photoUrl = uploaded.url;
        } catch (e) {
          console.warn('Profile photo upload failed, keeping existing photoUrl', e);
        }
      }

      // Normalize photos: upload any new files and keep existing urls
      if (Array.isArray(photos)) {
        const normalized = [];
        for (const p of photos) {
          if (p?.file instanceof File) {
            try {
              const uploaded = await dataService.uploadFile(p.file, 'image', {
                treeId: person.treeId,
                memberId: personId,
                userId: 'current-user' // TODO: Get from auth context
              });
              normalized.push({ url: uploaded.url, alt: p.alt || updatedData.fullName || 'Photo' });
            } catch (e) {
              console.warn('Photo upload failed for one item', e);
            }
          } else if (p?.url) {
            normalized.push({ url: p.url, alt: p.alt || updatedData.fullName || 'Photo' });
          }
        }
        updates.photos = normalized;
      }

      // Persist story deletions (compare initial stories vs submitted stories)
      try {
        const originalStories = Array.isArray(formData?.stories) ? formData.stories : [];
        const submittedStories = Array.isArray(stories) ? stories : [];
        const originalIds = new Set(originalStories.map(s => s?.storyId).filter(Boolean));
        const submittedIds = new Set(submittedStories.map(s => s?.storyId).filter(Boolean));
        const toDelete = [...originalIds].filter(id => !submittedIds.has(id));

        for (const storyId of toDelete) {
          try {
            await dataService.deleteStory(storyId);
          } catch (e) {
            console.warn('Failed to delete story', storyId, e);
          }
        }
      } catch (e) {
        console.warn('Story deletion diff failed', e);
      }

      await dataService.updatePerson(personId, updates);

      addToast("Person updated successfully!", "success");
      onSuccess && onSuccess(updates);
      closeModal("editPerson");

      if (typeof window !== 'undefined' && window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('familyDataChanged', {
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
