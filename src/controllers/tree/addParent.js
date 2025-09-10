// src/controllers/tree/addParent.js
import { createPerson } from "../../models/treeModels/PersonModel";
import dataService from "../../services/dataService";
import { addBirth, addDeath, addCustom } from "./events";
import { createMarriage } from "./marriages";
import { createAudioStory } from "./stories";

export async function addParentToChild(treeId, childId, parentData, options = {}) {
  const { createdBy = "system" } = options;

  try {
    // --- Step 1: "Find or Create" the new parent being added ---
    let newParent = await dataService.findPersonByFields?.({
      treeId,
      name: parentData.fullName,
      gender: parentData.gender,
      dob: parentData.dateOfBirth || null,
    });

    if (!newParent) {
      // a) Handle file uploads first
      let uploadedPhotoUrl = null;
      if (parentData.profilePhoto) {
        try {
          const uploaded = await dataService.uploadFile(parentData.profilePhoto, "image");
          uploadedPhotoUrl = uploaded.url;
        } catch (err) {
          console.error("Photo upload failed", err);
        }
      }

      // b) Create the new person object
      newParent = createPerson({
        treeId: treeId,
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

      // c) Create all associated records for the NEW parent
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
          treeId: treeId,
          personId: newParent.id,
          addedBy: createdBy,
          storyTitle: parentData.storyTitle,
          audioFile: parentData.audioFile,
        });
      }
    }

    // --- Step 2: Analyze the child's current family situation ---
    const childsMarriages = await dataService.getMarriagesByChildId(childId);

    // SCENARIO 1: Child has no parents yet → create family with placeholder
    if (!childsMarriages || childsMarriages.length === 0) {
      console.log("AddParent: SCENARIO 1 - First Parent");

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

      return {
        parent: newParent,
        placeholder: placeholderSpouse,
        marriage: newMarriage,
        action: "created_family_unit",
      };
    }

    // --- Collect existing parents ---
    const allParentIds = new Set();
    for (const marriage of childsMarriages) {
      (marriage.spouses || []).forEach((id) => allParentIds.add(id));
    }
    const parentObjects = await Promise.all(
      [...allParentIds].map((id) => dataService.getPerson(id))
    );
    const realParents = parentObjects.filter((p) => p && !p.isPlaceholder);

    // Rule: max 2 parents
    if (realParents.length >= 2) {
      throw new Error("This child already has two parents. Cannot add more.");
    }

    // SCENARIO 2: One real parent + one placeholder → replace placeholder
    const placeholderMarriage = childsMarriages.find((m) =>
      (m.spouses || []).some(async (id) => {
        const sp = await dataService.getPerson(id);
        return sp && sp.isPlaceholder;
      })
    );

    if (placeholderMarriage) {
      console.log("AddParent: SCENARIO 2 - Second Parent");

      // find placeholder + existing parent
      let placeholderId = null;
      let existingParent = null;
      for (const sid of placeholderMarriage.spouses) {
        const sp = await dataService.getPerson(sid);
        if (!sp) continue;
        if (sp.isPlaceholder) placeholderId = sp.id;
        else existingParent = sp;
      }

      if (!placeholderId || !existingParent) {
        throw new Error("Invalid marriage structure: missing placeholder or existing parent.");
      }

      // enforce opposite sex
      if (existingParent.gender === newParent.gender) {
        throw new Error("Parents must be of opposite sexes. Cannot add this parent.");
      }

      // replace placeholder
      const newSpouses = placeholderMarriage.spouses.map((id) =>
        id === placeholderId ? newParent.id : id
      );
      const updatedMarriage = await dataService.updateMarriage(placeholderMarriage.id, {
        spouses: newSpouses,
      });

      await dataService.deletePerson(placeholderId);

      return {
        parent: newParent,
        marriage: updatedMarriage,
        action: "completed_family_unit",
      };
    }

    // If we got here → something’s wrong
    throw new Error(
      "Invalid state: Child has existing parents but no placeholder. Cannot add another parent."
    );
  } catch (err) {
    console.error("Error in addParentToChild:", err);
    throw err;
  }
}
 