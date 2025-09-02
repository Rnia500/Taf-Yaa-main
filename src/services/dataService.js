// src/services/dataService.js
import { people as dummyPeople, marriages as dummyMarriages } from "../data/dummyData.js";

const USE_LOCAL = true;
const STORAGE_KEY = "familyDB";

function loadLocalDB() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      console.log("DBG:dataService -> loaded local DB from localStorage", parsed);
      return parsed;
    } catch (err) {
      console.error("DBG:dataService -> Failed to parse local DB:", err);
    }
  }
  console.log("DBG:dataService -> using dummy DB");
  return { people: [...dummyPeople], marriages: [...dummyMarriages] };
}

let localDB = loadLocalDB();

function saveLocalDB() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(localDB));
  console.log("DBG:dataService -> saved localDB (people count:", localDB.people.length, "marriages count:", localDB.marriages.length + ")");
  window.dispatchEvent(new Event('familyDataChanged'));
}

// --- Local implementations ---
function addPerson(person) {
  console.log("DBG:dataService.addPerson -> adding person:", person);
  localDB.people.push(person);
  saveLocalDB();
  return Promise.resolve(person);
}

function addMarriage(marriage) {
  console.log("DBG:dataService.addMarriage -> adding marriage:", marriage);
  localDB.marriages.push(marriage);
  saveLocalDB();
  return Promise.resolve(marriage);
}

function addChildToMarriage(marriageId, childId) {
  console.log(`DBG:dataService.addChildToMarriage -> marriageId=${marriageId} childId=${childId}`);
  const marriage = localDB.marriages.find((m) => m.id === marriageId);
  if (marriage) {
    marriage.childrenIds = marriage.childrenIds || [];
    marriage.childrenIds.push(childId);
    saveLocalDB();
  }
  return Promise.resolve(marriage);
}

function getPerson(id) {
  const p = localDB.people.find((p) => p.id === id);
  console.log("DBG:dataService.getPerson ->", id, p);
  return Promise.resolve(p);
}

function getMarriage(id) {
  const m = localDB.marriages.find((m) => m.id === id);
  console.log("DBG:dataService.getMarriage ->", id, m);
  return Promise.resolve(m);
}

function getMarriagesByPersonId(personId) {
  const marriages = localDB.marriages.filter(m => {
    if (m.marriageType === 'monogamous') {
      return m.spouses && m.spouses.includes(personId);
    }
    if (m.marriageType === 'polygamous') {
      return m.husbandId === personId || (m.wives && m.wives.some(w => w.wifeId === personId));
    }
    return false;
  });
  console.log(`DBG:dataService.getMarriagesByPersonId -> for ${personId}, found:`, marriages.map(x => x.id));
  return Promise.resolve(marriages);
}

function updateMarriage(marriageId, updatedMarriageData) {
  console.log("DBG:dataService.updateMarriage -> marriageId:", marriageId, "updatedData:", updatedMarriageData);
  const marriageIndex = localDB.marriages.findIndex(m => m.id === marriageId);
  if (marriageIndex !== -1) {
    localDB.marriages[marriageIndex] = { ...localDB.marriages[marriageIndex], ...updatedMarriageData };
    saveLocalDB();
    console.log("DBG:dataService.updateMarriage -> updated marriage:", localDB.marriages[marriageIndex]);
    return Promise.resolve(localDB.marriages[marriageIndex]);
  }
  const err = new Error("Marriage not found");
  console.warn("DBG:dataService.updateMarriage -> marriage not found:", marriageId);
  return Promise.reject(err);
}

function clearLocalDB() {
  localDB = { people: [...dummyPeople], marriages: [...dummyMarriages] };
  saveLocalDB();
  console.log("DBG:dataService.clearLocalDB -> reset to dummy data");
}

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

async function getMarriagesByPersonIdFirebase(personId) { 
  throw new Error("Not implemented"); 
}
async function updateMarriageFirebase(marriageId, data) { 
  throw new Error("Not implemented"); 
}


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
