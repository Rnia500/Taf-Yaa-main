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
  const db = { people: [...dummyPeople], marriages: [...dummyMarriages], stories: [], events: [] };
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

  // Update stories references (personId or personIds)
  if (Array.isArray(db.stories)) {
    for (const s of db.stories) {
      if (!s) continue;
      if (s.personId && oldToNew[s.personId]) s.personId = oldToNew[s.personId];
      if (Array.isArray(s.personIds)) s.personIds = s.personIds.map(id => (oldToNew[id] ? oldToNew[id] : id));
    }
  }

  // Update events references (personIds)
  if (Array.isArray(db.events)) {
    for (const ev of db.events) {
      if (!ev) continue;
      if (Array.isArray(ev.personIds)) ev.personIds = ev.personIds.map(id => (oldToNew[id] ? oldToNew[id] : id));
    }
  }
}

let localDB = loadLocalDB();

function saveLocalDB() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(localDB));
    console.log("DBG:dataService -> saved localDB (people:", localDB.people.length, "marriages:", localDB.marriages.length, "stories:", (localDB.stories||[]).length, "events:", (localDB.events||[]).length, ")");
    window.dispatchEvent(new Event('familyDataChanged'));
    return;
  } catch (err) {

    console.warn('DBG:dataService.saveLocalDB -> initial save failed, attempting to prune file data and retry:', err && err.message ? err.message : err);
    try {
      if (Array.isArray(localDB.files) && localDB.files.length > 0) {
        // Remove stored binary payloads to free space, but keep file metadata
        localDB.files = localDB.files.map(f => ({ ...f, data: null }));
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(localDB));
      console.log('DBG:dataService -> saved localDB after pruning file data');
      window.dispatchEvent(new Event('familyDataChanged'));
      return;
    } catch (err2) {
      console.error('DBG:dataService.saveLocalDB -> retry after pruning file data failed:', err2 && err2.message ? err2.message : err2);
      try {
        // As a last resort, drop the files array entirely and try once more.
        delete localDB.files;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(localDB));
        console.log('DBG:dataService -> saved localDB after removing files array');
        window.dispatchEvent(new Event('familyDataChanged'));
        return;
      } catch (err3) {
        // If still failing, surface the error so callers can handle it.
        console.error('DBG:dataService.saveLocalDB -> final save attempt failed:', err3 && err3.message ? err3.message : err3);
        throw err3;
      }
    }
  }
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

/* ---------------- Stories ---------------- */
function addStory(story) {
  console.log("DBG:dataService.addStory -> adding story:", story);
  const exists = (localDB.stories || []).find(s => s.storyId === story.storyId);
  if (exists) {
    console.warn("DBG:dataService.addStory -> duplicate story id detected:", story.storyId);
    story = { ...story, storyId: `${story.storyId}_${Date.now()}` };
  }
  localDB.stories = localDB.stories || [];
  localDB.stories.push(story);
  saveLocalDB();
  return Promise.resolve(story);
}

/* ---------------- Events ---------------- */
function addEvent(event) {
  console.log("DBG:dataService.addEvent -> adding event:", event);
  localDB.events = localDB.events || [];
  const exists = localDB.events.find(e => e.id === event.id);
  if (exists) {
    console.warn("DBG:dataService.addEvent -> duplicate event id detected:", event.id);
    event = { ...event, id: `${event.id}_${Date.now()}` };
  }
  localDB.events.push(event);
  saveLocalDB();
  return Promise.resolve(event);
}

function getEvent(eventId) {
  const ev = (localDB.events || []).find(e => e.id === eventId);
  console.log("DBG:dataService.getEvent ->", eventId, ev);
  return Promise.resolve(ev);
}

function getEventsByPersonId(personId) {
  const evts = (localDB.events || []).filter(e => Array.isArray(e.personIds) && e.personIds.includes(personId));
  console.log(`DBG:dataService.getEventsByPersonId -> for ${personId}, found:`, evts.map(x => x.id));
  return Promise.resolve(evts);
}

function updateEvent(eventId, updatedData) {
  const idx = (localDB.events || []).findIndex(e => e.id === eventId);
  if (idx === -1) {
    const err = new Error("Event not found");
    console.warn("DBG:dataService.updateEvent -> event not found:", eventId);
    return Promise.reject(err);
  }
  const updated = { ...localDB.events[idx], ...updatedData, updatedAt: new Date().toISOString() };
  localDB.events[idx] = updated;
  saveLocalDB();
  console.log("DBG:dataService.updateEvent -> updated:", updated);
  return Promise.resolve(updated);
}

