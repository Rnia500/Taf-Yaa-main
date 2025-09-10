// src/services/data/eventServiceFirebase.js

async function addEventFirebase(event) {
  throw new Error("Firebase addEvent not implemented yet");
}

async function getEventFirebase(eventId) {
  throw new Error("Firebase getEvent not implemented yet");
}

async function updateEventFirebase(eventId, updatedData) {
  throw new Error("Firebase updateEvent not implemented yet");
}

async function deleteEventFirebase(eventId) {
  throw new Error("Firebase deleteEvent not implemented yet");
}

async function getAllEventsFirebase() {
  throw new Error("Firebase getAllEvents not implemented yet");
}

async function getEventsByPersonIdFirebase(personId) {
  throw new Error("Firebase getEventsByPersonId not implemented yet");
}

async function findEventsByTitleFirebase(query) {
  throw new Error("Firebase findEventsByTitle not implemented yet");
}

// Export all the functions in an object with keys matching the local service.
export const eventServiceFirebase = {
  addEvent: addEventFirebase,
  getEvent: getEventFirebase,
  updateEvent: updateEventFirebase,
  deleteEvent: deleteEventFirebase,
  getAllEvents: getAllEventsFirebase,
  getEventsByPersonId: getEventsByPersonIdFirebase,
  findEventsByTitle: findEventsByTitleFirebase,
};