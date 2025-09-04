// src/controllers/treeController.js
import dataService from "../../services/dataService";
import { generateId } from "../../utils/personUtils/idGenerator";


// src/controllers/treeController.js
export async function addSpouse(treeId, existingSpouseId, newSpouseData, options = {}) {
  const { onError, confirmConvert } = options;
  console.log("DBG:addSpouse -> start", { treeId, existingSpouseId, newSpouseData });

  try {
    // -------------------------------------------------------
    // 1. Validate existing spouse
    // -------------------------------------------------------
    const existingSpouse = await dataService.getPerson(existingSpouseId);
    if (!existingSpouse) throw new Error("Existing spouse not found");

    // Rule 1: Prevent adding spouse to someone who is only a spouse
    if (existingSpouse.isSpouse) {
      const msg = "❌ Cannot add a spouse to a spouse. Only directline members can initiate marriages.";
      console.warn("DBG:addSpouse -> blocked:", msg);
      onError?.(msg, "error");
      return null;
    }

    const existingMarriages = await dataService.getMarriagesByPersonId(existingSpouseId);
    const existingMonogamous = existingMarriages.find(m => m.marriageType === "monogamous");

    // Rule 2: Prevent adding more than one spouse to a directline female
    if (existingSpouse.gender === "female" && existingMarriages.length >= 1) {
      const msg = "❌ Directline females cannot have more than one spouse.";
      console.warn("DBG:addSpouse -> blocked:", msg);
      onError?.(msg, "error");
      return null;
    }

    // -------------------------------------------------------
    // 2. Configurable relationship rules
    // -------------------------------------------------------
    const rules = {
      allowSameSexMarriage: false,
      allowPolyandry: false,
      allowPolygyny: true,
    };

    // Block same-sex if disabled
    if (!rules.allowSameSexMarriage && existingSpouse.gender === newSpouseData.gender) {
      throw new Error("❌ Same-sex marriages are not allowed.");
    }

    // If trying to add polygamous marriage
    if (newSpouseData.marriageType === "polygamous") {
      if (existingSpouse.gender !== "male" && !rules.allowPolyandry) {
        throw new Error("❌ Only husbands can have multiple wives. Polyandry is not allowed.");
      }
      if (newSpouseData.gender !== "female" && !rules.allowSameSexMarriage) {
        throw new Error("❌ Polygamous marriages must add female wives.");
      }
    }

    // -------------------------------------------------------
    // 3. Handle monogamous conversion check BEFORE creating new person
    // -------------------------------------------------------
    if (existingMonogamous) {
      if (existingMonogamous.spouses.includes(newSpouseData.id)) {
        return { spouse: null, marriage: existingMonogamous, marriageAction: "noop" };
      }

      if (confirmConvert) {
        const shouldConvert = await confirmConvert(existingMonogamous);
        if (!shouldConvert) {
          onError?.("User cancelled spouse addition.", "warning");
          return null;
        }
      } else {
        throw new Error("❌ Existing marriage is monogamous. Conversion required.");
      }
    }

    // -------------------------------------------------------
    // 4. Create or reuse spouse 
    // -------------------------------------------------------
    let newSpouseId, newSpousePayload;
    const possibleMatch = await dataService.findPersonByFields?.({
      treeId,
      name: newSpouseData.fullName,
      gender: newSpouseData.gender,
      dob: newSpouseData.dateOfBirth || null,
    });

    if (possibleMatch) {
      newSpouseId = possibleMatch.id;
      newSpousePayload = possibleMatch;
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
        isSpouse: true, 
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await dataService.addPerson(newSpousePayload);
    }


    // -------------------------------------------------------
    // 6. Handle Polygamous marriage
    // -------------------------------------------------------
    if (newSpouseData.marriageType === "polygamous") {
      let polygamousMarriage = existingMarriages.find(
        m => m.marriageType === "polygamous" && m.husbandId === existingSpouseId
      );

      if (polygamousMarriage) {
        // Prevent duplicates
        if (polygamousMarriage.wives.some(w => w.wifeId === newSpouseId)) {
          return { spouse: newSpousePayload, marriage: polygamousMarriage, marriageAction: "noop" };
        }

        // Add wife
        polygamousMarriage.wives.push({
          wifeId: newSpouseId,
          order: newSpouseData.wifeOrder || polygamousMarriage.wives.length + 1,
          startDate: newSpouseData.marriageDate || null,
          location: newSpouseData.marriageLocation || null,
          notes: newSpouseData.marriageNotes || null,
          childrenIds: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });

        const updatedMarriage = await dataService.updateMarriage(polygamousMarriage.id, {
          wives: polygamousMarriage.wives,
          updatedAt: new Date().toISOString(),
        });

        return { spouse: newSpousePayload, marriage: updatedMarriage, marriageAction: "updated" };
      }

      // Create new polygamous marriage
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
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await dataService.addMarriage(marriagePayload);
      return { spouse: newSpousePayload, marriage: marriagePayload, marriageAction: "created" };
    }

    // -------------------------------------------------------
    // 7. Handle Monogamous (new marriage or conversion)
    // -------------------------------------------------------
    if (existingMonogamous) {
      // Convert monogamous → polygamous
      const [sp1, sp2] = existingMonogamous.spouses;
      const sp1Person = await dataService.getPerson(sp1);
      const sp2Person = await dataService.getPerson(sp2);

      const husbandId = sp1Person.gender === "male" ? sp1 : (sp2Person.gender === "male" ? sp2 : null);
      if (!husbandId) {
        throw new Error("Invalid marriage: no male spouse found for polygamous conversion.");
      }
      const wifeId = husbandId === sp1 ? sp2 : sp1;

      const polygamousMarriage = {
        ...existingMonogamous,
        marriageType: "polygamous",
        husbandId,
        wives: [
          {
            wifeId,
            order: 1,
            childrenIds: existingMonogamous.childrenIds || [],
            startDate: existingMonogamous.startDate || null,
            location: existingMonogamous.location || null,
            notes: existingMonogamous.notes || null,
            createdAt: existingMonogamous.createdAt,
            updatedAt: new Date().toISOString(),
          },
          {
            wifeId: newSpouseId,
            order: 2,
            childrenIds: [],
            startDate: newSpouseData.marriageDate || null,
            location: newSpouseData.marriageLocation || null,
            notes: newSpouseData.marriageNotes || null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
        ],
        spouses: undefined,
        childrenIds: [],
        updatedAt: new Date().toISOString(),
      };

      await dataService.updateMarriage(polygamousMarriage.id, polygamousMarriage);
      return { spouse: newSpousePayload, marriage: polygamousMarriage, marriageAction: "converted" };
    }

    // Brand new monogamous marriage
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
    console.error("DBG:addSpouse -> Error:", err);
    onError?.(err.message || "Unexpected error.", "error");
    throw err;
  }
}



/**
 * Add a child under a marriage or single parent (with placeholder partner).
 */

export async function addChild(treeId, options) {
  const { marriageId, parentId, childData, motherId } = options;

  try {
    // -------------------------------------------------------
    // 1. Build child payload
    // -------------------------------------------------------
    const childId = generateId("person");
    const childPayload = {
      id: childId,
      treeId,
      name: childData.fullName,
      gender: childData.gender,
      dob: childData.dateOfBirth || null,
      isDeceased: childData.isDeceased || false,
      dod: childData.dateOfDeath || null,
      photoUrl: childData.profilePhoto || null,
      bio: childData.biography || "",
      tribe: childData.tribe || "",
      language: childData.language || "",
      isSpouse: false,            // children are never spouses
      isPlaceholder: false,       // real child, not placeholder
      publicConsent: true,        // default: real people are public
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await dataService.addPerson(childPayload);

    // -------------------------------------------------------
    // 2. If adding to an existing marriage
    // -------------------------------------------------------
    if (marriageId) {
      const marriage = await dataService.getMarriage(marriageId);
      if (!marriage) throw new Error("Marriage not found.");

      if (marriage.marriageType === "polygamous") {
        if (!motherId) {
          throw new Error("Polygamous marriage requires specifying the mother of the child.");
        }

        const wifeExists = marriage.wives.some((w) => w.wifeId === motherId);
        if (!wifeExists) {
          throw new Error("Selected mother does not belong to this marriage.");
        }

        await dataService.addChildToMarriage(marriageId, childId, motherId);
      } else if (marriage.marriageType === "monogamous") {
        await dataService.addChildToMarriage(marriageId, childId, null);
      } else {
        throw new Error(`Unsupported marriage type: ${marriage.marriageType}`);
      }

      return { child: childPayload, marriageId };
    }

    // -------------------------------------------------------
    // 3. If single parent (no marriage yet)
    // -------------------------------------------------------
    if (parentId) {
      const placeholderId = generateId("person");
      const newMarriageId = generateId("marriage");

      const placeholderPayload = {
        id: placeholderId,
        treeId,
        name: "Partner",
        gender: null, 
        isSpouse: true,         // placeholders act as spouses
        isPlaceholder: true,    // mark clearly
        publicConsent: false,   // placeholders should never be public
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const marriagePayload = {
        id: newMarriageId,
        treeId,
        marriageType: "monogamous",
        spouses: [parentId, placeholderId],
        childrenIds: [childId],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await dataService.addPerson(placeholderPayload);
      await dataService.addMarriage(marriagePayload);

      return {
        child: childPayload,
        placeholder: placeholderPayload,
        marriage: marriagePayload,
      };
    }

    // -------------------------------------------------------
    // 4. If neither marriageId nor parentId provided
    // -------------------------------------------------------
    throw new Error("addChild requires either marriageId or parentId");
  } catch (err) {
    console.error("DBG:addChild -> Error:", err);
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
      isSpouse: false,         // real directline parent
      isPlaceholder: false,    // actual person
      publicConsent: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const placeholderId = generateId("person");
    const placeholderPayload = {
      id: placeholderId,
      treeId,
      name: "Partner",
      isSpouse: true,          // partner role
      isPlaceholder: true,     // clearly fake
      publicConsent: false,    // never public
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const marriagePayload = {
      id: marriageId,
      treeId,
      marriageType: "monogamous",
      spouses: [parentId, placeholderId],
      childrenIds: [childId],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
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