function deleteEvent(eventId) {
  const idx = (localDB.events || []).findIndex(e => e.id === eventId);
  if (idx === -1) {
    const err = new Error("Event not found");
    console.warn("DBG:dataService.deleteEvent -> event not found:", eventId);
    return Promise.reject(err);
  }
  const removed = localDB.events.splice(idx, 1)[0];
  saveLocalDB();
  console.log("DBG:dataService.deleteEvent -> removed:", removed);
  return Promise.resolve(removed);
}

function getAllEvents() {
  return Promise.resolve([...(localDB.events || [])]);
}

function findEventsByTitle(query) {
  if (!query) return Promise.resolve([]);
  const q = String(query).trim().toLowerCase();
  const results = (localDB.events || []).filter(e => (e.title || '').toLowerCase().includes(q));
  return Promise.resolve(results);
}

function getStory(storyId) {
  const s = (localDB.stories || []).find(st => st.storyId === storyId);
  console.log("DBG:dataService.getStory ->", storyId, s);
  return Promise.resolve(s);
}

function getStoriesByPersonId(personId) {
  const stories = (localDB.stories || []).filter(s => s.personId === personId || (Array.isArray(s.personIds) && s.personIds.includes(personId)));
  console.log(`DBG:dataService.getStoriesByPersonId -> for ${personId}, found:`, (stories||[]).map(x => x.storyId));
  return Promise.resolve(stories);
}

function updateStory(storyId, updatedData) {
  const idx = (localDB.stories || []).findIndex(s => s.storyId === storyId);
  if (idx === -1) {
    const err = new Error("Story not found");
    console.warn("DBG:dataService.updateStory -> story not found:", storyId);
    return Promise.reject(err);
  }
  const updated = { ...localDB.stories[idx], ...updatedData, updatedAt: new Date().toISOString() };
  localDB.stories[idx] = updated;
  saveLocalDB();
  console.log("DBG:dataService.updateStory -> updated:", updated);
  return Promise.resolve(updated);
}

function deleteStory(storyId) {
  const idx = (localDB.stories || []).findIndex(s => s.storyId === storyId);
  if (idx === -1) {
    const err = new Error("Story not found");
    console.warn("DBG:dataService.deleteStory -> story not found:", storyId);
    return Promise.reject(err);
  }
  const removed = localDB.stories.splice(idx, 1)[0];
  saveLocalDB();
  console.log("DBG:dataService.deleteStory -> removed:", removed);
  return Promise.resolve(removed);
}

function getAllStories() {
  return Promise.resolve([...(localDB.stories || [])]);
}

