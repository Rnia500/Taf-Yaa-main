// This file is the central manager for all localStorage operations.
// It handles loading, saving, and normalizing the local database object.

import { people as dummyPeople, marriages as dummyMarriages } from "../../data/dummyData.js";
import { generateId } from "../../utils/personUtils/idGenerator.js";

const STORAGE_KEY = "familyDB";
let localDB = null; 


function loadLocalDB() {
  if (localDB) {
    return localDB;
  }

  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      normalizeLocalDBIds(parsed);
      localDB = parsed; // Cache the loaded DB
      console.log("DBG:localDB -> loaded and cached DB from localStorage");
      return localDB;
    } catch (err) {
      console.error("DBG:localDB -> Failed to parse local DB:", err);
    }
  }
  
  console.log("DBG:localDB -> initializing with dummy DB");
  const db = { 
    people: [...dummyPeople], 
    marriages: [...dummyMarriages], 
    stories: [], 
    events: [],
    files: [] // Ensure files array exists
  };
  normalizeLocalDBIds(db);
  localDB = db; // Cache the new DB
  return localDB;
}


export function getDB() {
  return loadLocalDB();
}


export function saveDB() {
  const db = getDB();
  const dispatchChange = () => window.dispatchEvent(new Event("familyDataChanged"));

  const attemptSave = (database, label) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(database));
    console.log(`DBG:localDB.saveDB -> saved localDB${label}`);
    dispatchChange();
  };

  try {
    attemptSave(db, "");
  } catch (err) {
    console.warn("DBG:localDB.saveDB -> initial save failed:", err?.message || err);
    
    // Create a deep copy to avoid mutating the in-memory DB
    const prunedDB = JSON.parse(JSON.stringify(db));

    try {
      if (Array.isArray(prunedDB.files) && prunedDB.files.length > 0) {
        // Prune binary data from files to save space
        prunedDB.files = prunedDB.files.map(f => ({ ...f, data: null }));
      }
      attemptSave(prunedDB, " (after pruning file data)");
    } catch (err2) {
      console.error("DBG:localDB.saveDB -> retry after pruning failed:", err2?.message || err2);
      try {
        // As a last resort, remove the files array entirely for the save attempt.
        delete prunedDB.files;
        attemptSave(prunedDB, " (after removing files array)");
      } catch (err3) {
        console.error("DBG:localDB.saveDB -> final save attempt failed:", err3?.message || err3);
        throw err3; // Re-throw the final error
      }
    }
  }
}

/**
 * Clears the database from localStorage and reloads it with the default dummy data.
 */
export function clearDB() {
  localStorage.removeItem(STORAGE_KEY);
  localDB = null; // Clear the in-memory cache
  loadLocalDB();    // This will now re-initialize from dummy data
  saveDB();         // Save the fresh dummy data state
  console.log("DBG:localDB.clearDB -> database has been reset to dummy data");
}



function normalizeLocalDBIds(db) {
  if (!db || !Array.isArray(db.people) || !Array.isArray(db.marriages)) return;
  const seen = new Set();
  const oldToNew = {};

  // Find duplicates and create a mapping from old ID to new ID
  for (const person of (db.people || [])) {
    if (!person || !person.id) continue;
    if (seen.has(person.id)) {
      const newId = generateId("person");
      console.warn(`DBG:localDB.normalize -> duplicate person id detected, reassigning: ${person.id} -> ${newId}`);
      oldToNew[person.id] = newId;
      person.id = newId;
    }
    seen.add(person.id);
  }

  if (Object.keys(oldToNew).length === 0) return;

  // Update references in Marriages
  for (const m of (db.marriages || [])) {
    if (!m) continue;
    if (m.husbandId && oldToNew[m.husbandId]) m.husbandId = oldToNew[m.husbandId];
    if (Array.isArray(m.spouses)) m.spouses = m.spouses.map(id => oldToNew[id] || id);
    if (Array.isArray(m.childrenIds)) m.childrenIds = m.childrenIds.map(id => oldToNew[id] || id);
    if (Array.isArray(m.wives)) {
      for (const w of m.wives) {
        if (w.wifeId && oldToNew[w.wifeId]) w.wifeId = oldToNew[w.wifeId];
        if (Array.isArray(w.childrenIds)) w.childrenIds = w.childrenIds.map(id => oldToNew[id] || id);
      }
    }
  }

  // Update references in Stories
  if (Array.isArray(db.stories)) {
    for (const s of db.stories) {
      if (!s) continue;
      if (s.personId && oldToNew[s.personId]) s.personId = oldToNew[s.personId];
      if (Array.isArray(s.personIds)) s.personIds = s.personIds.map(id => oldToNew[id] || id);
    }
  }

  // Update references in Events
  if (Array.isArray(db.events)) {
    for (const ev of db.events) {
      if (!ev) continue;
      if (Array.isArray(ev.personIds)) ev.personIds = ev.personIds.map(id => oldToNew[id] || id);
    }
  }
}