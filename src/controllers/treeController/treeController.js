// src/controllers/treeController.js
import dataService from "../../services/dataService";
import { generateId } from "../../utils/personUtils/idGenerator";

/**
 * Add a spouse (monogamous or polygamous).
 * Always uses the spouses[] array (clean schema).
 */
export async function addSpouse(treeId, existingSpouseId, newSpouseData) {
  try {
    const existingSpouse = await dataService.getPerson(existingSpouseId);
    if (!existingSpouse) throw new Error("Existing spouse not found");

    // --- Create the new person for the new spouse ---
    const newSpouseId = generateId("person");
    const newSpousePayload = {
      id: newSpouseId,
      treeId,
      name: newSpouseData.fullName,
      gender: newSpouseData.gender,
      dob: newSpouseData.dateOfBirth || null,
      isDeceased: newSpouseData.isDeceased,
      dod: newSpouseData.dateOfDeath || null,
      photoUrl: newSpouseData.profilePhoto || null,
      bio: newSpouseData.biography || "",
      tribe: newSpouseData.tribe || "",
      language: newSpouseData.language || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await dataService.addPerson(newSpousePayload);

    // --- Intelligent Marriage Logic ---
    const existingMarriages = await dataService.getMarriagesByPersonId(existingSpouseId);
    const polygamousMarriage = existingMarriages.find(
      (m) => m.marriageType === "polygamous" && m.husbandId === existingSpouseId
    );

    if (polygamousMarriage) {
      // --- Case 1: UPDATE existing polygamous marriage ---
      console.log("Updating existing polygamous marriage...");

      // Validation: only men can add multiple wives (no polyandry)
      if (existingSpouse.gender !== "male") {
        throw new Error("Only husbands can have multiple wives. Polyandry is not allowed.");
      }

      // Validation: new spouse must be female
      if (newSpouseData.gender !== "female") {
        throw new Error("In polygamous marriages, only female spouses are allowed.");
      }

      const newWife = {
        wifeId: newSpouseId,
        order: newSpouseData.wifeOrder,
        startDate: newSpouseData.marriageDate || null,
        location: newSpouseData.marriageLocation || null,
        notes: newSpouseData.marriageNotes || null,
        childrenIds: [],
      };

      polygamousMarriage.wives.push(newWife);

      const updatedMarriage = await dataService.updateMarriage(polygamousMarriage.id, {
        wives: polygamousMarriage.wives,
        updatedAt: new Date().toISOString(),
      });

      return {
        spouse: newSpousePayload,
        marriage: updatedMarriage,
        marriageAction: "updated",
      };
    } else {
      // --- Case 2: CREATE a new monogamous marriage ---
      console.log("Creating new monogamous marriage...");

      // ✅ Validation: block same-sex monogamous marriages
      if (existingSpouse.gender === newSpouseData.gender) {
        throw new Error("Same-sex marriages are not allowed.");
      }

      const marriageId = generateId("marriage");
      const marriagePayload = {
        id: marriageId,
        treeId,
        marriageType: "monogamous",
        spouses: [existingSpouseId, newSpouseId],
        childrenIds: [],
        startDate: newSpouseData.marriageDate || null,
        location: newSpouseData.marriageLocation || null,
        notes: newSpouseData.marriageNotes || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await dataService.addMarriage(marriagePayload);

      return { spouse: newSpousePayload, marriage: marriagePayload, marriageAction: "created" };
    }
  } catch (err) {
    console.error("Error adding spouse:", err);
    throw err;
  }
}


/**
 * Add a child under a marriage or under a single parent (with placeholder partner if needed).
 */
export async function addChild(treeId, options) {
  try {
    const { marriageId, parentId, childData } = options;
    const childId = generateId("person");

    const childPayload = {
      id: childId,
      treeId,
      ...childData,
      createdAt: new Date().toISOString(),
    };

    await dataService.addPerson(childPayload);

    // Case 1: Add under existing marriage
    if (marriageId) {
      await dataService.addChildToMarriage(marriageId, childId);
      return { child: childPayload, marriageId };
    }

    // Case 2: Add under single parent → auto-create marriage with placeholder
    if (parentId) {
      const placeholderId = generateId("person");
      const newMarriageId = generateId("marriage");

      const placeholderPayload = {
        id: placeholderId,
        treeId,
        fullName: "Partner",
        isPlaceholder: true,
        createdAt: new Date().toISOString(),
      };

      const marriagePayload = {
        id: newMarriageId,
        treeId,
        spouses: [parentId, placeholderId],
        childrenIds: [childId],
        createdAt: new Date().toISOString(),
      };

      await dataService.addPerson(placeholderPayload);
      await dataService.addMarriage(marriagePayload);

      return {
        child: childPayload,
        placeholder: placeholderPayload,
        marriage: marriagePayload,
      };
    }

    throw new Error("addChild requires either marriageId or parentId");
  } catch (err) {
    console.error("Error adding child:", err);
    throw err;
  }
}

/**
 * Add a parent to a single child (with placeholder partner).
 */
export async function addParent(treeId, childId, parentData) {
  try {
    const parentId = generateId("person");
    const marriageId = generateId("marriage");

    const parentPayload = {
      id: parentId,
      treeId,
      ...parentData,
      createdAt: new Date().toISOString(),
    };

    const placeholderId = generateId("person");
    const placeholderPayload = {
      id: placeholderId,
      treeId,
      fullName: "Partner",
      isPlaceholder: true,
      createdAt: new Date().toISOString(),
    };

    const marriagePayload = {
      id: marriageId,
      treeId,
      spouses: [parentId, placeholderId],
      childrenIds: [childId],
      createdAt: new Date().toISOString(),
    };

    await dataService.addPerson(parentPayload);
    await dataService.addPerson(placeholderPayload);
    await dataService.addMarriage(marriagePayload);

    return { parent: parentPayload, placeholder: placeholderPayload, marriage: marriagePayload };
  } catch (err) {
    console.error("Error adding parent:", err);
    throw err;
  }
}
