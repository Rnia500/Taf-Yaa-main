// src/controllers/treeController.js
import dataService from "../../services/dataService";
import { generateId } from "../../utils/personUtils/idGenerator";



export async function addSpouse(treeId, existingSpouseId, newSpouseData, options = {}) {
  const { onError } = options;
  console.log("DBG:addSpouse -> start", { treeId, existingSpouseId, newSpouseData });

  try {
    const existingSpouse = await dataService.getPerson(existingSpouseId);
    console.log("DBG:addSpouse -> existingSpouse fetched:", existingSpouse);

    if (!existingSpouse) {
      const message = "Existing spouse not found";
      if (onError) onError(message, "error");
      throw new Error(message);
    }

    // -------------------------------------------------------
    // 1. Try to find an already existing person (avoid duplicates)
    // -------------------------------------------------------
    let newSpousePayload;
    let newSpouseId;

    const possibleMatch = await dataService.findPersonByFields?.({
      treeId,
      name: newSpouseData.fullName,
      gender: newSpouseData.gender,
      dob: newSpouseData.dateOfBirth || null,
    });

    if (possibleMatch) {
      console.log("DBG:addSpouse -> spouse already exists, reusing:", possibleMatch.id);
      newSpousePayload = possibleMatch;
      newSpouseId = possibleMatch.id;
    } else {
      newSpouseId = generateId("person");
      newSpousePayload = {
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
      console.log("DBG:addSpouse -> creating person:", newSpousePayload);
      await dataService.addPerson(newSpousePayload);
    }

    // -------------------------------------------------------
    // 2. Get existing marriages of the existing spouse
    // -------------------------------------------------------
    const existingMarriages = await dataService.getMarriagesByPersonId(existingSpouseId);
    console.log("DBG:addSpouse -> existingMarriages:", existingMarriages.map(m => ({ id: m.id, type: m.marriageType })));

    // -------------------------------------------------------
    // 3. Polygamous path
    // -------------------------------------------------------
    if (newSpouseData.marriageType === "polygamous") {
      console.log("DBG:addSpouse -> polygamous branch");
      if (existingSpouse.gender !== "male") {
        const message = "Only husbands can have multiple wives. Polyandry is not allowed.";
        if (onError) onError(message, "error");
        throw new Error(message);
      }
      if (newSpouseData.gender !== "female") {
        const message = "In polygamous marriages, only female spouses are allowed.";
        if (onError) onError(message, "error");
        throw new Error(message);
      }

      let polygamousMarriage = existingMarriages.find(
        m => m.marriageType === "polygamous" && m.husbandId === existingSpouseId
      );

      if (polygamousMarriage) {
        if (polygamousMarriage.wives.some(w => w.wifeId === newSpouseId)) {
          console.log("DBG:addSpouse -> wife already in marriage, skipping");
          return { spouse: newSpousePayload, marriage: polygamousMarriage, marriageAction: "noop" };
        }

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

        console.log("DBG:addSpouse -> updated polygamous marriage:", updatedMarriage);
        return { spouse: newSpousePayload, marriage: updatedMarriage, marriageAction: "updated" };
      }

      // New polygamous marriage
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
      console.log("DBG:addSpouse -> creating new polygamous marriage:", marriagePayload);
      await dataService.addMarriage(marriagePayload);
      return { spouse: newSpousePayload, marriage: marriagePayload, marriageAction: "created" };
    }

    // -------------------------------------------------------
    // 4. Monogamous path
    // -------------------------------------------------------
    console.log("DBG:addSpouse -> monogamous branch");
    if (existingSpouse.gender === newSpouseData.gender) {
      const message = "Same-sex marriages are not allowed.";
      if (onError) onError(message, "error");
      throw new Error(message);
    }

    let existingMonogamous = existingMarriages.find(
      m => m.marriageType === "monogamous" && m.spouses.includes(newSpouseId)
    );

    if (existingMonogamous) {
      console.log("DBG:addSpouse -> marriage already exists, skipping");
      return { spouse: newSpousePayload, marriage: existingMonogamous, marriageAction: "noop" };
    }

    if (!newSpouseData || !newSpouseData.fullName || !newSpouseData.gender) {
      const message = "Invalid spouse data: fullName and gender are required.";
      console.error("DBG:addSpouse ->", message, newSpouseData);
      if (onError) onError(message, "error");
      throw new Error(message);
    }

    // New monogamous marriage
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

    console.log("DBG:addSpouse -> creating new monogamous marriage:", marriagePayload);
    await dataService.addMarriage(marriagePayload);

    console.log("DBG:addSpouse -> completed creation", { newSpouseId, marriageId });
    return { spouse: newSpousePayload, marriage: marriagePayload, marriageAction: "created" };

  } catch (err) {
    console.error("DBG:addSpouse -> Error adding spouse:", err);
    if (onError) onError(err.message || "An unexpected error occurred.", "error");
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
