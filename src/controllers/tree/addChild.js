// The new orchestrator: src/controllers/tree/addChild.js

import { createPerson } from "../../models/treeModels/PersonModel";
import dataService from "../../services/dataService";
import { addBirth, addDeath, addCustom, addMarriage as createMarriageEvent } from "./events";
import { createMarriage, addChildToMarriage } from "./marriages";
import { createAudioStory } from "./stories";


export async function addChild(treeId, options) {
  const { marriageId, parentId, childData, motherId, createdBy = "system" } = options;

  try {
    // --- 1. VALIDATE INPUTS ---
    if (!marriageId && !parentId) {
      throw new Error("addChild requires either a marriageId or a parentId to proceed.");
    }

    // --- 2. CREATE THE CHILD PERSON RECORD ---
    const newChild = createPerson({
      treeId: treeId,
      name: childData.fullName,
      gender: childData.gender,
      dob: childData.dateOfBirth,
      dod: childData.dateOfDeath,
      placeOfBirth: childData.placeOfBirth,
      placeOfDeath: childData.placeOfDeath,
      email: childData.email,
      phoneNumber: childData.phoneNumber,
      nationality: childData.nationality,
      countryOfResidence: childData.countryOfResidence,
      photoUrl: childData.profilePhoto,
      bio: childData.biography,
      tribe: childData.tribe,
      language: childData.language,
      isDeceased: childData.isDeceased,
      privacyLevel: childData.privacyLevel,
      allowGlobalMatching: childData.allowGlobalMatching,
      isSpouse: false,
    });

    await dataService.addPerson(newChild);

    // --- 3. CREATE ASSOCIATED RECORDS (EVENTS, STORIES) ---
    // a) Birth/Death Events
    if (newChild.dob) await addBirth(treeId, newChild.id, { date: newChild.dob, title: "Birth" });
    if (newChild.dod) await addDeath(treeId, newChild.id, { date: newChild.dod, title: "Death" });

    // b) Custom Events from form
    if (Array.isArray(childData.events)) {
      for (const ev of childData.events) {
        await addCustom(treeId, [newChild.id], ev.customType, ev);
      }
    }
    // c) Audio Story logic would be delegated here as planned
    if (childData.audioFile || childData.storyTitle) {
      await createAudioStory({
        treeId: treeId,
        personId: newChild.id,
        addedBy: createdBy,
        storyTitle: childData.storyTitle,
        language: childData.language,
        audioFile: childData.audioFile, // Pass the file directly to the service
      });
    }

    // --- 4. LOGIC PATH 1: ADD TO EXISTING MARRIAGE ---
 if (marriageId) {
  const marriage = await dataService.getMarriage(marriageId);
  if (!marriage) throw new Error("Marriage not found.");

  const parentPerson = await dataService.getPerson(parentId);
  if (!parentPerson) throw new Error("Parent not found.");

  let effectiveMotherId = motherId;

  if (marriage.marriageType === "polygamous") {
    if (!motherId) {
      // create placeholder wife
      const placeholderSpouse = createPerson({
        treeId,
        name: "Partner",
        gender: "female", // always wives in polygamy
        isPlaceholder: true,
        isSpouse: true,
        allowGlobalMatching: false,
      });
      await dataService.addPerson(placeholderSpouse);

      // add as wife properly
      marriage.wives.push({
        wifeId: placeholderSpouse.id,
        order: marriage.wives.length + 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        childrenIds: [],
      });
      await dataService.updateMarriage(marriageId, { wives: marriage.wives });

      effectiveMotherId = placeholderSpouse.id;
    }

    await addChildToMarriage(marriageId, newChild.id, {
      wifeId: effectiveMotherId,
    });

  } else {
    // monogamous logic (like you already had)
    if (!motherId) {
      const placeholderSpouse = createPerson({
        treeId,
        name: "Partner",
        gender: parentPerson.gender === "male" ? "female" : "male",
        isPlaceholder: true,
        isSpouse: true,
        allowGlobalMatching: false,
      });
      await dataService.addPerson(placeholderSpouse);

      if (!marriage.spouses.includes(placeholderSpouse.id)) {
        marriage.spouses.push(placeholderSpouse.id);
        await dataService.updateMarriage(marriageId, { spouses: marriage.spouses });
      }

      effectiveMotherId = placeholderSpouse.id;
    }

    await addChildToMarriage(marriageId, newChild.id, {
      fatherId: parentPerson.gender === "male" ? parentId : effectiveMotherId,
      motherId: parentPerson.gender === "male" ? effectiveMotherId : parentId,
    });
  }

  return { child: newChild, marriageId };
}



    // --- 5. LOGIC PATH 2: ADD TO SINGLE PARENT (CREATE PLACEHOLDER MARRIAGE) ---
    if (parentId) {
      const parentPerson = await dataService.getPerson(parentId);
      if (!parentPerson) throw new Error("Parent not found.");

      // a) Create placeholder spouse
      const placeholderSpouse = createPerson({
        treeId,
        name: "Partner",
        gender: parentPerson.gender === 'male' ? 'female' : 'male',
        isPlaceholder: true,
        isSpouse: true,
        allowGlobalMatching: false,
      });
      await dataService.addPerson(placeholderSpouse);

      // b) Create the new marriage between the parent and the placeholder
      const newMarriage = await createMarriage(treeId, "monogamous", createdBy, {
        spouses: [parentId, placeholderSpouse.id],
      });

      // c) Add the child to this new marriage
      await addChildToMarriage(newMarriage.id, newChild.id);

      // Note: createMarriage already handles creating the marriage event, so no extra step is needed.

      return {
        child: newChild,
        placeholder: placeholderSpouse,
        marriage: newMarriage,
      };
    }

  } catch (err) {
    console.error("DBG:addChild -> Error:", err);
    throw err;
  }
}