function findStoriesByTitle(query) {
  if (!query) return Promise.resolve([]);
  const q = String(query).trim().toLowerCase();
  const results = (localDB.stories || []).filter(s => (s.title || '').toLowerCase().includes(q));
  return Promise.resolve(results);
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

function getMarriagesByChildId(childId) {
  const marriages = localDB.marriages.filter(m => {
    if (m.childrenIds?.includes(childId)) return true;
    if (m.marriageType === 'polygamous') {
      return m.wives.some(w => w.childrenIds?.includes(childId));
    }
    return false;
  });
  console.log(`DBG:dataService.getMarriagesByChildId -> for ${childId}, found:`, marriages.map(x => x.id));
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

function updatePerson(personId, updatedPersonData) {
  console.log("DBG:dataService.updatePerson ->", personId, updatedPersonData);
  const idx = localDB.people.findIndex(p => p.id === personId);
  if (idx === -1) {
    const err = new Error("Person not found");
    console.warn("DBG:dataService.updatePerson -> person not found:", personId);
    return Promise.reject(err);
  }
  const updated = { ...localDB.people[idx], ...updatedPersonData, updatedAt: new Date().toISOString() };
  localDB.people[idx] = updated;
  saveLocalDB();
  console.log("DBG:dataService.updatePerson -> updated:", updated);
  return Promise.resolve(updated);
}

function deleteMarriage(marriageId) {
  console.log("DBG:dataService.deleteMarriage ->", marriageId);
  const idx = localDB.marriages.findIndex(m => m.id === marriageId);
  if (idx === -1) {
    const err = new Error("Marriage not found");
    console.warn("DBG:dataService.deleteMarriage -> marriage not found:", marriageId);
    return Promise.reject(err);
  }
  const removed = localDB.marriages.splice(idx, 1)[0];
  saveLocalDB();
  console.log("DBG:dataService.deleteMarriage -> removed:", removed);
  return Promise.resolve(removed);
}

function deletePerson(personId) {
  console.log("DBG:dataService.deletePerson ->", personId);
  const personIdx = localDB.people.findIndex(p => p.id === personId);
  if (personIdx === -1) {
    const err = new Error("Person not found");
    console.warn("DBG:dataService.deletePerson -> person not found:", personId);
    return Promise.reject(err);
  }

  // Remove or update marriages that reference this person
  const marriagesToRemove = [];
  for (let i = localDB.marriages.length - 1; i >= 0; i--) {
    const m = localDB.marriages[i];
    if (!m) continue;
    // monogamous: if spouses include the person, remove the marriage
    if (m.marriageType === 'monogamous') {
      if (Array.isArray(m.spouses) && m.spouses.includes(personId)) {
        marriagesToRemove.push(m.id);
        localDB.marriages.splice(i, 1);
      }
    } else if (m.marriageType === 'polygamous') {
      // if person is husband -> remove marriage
      if (m.husbandId === personId) {
        marriagesToRemove.push(m.id);
        localDB.marriages.splice(i, 1);
        continue;
      }
      // if person is one of the wives -> remove that wife entry
      if (Array.isArray(m.wives)) {
        const wifeIdx = m.wives.findIndex(w => w.wifeId === personId);
        if (wifeIdx !== -1) {
          m.wives.splice(wifeIdx, 1);
        }
      }
    }
  }

  // Finally remove the person
  const removedPerson = localDB.people.splice(personIdx, 1)[0];
  saveLocalDB();
  console.log("DBG:dataService.deletePerson -> removed person:", removedPerson, "removed marriages:", marriagesToRemove);
  return Promise.resolve({ person: removedPerson, removedMarriageIds: marriagesToRemove });
}

function getAllPeople() {
  return Promise.resolve([...localDB.people]);
}

function getAllMarriages() {
  return Promise.resolve([...localDB.marriages]);
}

function findPeopleByName(query) {
  if (!query) return Promise.resolve([]);
  const q = String(query).trim().toLowerCase();
  const results = localDB.people.filter(p => (p.name || '').toLowerCase().includes(q));
  return Promise.resolve(results);
}

function getPeopleByTreeId(treeId) {
  if (!treeId) return Promise.resolve([]);
  const results = localDB.people.filter(p => p.treeId === treeId);
  return Promise.resolve(results);
}


// --- file(audio/image) uploads (local) ---

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    if (!file) return resolve(null);
    try {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(file);
    } catch (err) {
      reject(err);
    }
  });
}


async function uploadFileLocal(file, type) {
  console.log(`DBG:dataService.uploadFileLocal -> ${type}`, file && file.name);
  const id = generateId("file");
  const name = (file && file.name) ? file.name : `${type}_${id}`;

  let dataUrl = null;
  if (typeof file === "string") {
    dataUrl = file; // already base64
  } else {
    try {
      dataUrl = await readFileAsDataURL(file);
    } catch (err) {
      console.error(`DBG:dataService.uploadFileLocal -> read error`, err);
      dataUrl = null;
    }
  }

  const url = dataUrl || `/${type}s/${id}_${name}`;
  localDB.files = localDB.files || [];

  const shouldStoreData = !(typeof url === "string" && url.startsWith("data:"));
  localDB.files.push({
    id,
    name,
    url,
    type,
    // data: shouldStoreData ? dataUrl : null,
    createdAt: new Date().toISOString(),
  });
  saveLocalDB();

  return { id, url, type };
}

function clearLocalDB() {
  localDB = { people: [...dummyPeople], marriages: [...dummyMarriages], stories: [] };
  saveLocalDB();
  console.log("DBG:dataService.clearLocalDB -> reset to dummy data");
}

async function addPersonFirebase() {
  throw new Error("Firebase addPerson not implemented yet");
}
async function addMarriageFirebase() {
  throw new Error("Firebase addMarriage not implemented yet");
}
async function addChildToMarriageFirebase() {
  throw new Error("Firebase addChildToMarriage not implemented yet");
}
async function getPersonFirebase() {
  throw new Error("Firebase getPerson not implemented yet");
}
async function getMarriageFirebase() {
  throw new Error("Firebase getMarriage not implemented yet");
}

async function getMarriagesByPersonIdFirebase() {
  throw new Error("Not implemented");
}

async function getMarriagesByChildIdFirebase() {
  throw new Error("Not implemented");
}

async function updateMarriageFirebase() {
  throw new Error("Not implemented");
}

