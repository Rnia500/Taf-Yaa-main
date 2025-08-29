// src/controllers/treeController.js
import dataService from "../../services/dataService";
import { generateId } from "../../utils/personUtils/idGenerator";


export async function addSpouse(treeId, existingSpouseId, newSpouseData, options = {}) {
  const { onError } = options;

  try {
    const existingSpouse = await dataService.getPerson(existingSpouseId);
    if (!existingSpouse) throw new Error("Existing spouse not found");

    // Create the new spouse
    const newSpouseId = generateId("person");
    const newSpousePayload = {
      id: newSpouseId,
      treeId,
      name: newSpouseData.fullName,
      gender: newSpouseData.gender,
      dob: newSpouseData.dateOfBirth || null,
      isDeceased: newSpouseData.isDeceased || false,
      dod: newSpouseData.dateOfDeath || null,
      photoUrl: newSpouseData.profilePhoto || null,
      bio: newSpouseData.biography || "",
      tribe: newSpouseData.tribe || "",
      language: newSpouseData.language || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await dataService.addPerson(newSpousePayload);

    // Fetch existing marriages of the spouse
    const existingMarriages = await dataService.getMarriagesByPersonId(existingSpouseId);

    // ----------- Polygamous handling -----------
    if (newSpouseData.marriageType === "polygamous") {
      // Only men can have multiple wives
      if (existingSpouse.gender !== "male") {
        const message = "Only husbands can have multiple wives. Polyandry is not allowed.";
        if (onError) onError(message, 'error');
        throw new Error(message);
      }
      if (newSpouseData.gender !== "female") {
        const message = "In polygamous marriages, only female spouses are allowed.";
        if (onError) onError(message, 'error');
        throw new Error(message);
      }

      // Check if a polygamous marriage already exists
      let polygamousMarriage = existingMarriages.find(
        m => m.marriageType === "polygamous" && m.husbandId === existingSpouseId
      );

      if (polygamousMarriage) {
        // Add new wife to existing polygamous marriage
        polygamousMarriage.wives.push({
          wifeId: newSpouseId,
          order: newSpouseData.wifeOrder || polygamousMarriage.wives.length + 1,
          startDate: newSpouseData.marriageDate || null,
          location: newSpouseData.marriageLocation || null,
          notes: newSpouseData.marriageNotes || null,
          childrenIds: [],
        });

        const updatedMarriage = await dataService.updateMarriage(polygamousMarriage.id, {
          wives: polygamousMarriage.wives,
          updatedAt: new Date().toISOString(),
        });

        return { spouse: newSpousePayload, marriage: updatedMarriage, marriageAction: "updated" };
      }

      // Otherwise, create a new polygamous marriage
      const marriageId = generateId("marriage");
      const marriagePayload = {
        id: marriageId,
        treeId,
        marriageType: "polygamous",
        husbandId: existingSpouseId,
        wives: [{
          wifeId: newSpouseId,
          order: newSpouseData.wifeOrder || 1,
          startDate: newSpouseData.marriageDate || null,
          location: newSpouseData.marriageLocation || null,
          notes: newSpouseData.marriageNotes || null,
          childrenIds: [],
        }],
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

    // ----------- Monogamous handling -----------
    if (existingSpouse.gender === newSpouseData.gender) {
      const message = "Same-sex marriages are not allowed.";
      if (onError) onError(message, 'error');
      throw new Error(message);
    }

    // Check if an existing monogamous marriage with this spouse exists
    let existingMonogamous = existingMarriages.find(
      m => m.marriageType === "monogamous" && m.spouses.includes(existingSpouseId)
    );

    if (existingMonogamous) {
      // Update the marriage with the new spouse
      existingMonogamous.spouses.push(newSpouseId);
      const updatedMarriage = await dataService.updateMarriage(existingMonogamous.id, {
        spouses: existingMonogamous.spouses,
        updatedAt: new Date().toISOString(),
      });

      return { spouse: newSpousePayload, marriage: updatedMarriage, marriageAction: "updated" };
    }

    // Otherwise, create a new monogamous marriage
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

  } catch (err) {
    console.error("Error adding spouse:", err);
    if (onError && !err.message.includes("not allowed")) {
      onError(err.message || 'An unexpected error occurred.', 'error');
    }
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

    // Add under existing marriage
    if (marriageId) {
      await dataService.addChildToMarriage(marriageId, childId);
      return { child: childPayload, marriageId };
    }

    // Add under single parent 
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
