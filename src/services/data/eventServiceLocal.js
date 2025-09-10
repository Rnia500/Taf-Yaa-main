// src/services/data/eventServiceLocal.js

// 1. Import the database manager, not the DB itself.
import { getDB, saveDB } from "./localDB.js";
import { generateId } from "../../utils/personUtils/idGenerator.js";

// --- Event-Specific Data Access Functions (Local Storage Implementation) ---

function addEvent(event) {
  const db = getDB();
  // Ensure the events array exists
  db.events = db.events || [];

  const exists = db.events.find(e => e.id === event.id);
  if (exists) {
    console.warn("eventServiceLocal.addEvent -> duplicate event id detected:", event.id);
    event = { ...event, id: generateId("event") };
  }
  db.events.push(event);
  saveDB();
  return Promise.resolve(event);
}

function getEvent(eventId) {
  const db = getDB();
  const ev = (db.events || []).find(e => e.id === eventId);
  return Promise.resolve(ev);
}

function updateEvent(eventId, updatedData) {
  const db = getDB();
  const eventIndex = (db.events || []).findIndex(e => e.id === eventId);
  if (eventIndex === -1) {
    return Promise.reject(new Error("Event not found"));
  }
  db.events[eventIndex] = { ...db.events[eventIndex], ...updatedData, updatedAt: new Date().toISOString() };
  saveDB();
  return Promise.resolve(db.events[eventIndex]);
}

function deleteEvent(eventId) {
  const db = getDB();
  const eventIndex = (db.events || []).findIndex(e => e.id === eventId);
  if (eventIndex === -1) {
    return Promise.reject(new Error("Event not found"));
  }
  const removed = db.events.splice(eventIndex, 1)[0];
  saveDB();
  return Promise.resolve(removed);
}

function getAllEvents() {
  const db = getDB();
  return Promise.resolve([...(db.events || [])]);
}

function getEventsByPersonId(personId) {
  const db = getDB();
  const evts = (db.events || []).filter(e => Array.isArray(e.personIds) && e.personIds.includes(personId));
  return Promise.resolve(evts);
}

function findEventsByTitle(query) {
  const db = getDB();
  if (!query) return Promise.resolve([]);
  const q = String(query).trim().toLowerCase();
  const results = (db.events || []).filter(e => (e.title || '').toLowerCase().includes(q));
  return Promise.resolve(results);
}


// Export all the functions in a single, coherent service object.
export const eventServiceLocal = {
  addEvent,
  getEvent,
  updateEvent,
  deleteEvent,
  getAllEvents,
  getEventsByPersonId,
  findEventsByTitle,
};