async function updatePersonFirebase() {
  throw new Error("Not implemented");
}
async function deletePersonFirebase() {
  throw new Error("Not implemented");
}
async function deleteMarriageFirebase() {
  throw new Error("Not implemented");
}
async function getAllPeopleFirebase() {
  throw new Error("Not implemented");
}
async function getAllMarriagesFirebase() {
  throw new Error("Not implemented");
}
async function findPeopleByNameFirebase() {
  throw new Error("Not implemented");
}
async function getPeopleByTreeIdFirebase() {
  throw new Error("Not implemented");
}

async function addStoryFirebase() { throw new Error("Not implemented"); }
async function getStoryFirebase() { throw new Error("Not implemented"); }
async function getStoriesByPersonIdFirebase() { throw new Error("Not implemented"); }
async function updateStoryFirebase() { throw new Error("Not implemented"); }
async function deleteStoryFirebase() { throw new Error("Not implemented"); }
async function getAllStoriesFirebase() { throw new Error("Not implemented"); }
async function findStoriesByTitleFirebase() { throw new Error("Not implemented"); }

async function addEventFirebase() { throw new Error("Not implemented"); }
async function getEventFirebase() { throw new Error("Not implemented"); }
async function getEventsByPersonIdFirebase() { throw new Error("Not implemented"); }
async function updateEventFirebase() { throw new Error("Not implemented"); }
async function deleteEventFirebase() { throw new Error("Not implemented"); }
async function getAllEventsFirebase() { throw new Error("Not implemented"); }
async function findEventsByTitleFirebase() { throw new Error("Not implemented"); }
async function uploadFileFirebase(file, type) {throw new Error(`Cloud upload for ${type} not implemented yet`);}



// --- Export API ---
const dataService = {
  addPerson: USE_LOCAL ? addPerson : addPersonFirebase,
  addMarriage: USE_LOCAL ? addMarriage : addMarriageFirebase,
  addChildToMarriage: USE_LOCAL ? addChildToMarriage : addChildToMarriageFirebase,
  getPerson: USE_LOCAL ? getPerson : getPersonFirebase,
  getMarriage: USE_LOCAL ? getMarriage : getMarriageFirebase,
  getMarriagesByPersonId: USE_LOCAL ? getMarriagesByPersonId : getMarriagesByPersonIdFirebase,
  updateMarriage: USE_LOCAL ? updateMarriage : updateMarriageFirebase,
  updatePerson: USE_LOCAL ? updatePerson : updatePersonFirebase,
  deletePerson: USE_LOCAL ? deletePerson : deletePersonFirebase,
  deleteMarriage: USE_LOCAL ? deleteMarriage : deleteMarriageFirebase,
  getAllPeople: USE_LOCAL ? getAllPeople : getAllPeopleFirebase,
  getAllMarriages: USE_LOCAL ? getAllMarriages : getAllMarriagesFirebase,
  findPeopleByName: USE_LOCAL ? findPeopleByName : findPeopleByNameFirebase,
  getPeopleByTreeId: USE_LOCAL ? getPeopleByTreeId : getPeopleByTreeIdFirebase,
  // Stories API
  addStory: USE_LOCAL ? addStory : addStoryFirebase,
  getStory: USE_LOCAL ? getStory : getStoryFirebase,
  getStoriesByPersonId: USE_LOCAL ? getStoriesByPersonId : getStoriesByPersonIdFirebase,
  updateStory: USE_LOCAL ? updateStory : updateStoryFirebase,
  deleteStory: USE_LOCAL ? deleteStory : deleteStoryFirebase,
  getAllStories: USE_LOCAL ? getAllStories : getAllStoriesFirebase,
  findStoriesByTitle: USE_LOCAL ? findStoriesByTitle : findStoriesByTitleFirebase,
  // Events API
  addEvent: USE_LOCAL ? addEvent : addEventFirebase,
  getEvent: USE_LOCAL ? getEvent : getEventFirebase,
  getEventsByPersonId: USE_LOCAL ? getEventsByPersonId : getEventsByPersonIdFirebase,
  updateEvent: USE_LOCAL ? updateEvent : updateEventFirebase,
  deleteEvent: USE_LOCAL ? deleteEvent : deleteEventFirebase,
  getAllEvents: USE_LOCAL ? getAllEvents : getAllEventsFirebase,
  findEventsByTitle: USE_LOCAL ? findEventsByTitle : findEventsByTitleFirebase,
  uploadFile: USE_LOCAL ? uploadFileLocal : uploadFileFirebase,
  getMarriagesByChildId: USE_LOCAL ? getMarriagesByChildId : getMarriagesByChildIdFirebase,
  clearLocalDB, // helpful for dev reset
};

export default dataService;
