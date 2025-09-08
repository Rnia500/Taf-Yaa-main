import { createPerson } from "../../models/treeModels/PersonModel";
import dataService from "../../services/dataService";
import { addBirth, addDeath, addCustom } from "./events";
import { createMarriage, addSpouseToMarriage } from "./marriages";
import { createAudioStory } from "./stories";
import { addSpouse } from "./addSpouse"; 

export async function addParentToChild(treeId, childId, parentData, options = {}) {
  const { onError, confirmConvert, createdBy = "system", parentToMarryId } = options;

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
        } catch (err) { console.error("Photo upload failed", err); }
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
      if (newParent.dob) await addBirth(treeId, newParent.id, { date: newParent.dob, title: 'Birth' });
      if (newParent.dod) await addDeath(treeId, newParent.id, { date: newParent.dod, title: 'Death' });

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


    // SCENARIO 1: Child has no parents yet. Create a new family unit with a placeholder.
    if (!childsMarriages || childsMarriages.length === 0) {
      console.log("Executing Add Parent: SCENARIO 1 - First Parent");
      // a) Create the placeholder spouse
      const placeholderSpouse = createPerson({
        treeId,
        name: "Partner",
        gender: newParent.gender === 'male' ? 'female' : 'male',
        isPlaceholder: true,
        isSpouse: true,
        allowGlobalMatching: false,
      });
      await dataService.addPerson(placeholderSpouse);

      // b) Create the new marriage, adding the child to it
      const newMarriage = await createMarriage(treeId, "monogamous", createdBy, {
        spouses: [newParent.id, placeholderSpouse.id],
      });
      await dataService.addChildToMarriage(newMarriage.id, childId);

      return {
        parent: newParent,
        placeholder: placeholderSpouse,
        marriage: newMarriage,
        action: "created_family_unit"
      };
    }

    // Find if any of the child's marriages involves a placeholder
    let placeholderMarriage = null;
    let placeholderSpouseId = null;

    for (const marriage of childsMarriages) {
      for (const spouseId of marriage.spouses || []) {
        const spouse = await dataService.getPerson(spouseId);
        if (spouse && spouse.isPlaceholder) {
          placeholderMarriage = marriage;
          placeholderSpouseId = spouse.id;
          break;
        }
      }
      if (placeholderMarriage) break;
    }

    // SCENARIO 2: Child has one parent and one placeholder. Replace the placeholder.
    if (placeholderMarriage && placeholderSpouseId) {
      console.log("Executing Add Parent: SCENARIO 2 - Second Parent (Replacing Placeholder)");
      // a) Replace the placeholder ID in the marriage spouses array
      const newSpouses = placeholderMarriage.spouses.map(id => (id === placeholderSpouseId ? newParent.id : id));
      const updatedMarriage = await dataService.updateMarriage(placeholderMarriage.id, { spouses: newSpouses });

      // b) Delete the now-unneeded placeholder person
      await dataService.deletePerson(placeholderSpouseId);

      return {
        parent: newParent,
        marriage: updatedMarriage,
        action: "completed_family_unit"
      };
    }

    // SCENARIO 3: Child already has known parents. This is a step-parent situation.
    // i treat this as "adding a spouse" to one of the child's existing parents.
    if (childsMarriages.length > 0 && parentToMarryId) {
      console.log(`Executing Add Parent: SCENARIO 3 - Step-Parent (marrying ${parentToMarryId})`);

      // i can just reuse our powerful addSpouse logic!
      const { spouse, marriage, marriageAction } = await addSpouse(
        treeId,
        parentToMarryId, // The ID of the existing parent who is remarrying
        parentData,     // The form data for the new step-parent
        { onError, confirmConvert, createdBy }
      );

      return {
        parent: spouse, // The new step-parent
        marriage: marriage,
        action: `added_as_spouse_to_existing_parent (${marriageAction})`
      };
    }

    // Fallback error if no clear action can be taken
    throw new Error("Could not determine how to add parent. The child may already have a complete set of parents and no parentToMarryId was specified.");

  } catch (err) {
    console.error("Error in addParentToChild orchestrator:", err);
    throw err;
  }
}
