// src/controllers/tree/addParent.js
import { createPerson } from "../../models/treeModels/PersonModel";
import dataService from "../../services/dataService";
import { addBirth, addDeath, addCustom } from "./events";
import { createMarriage } from "./marriages";
import { createAudioStory } from "./stories";

export async function addParentToChild(treeId, childId, parentData, options = {}) {
  const { createdBy = "system", parentToMarryId, confirmConvert } = options;

  try {
    // --- STEP 1: Ensure parent exists ---
    let newParent = await dataService.findPersonByFields?.({
      treeId,
      name: parentData.fullName,
      gender: parentData.gender,
      dob: parentData.dateOfBirth || null,
    });

    if (!newParent) {
      let uploadedPhotoUrl = null;
      if (parentData.profilePhoto) {
        try {
          const uploaded = await dataService.uploadFile(parentData.profilePhoto, "image");
          uploadedPhotoUrl = uploaded.url;
        } catch (err) {
          console.error("Photo upload failed", err);
        }
      }

      newParent = createPerson({
        treeId,
        name: parentData.fullName,
        gender: parentData.gender,
        dob: parentData.dateOfBirth,
        dod: parentData.dateOfDeath,
        placeOfBirth: parentData.placeOfBirth,
        placeOfDeath: parentData.placeOfDeath,
        email: parentData.email,
        phoneNumber: parentData.phoneNumber,
        nationality: parentData.nationality,
        countryOfResidence: parentData.countryOfResidence,
        photoUrl: uploadedPhotoUrl,
        bio: parentData.biography,
        tribe: parentData.tribe,
        language: parentData.language,
        isDeceased: parentData.isDeceased,
        privacyLevel: parentData.privacyLevel,
        allowGlobalMatching: parentData.allowGlobalMatching,
        isSpouse: false,
      });
      await dataService.addPerson(newParent);

      if (newParent.dob) {
        await addBirth(treeId, newParent.id, { date: newParent.dob, title: "Birth" });
      }
      if (newParent.dod) {
        await addDeath(treeId, newParent.id, { date: newParent.dod, title: "Death" });
      }

      if (Array.isArray(parentData.events)) {
        for (const ev of parentData.events) {
          await addCustom(treeId, [newParent.id], ev.customType, ev);
        }
      }

      if (parentData.audioFile || parentData.storyTitle) {
        await createAudioStory({
          treeId,
          personId: newParent.id,
          addedBy: createdBy,
          storyTitle: parentData.storyTitle,
          audioFile: parentData.audioFile,
        });
      }
    }

    // --- STEP 2: Look at child’s current marriages ---
    const marriages = await dataService.getMarriagesByChildId(childId);

    // === Scenario 1: no parents yet ===
    if (!marriages || marriages.length === 0) {
      const placeholderSpouse = createPerson({
        treeId,
        name: "Partner",
        gender: newParent.gender === "male" ? "female" : "male",
        isPlaceholder: true,
        isSpouse: true,
        allowGlobalMatching: false,
      });
      await dataService.addPerson(placeholderSpouse);

      const newMarriage = await createMarriage(treeId, "monogamous", createdBy, {
        spouses: [newParent.id, placeholderSpouse.id],
      });
      await dataService.addChildToMarriage(newMarriage.id, childId);

      return { parent: newParent, marriage: newMarriage, action: "created_family_unit" };
    }

    // === Scenario 2: one real + one placeholder ===
    let placeholderMarriage = null;
    let placeholderId = null;

    for (const marriage of marriages) {
      if (!marriage.spouses) continue;  

      const spouseObjects = await Promise.all(
        marriage.spouses.map(sid => dataService.getPerson(sid))
      );

      const placeholderSpouse = spouseObjects.find(sp => sp?.isPlaceholder);

      if (placeholderSpouse) {
        placeholderMarriage = marriage;
        placeholderId = placeholderSpouse.id;
        break;
      }
    }

    if (placeholderMarriage && placeholderId) {
      const newSpouses = placeholderMarriage.spouses.map(id =>
        id === placeholderId ? newParent.id : id
      );

      const updatedMarriage = await dataService.updateMarriage(placeholderMarriage.id, {
        spouses: newSpouses,
      });
      await dataService.deletePerson(placeholderId);

      return { parent: newParent, marriage: updatedMarriage, action: "completed_family_unit" };
    }


    // === Scenario 3: polygamy (explicit request) ===
    if (parentToMarryId) {
      // Find target marriage that contains parentToMarryId
      const targetMarriage = marriages.find(m => {
        if (Array.isArray(m.spouses)) {
          return m.spouses.includes(parentToMarryId);
        }
        // legacy structure
        if (m.husbandId === parentToMarryId) return true;
        if (Array.isArray(m.wives) && m.wives.includes(parentToMarryId)) return true;
        return false;
      });

      if (!targetMarriage) throw new Error("Target parent's marriage not found.");

      // Ensure polygamy conversion if needed
      if (targetMarriage.type === "monogamous") {
        const confirmed = await confirmConvert?.();
        if (!confirmed) throw new Error("User cancelled conversion.");
        await dataService.updateMarriage(targetMarriage.id, { type: "polygamous" });
      }

      // Normalize spouses list for update
      let spousesList = Array.isArray(targetMarriage.spouses)
        ? [...targetMarriage.spouses]
        : [targetMarriage.husbandId, ...(targetMarriage.wives || [])];

      if (!spousesList.includes(newParent.id)) {
        spousesList.push(newParent.id);
        const updatedMarriage = await dataService.updateMarriage(targetMarriage.id, {
          spouses: spousesList,
        });
        return { parent: newParent, marriage: updatedMarriage, action: "added_polygamous_parent" };
      }
    }

    throw new Error("Invalid state: cannot add parent.");
  } catch (err) {
    console.error("Error in addParentToChild:", err);
    throw err;
  }
}
