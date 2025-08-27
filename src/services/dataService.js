// src/services/dataService.js

/**
 * dataService.js
 * -------------------
 * Abstracts data access between:
 * - Local (dummy + localStorage persistence)
 * - Firestore (later, just swap implementation)
 */

import { people as dummyPeople, marriages as dummyMarriages } from "../data/dummyData.js";

// ✅ Toggle for local vs Firebase
const USE_LOCAL = true; // set false when moving to Firebase

// --- Local Storage Helpers ---
const STORAGE_KEY = "familyDB";

// Load initial DB (dummyData or saved localStorage)
function loadLocalDB() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (err) {
      console.error("Failed to parse local DB:", err);
    }
  }
  return { people: [...dummyPeople], marriages: [...dummyMarriages] };
}

let localDB = loadLocalDB();

function saveLocalDB() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(localDB));
  window.dispatchEvent(new Event('familyDataChanged'));
}

// --- Local implementations ---
function addPerson(person) {
  localDB.people.push(person);
  saveLocalDB();
  return Promise.resolve(person);
}

function addMarriage(marriage) {
  localDB.marriages.push(marriage);
  saveLocalDB();
  return Promise.resolve(marriage);
}

function addChildToMarriage(marriageId, childId) {
  const marriage = localDB.marriages.find((m) => m.id === marriageId);
  if (marriage) {
    marriage.childrenIds.push(childId);
    saveLocalDB();
  }
  return Promise.resolve(marriage);
}

function getPerson(id) {
  return Promise.resolve(localDB.people.find((p) => p.id === id));
}

function getMarriage(id) {
  return Promise.resolve(localDB.marriages.find((m) => m.id === id));
}

function getMarriagesByPersonId(personId) {
  const marriages = localDB.marriages.filter(m => {
    if (m.marriageType === 'monogamous') {
      return m.spouses.includes(personId);
    }
    if (m.marriageType === 'polygamous') {
      return m.husbandId === personId || m.wives.some(w => w.wifeId === personId);
    }
    return false;
  });
  return Promise.resolve(marriages);
}

// ✨ NEW: Function to update an existing marriage
function updateMarriage(marriageId, updatedMarriageData) {
  const marriageIndex = localDB.marriages.findIndex(m => m.id === marriageId);
  if (marriageIndex !== -1) {
    localDB.marriages[marriageIndex] = { ...localDB.marriages[marriageIndex], ...updatedMarriageData };
    saveLocalDB();
    return Promise.resolve(localDB.marriages[marriageIndex]);
  }
  return Promise.reject(new Error("Marriage not found"));
}


function clearLocalDB() {
  localDB = { people: [...dummyData.people], marriages: [...dummyData.marriages] };
  saveLocalDB();
}

// --- Firebase stubs (future-ready) ---
async function addPersonFirebase(person) {
  throw new Error("Firebase addPerson not implemented yet");
}
async function addMarriageFirebase(marriage) {
  throw new Error("Firebase addMarriage not implemented yet");
}
async function addChildToMarriageFirebase(marriageId, childId) {
  throw new Error("Firebase addChildToMarriage not implemented yet");
}
async function getPersonFirebase(id) {
  throw new Error("Firebase getPerson not implemented yet");
}
async function getMarriageFirebase(id) {
  throw new Error("Firebase getMarriage not implemented yet");
}

async function getMarriagesByPersonIdFirebase(personId) { throw new Error("Not implemented"); }
async function updateMarriageFirebase(marriageId, data) { throw new Error("Not implemented"); }


// --- Export API ---
const dataService = {
  addPerson: USE_LOCAL ? addPerson : addPersonFirebase,
  addMarriage: USE_LOCAL ? addMarriage : addMarriageFirebase,
  addChildToMarriage: USE_LOCAL ? addChildToMarriage : addChildToMarriageFirebase,
  getPerson: USE_LOCAL ? getPerson : getPersonFirebase,
  getMarriage: USE_LOCAL ? getMarriage : getMarriageFirebase,
  getMarriagesByPersonId: USE_LOCAL ? getMarriagesByPersonId : getMarriagesByPersonIdFirebase,
  updateMarriage: USE_LOCAL ? updateMarriage : updateMarriageFirebase,
  clearLocalDB, // helpful for dev reset
};

export default dataService;
