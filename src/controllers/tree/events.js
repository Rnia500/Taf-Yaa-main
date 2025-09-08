// src/controllers/tree/events.js
import { createEvent } from "../../models/treeModels/EventModel";
import dataService from "../../services/dataService";

/**
 * Add a generic event (birth, death, marriage, custom, etc.)
 */
export async function addEvent(treeId, personIds, type, options = {}) {
  const event = createEvent({
    treeId,
    personIds,
    type,
    ...options,
  });

  // Persist the event using dataService
  await dataService.addEvent(event);

  return event;
}


export async function addBirth(treeId, personId, options = {}) {
  return addEvent(treeId, [personId], "birth", options);
}


export async function addDeath(treeId, personId, options = {}) {
  return addEvent(treeId, [personId], "death", options);
}


export async function addMarriage(treeId, personId1, personId2, options = {}) {
  return addEvent(treeId, [personId1, personId2], "marriage", options);
}


export async function addDivorce(treeId, personId1, personId2, options = {}) {
  return addEvent(treeId, [personId1, personId2], "divorce", options);
}


export async function addCustom(treeId, personIds, customType, options = {}) {
  return addEvent(treeId, personIds, "custom", {
    customType,
    ...options,
  });
}
