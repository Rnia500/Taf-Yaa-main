// src/services/dataService.js
import { people as dummyPeople, marriages as dummyMarriages } from "../data/dummyData.js";
import { generateId } from "../utils/personUtils/idGenerator.js";

const USE_LOCAL = true;
const STORAGE_KEY = "familyDB";

function loadLocalDB() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      console.log("DBG:dataService -> loaded local DB from localStorage", parsed);
      normalizeLocalDBIds(parsed);
      return parsed;
    } catch (err) {
      console.error("DBG:dataService -> Failed to parse local DB:", err);
    }
  }
  console.log("DBG:dataService -> using dummy DB");
  const db = { people: [...dummyPeople], marriages: [...dummyMarriages] };
  normalizeLocalDBIds(db);
  return db;
}

function normalizeLocalDBIds(db) {
  if (!db || !Array.isArray(db.people) || !Array.isArray(db.marriages)) return;
  const seen = new Set();
  const oldToNew = {};

  for (const person of db.people) {
    if (!person || !person.id) continue;
    if (seen.has(person.id)) {
      const newId = generateId("person");
      console.warn("DBG:dataService.normalizeLocalDBIds -> duplicate person id detected, reassigning:", person.id, "->", newId);
      oldToNew[person.id] = newId;
      person.id = newId;
    }
    seen.add(person.id);
  }

  if (Object.keys(oldToNew).length === 0) return;

  // Update marriages references
  for (const m of db.marriages) {
    if (!m) continue;
    if (m.husbandId && oldToNew[m.husbandId]) m.husbandId = oldToNew[m.husbandId];
    if (Array.isArray(m.spouses)) m.spouses = m.spouses.map(id => (oldToNew[id] ? oldToNew[id] : id));
    if (Array.isArray(m.childrenIds)) m.childrenIds = m.childrenIds.map(id => (oldToNew[id] ? oldToNew[id] : id));
    if (Array.isArray(m.wives)) {
      for (const w of m.wives) {
        if (w.wifeId && oldToNew[w.wifeId]) w.wifeId = oldToNew[w.wifeId];
        if (Array.isArray(w.childrenIds)) w.childrenIds = w.childrenIds.map(id => (oldToNew[id] ? oldToNew[id] : id));
      }
    }
  }
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
  // Prevent duplicate IDs in the in-memory DB (common during rapid dev/test flows)
  const exists = localDB.people.find(p => p.id === person.id);
  if (exists) {
    console.warn("DBG:dataService.addPerson -> duplicate person id detected:", person.id);
    const newId = generateId("person");
    console.log(`DBG:dataService.addPerson -> assigning new id ${newId} to incoming person to avoid collision`);
    person = { ...person, id: newId };
  }
  localDB.people.push(person);
  saveLocalDB();
  return Promise.resolve(person);
}

function addMarriage(marriage) {
  console.log("DBG:dataService.addMarriage -> adding marriage:", marriage);

  // Invariant: a husband with a polygamous marriage cannot create a monogamous marriage
  if (marriage.marriageType === "monogamous") {
    const [a, b] = marriage.spouses || [];
    const aHasPoly = localDB.marriages.some(m => m.marriageType === "polygamous" && m.husbandId === a);
    const bHasPoly = localDB.marriages.some(m => m.marriageType === "polygamous" && m.husbandId === b);
    if (aHasPoly || bHasPoly) {
      console.error("DBG:dataService.addMarriage -> blocked: monogamous requested but polygamous already exists for one spouse");
      throw new Error("Invariant violation: cannot create monogamous marriage when a polygamous marriage exists for a spouse.");
    }
  }

  const exists = localDB.marriages.find(m => m.id === marriage.id);
  if (exists) {
    console.warn("DBG:dataService.addMarriage -> duplicate marriage id detected:", marriage.id);
    marriage = { ...marriage, id: `${marriage.id}_${Date.now()}` };
  }
  localDB.marriages.push(marriage);
  saveLocalDB();
  return Promise.resolve(marriage);
}


function addChildToMarriage(marriageId, childId, motherId = null) {
  console.log(`DBG:dataService.addChildToMarriage -> marriageId=${marriageId} childId=${childId} motherId=${motherId}`);
  const marriage = localDB.marriages.find((m) => m.id === marriageId);

  if (marriage) {
    if (marriage.marriageType === 'monogamous') {
      marriage.childrenIds = marriage.childrenIds || [];
      marriage.childrenIds.push(childId);
    } else if (marriage.marriageType === 'polygamous' && motherId) {
      const wife = marriage.wives.find(w => w.wifeId === motherId);
      if (wife) {
        wife.childrenIds = wife.childrenIds || [];
        wife.childrenIds.push(childId);
        wife.updatedAt = new Date().toISOString();
      } else {
        console.error(`Could not find mother with ID ${motherId} in marriage ${marriageId}`);
      }
    }
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
