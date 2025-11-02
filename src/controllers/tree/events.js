// src/controllers/tree/events.js
import { createEvent } from "../../models/treeModels/EventModel";
import dataService from "../../services/dataService";

/**
 * Add a generic event (birth, death, marriage, custom, etc.)
 */
export async function addEvent(treeId, personIds, type, options = {}) {
  // Validation: Check birth events and date constraints
  for (const personId of personIds) {
    const person = await dataService.getPerson(personId);
    if (!person) throw new Error(`Person ${personId} not found`);

    // Check if adding a birth event and person already has one
    if (type === 'birth') {
      const existingBirthEvents = await dataService.getEventsByPersonId(personId, treeId);
      const birthEvents = existingBirthEvents.filter(e => e.type === 'birth');
      if (birthEvents.length > 0) {
        throw new Error('Birth event already exists for this person');
      }
    }

    // Check if event date is before person's birth date
    if (options.date && person.dob) {
      const eventDate = new Date(options.date);
      const birthDate = new Date(person.dob);
      if (eventDate < birthDate) {
        throw new Error(`Event date cannot be before the person's birth date (${person.dob})`);
      }
    }
  }

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
  return addEvent(treeId, [personId1, personId2], "marriage", {
    ...options,
    description: options.notes || options.description || null,
  });
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
