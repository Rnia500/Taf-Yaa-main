import { MarriageModel } from "../../models/treeModels/MarriageModel";
import dataService from "../../services/dataService";
import { addMarriage as createMarriageEvent } from "./events";


export async function createMarriage(treeId, type, createdBy, options = {}) {
  const model = new MarriageModel(treeId, type, createdBy);

  // Allow the caller to provide initial spouses for a monogamous marriage.
  if (options.spouses && model.marriage.marriageType === "monogamous") {
    model.marriage.spouses = [options.spouses[0] || "", options.spouses[1] || ""];
    model.marriage.startDate = options.startDate || null;
    model.marriage.location = options.location || null;
    model.marriage.notes = options.notes || null;
  }

  const saved = await dataService.addMarriage(model.marriage);

  // If we created a complete monogamous marriage, create the associated event.
  try {
    if (saved.marriageType === "monogamous" && saved.spouses?.[0] && saved.spouses?.[1]) {
      await createMarriageEvent(saved.treeId, saved.spouses[0], saved.spouses[1], {
        date: saved.startDate || null,
        location: saved.location || null,
        title: "Marriage",
      });
    }
  } catch (err) {
    console.error("Failed to create marriage event after createMarriage:", err);
  }

  return saved;
}


export async function addSpouseToMarriage(marriageId, personId) {
  const marriage = await dataService.getMarriage(marriageId);
  if (!marriage) throw new Error(`Marriage ${marriageId} not found`);

  const model = new MarriageModel(marriage.treeId, marriage.marriageType, marriage.createdBy);
  model.marriage = marriage; // Hydrate the model with existing data.

  model.addSpouse(personId);
  const updated = await dataService.updateMarriage(marriageId, model.marriage);

  // If the marriage is now complete, create the event.
  try {
    if (updated.marriageType === "monogamous" && updated.spouses?.[0] && updated.spouses?.[1]) {
      await createMarriageEvent(updated.treeId, updated.spouses[0], updated.spouses[1], {
        date: updated.startDate || null,
        location: updated.location || null,
        title: "Marriage",
      });
    }
  } catch (err) {
    console.error("Failed to create marriage event after addSpouseToMarriage:", err);
  }

  return updated;
}


export async function addWifeToMarriage(marriageId, wifeId) {
  const marriage = await dataService.getMarriage(marriageId);
  if (!marriage) throw new Error(`Marriage ${marriageId} not found`);
  if (marriage.marriageType !== 'polygamous') throw new Error('Cannot add a wife to a non-polygamous marriage.');

  const model = new MarriageModel(marriage.treeId, marriage.marriageType, marriage.createdBy);
  model.marriage = marriage; // Hydrate

  model.addWife(wifeId);
  const updated = await dataService.updateMarriage(marriageId, model.marriage);

  // For polygamous marriages, always create an event for the new husband-wife pair.
  try {
    if (updated.husbandId && wifeId) {
      await createMarriageEvent(updated.treeId, updated.husbandId, wifeId, {
        title: `Marriage (wife #${updated.wives.length})`,
      });
    }
  } catch (err) {
    console.error("Failed to create marriage event after addWifeToMarriage:", err);
  }

  return updated;
}


export async function addChildToMarriage(marriageId, childId, wifeId) {
  const marriage = await dataService.getMarriage(marriageId);
  if (!marriage) throw new Error(`Marriage ${marriageId} not found`);

  const model = new MarriageModel(marriage.treeId, marriage.marriageType, marriage.createdBy);
  model.marriage = marriage; // Hydrate

  model.addChild(childId, wifeId);
  return await dataService.updateMarriage(marriageId, model.marriage);
}


export async function handleSpouseAddition(existingSpouse, newSpouse, formData, confirmConvert, createdBy = "system") {
  const { treeId } = existingSpouse;
  const existingMarriages = await dataService.getMarriagesByPersonId(existingSpouse.id);
  const existingMonogamous = existingMarriages.find(m => m.marriageType === "monogamous");
  const existingPolygamousForHusband = existingMarriages.find(m => m.marriageType === "polygamous" && m.husbandId === existingSpouse.id);

  // --- Scenario 1: Husband is already in a polygamous marriage -> APPEND ---
  if (existingPolygamousForHusband) {
    const marriage = await addWifeToMarriage(existingPolygamousForHusband.id, newSpouse.id);
    return { marriage, marriageAction: "updated" };
  }

  // --- Scenario 2: A monogamous marriage exists -> CONVERT ---
  if (existingMonogamous) {
    // Check if user confirmation is needed (i.e., they didn't explicitly choose "polygamous" in the form).
    if (formData.marriageType !== 'polygamous') {
      const ok = await confirmConvert?.(existingMonogamous);
      if (!ok) {
        // Throw a specific error that the top-level orchestrator can catch and handle gracefully.
        throw new Error("User cancelled conversion."); 
      }
    }
    
    // Perform the data transformation from monogamous to polygamous structure.
    const [sp1, sp2] = existingMonogamous.spouses;
    const husbandId = existingSpouse.gender === 'male' ? sp1 : sp2;
    const existingWifeId = existingSpouse.gender === 'male' ? sp2 : sp1;

    const convertedMarriagePayload = {
      ...existingMonogamous,
      marriageType: "polygamous",
      husbandId: husbandId,
      wives: [
        { wifeId: existingWifeId, order: 1, startDate: existingMonogamous.startDate, location: existingMonogamous.location, notes: existingMonogamous.notes, childrenIds: existingMonogamous.childrenIds || [] },
        { wifeId: newSpouse.id, order: 2, startDate: formData.marriageDate, location: formData.marriageLocation, notes: formData.marriageNotes, childrenIds: [] }
      ],
      spouses: undefined, // Remove old monogamous-specific fields.
      childrenIds: [],
      updatedAt: new Date().toISOString(),
    };
    const marriage = await dataService.updateMarriage(existingMonogamous.id, convertedMarriagePayload);

    // To achieve 100% parity with the original function, create marriage events for BOTH wives during conversion.
    try {
      await createMarriageEvent(treeId, husbandId, existingWifeId, { date: existingMonogamous.startDate });
      await createMarriageEvent(treeId, husbandId, newSpouse.id, { date: formData.marriageDate });
    } catch (err) {
      console.error("Failed to create events during marriage conversion:", err);
    }

    return { marriage, marriageAction: "converted" };
  }

  // --- Scenario 3: No existing marriage -> CREATE NEW ---
  if (formData.marriageType === 'monogamous') {
    const marriage = await createMarriage(treeId, "monogamous", createdBy, { 
        spouses: [existingSpouse.id, newSpouse.id],
        startDate: formData.marriageDate,
        location: formData.marriageLocation,
        notes: formData.marriageNotes
    });
    return { marriage, marriageAction: "created" };
  } else { // New Polygamous
    if (existingSpouse.gender !== "male") throw new Error("Only husbands can have multiple wives.");
    
    // Create an empty polygamous marriage record first.
    const newMarriage = await createMarriage(treeId, "polygamous", createdBy);
    // Then, immediately update it with the husband's ID.
    await dataService.updateMarriage(newMarriage.id, { husbandId: existingSpouse.id }); 
    // Finally, add the first wife, which will also trigger the creation of the marriage event.
    const marriage = await addWifeToMarriage(newMarriage.id, newSpouse.id);
    
    return { marriage, marriageAction: "created" };
  }
}