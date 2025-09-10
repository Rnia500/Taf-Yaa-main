// src/services/data/personServiceLocal.js

import { getDB, saveDB } from "./localDB"; 
import { generateId } from "../../utils/personUtils/idGenerator";

function addPerson(person) {
  const db = getDB();
  const exists = db.people.find(p => p.id === person.id);
  if (exists) {
    console.warn("personServiceLocal.addPerson -> duplicate person id detected:", person.id);
    person = { ...person, id: generateId("person") };
  }
  db.people.push(person);
  saveDB();
  return Promise.resolve(person);
}

function getPerson(id) {
  const db = getDB();
  const p = db.people.find((p) => p.id === id);
  return Promise.resolve(p);
}

function updatePerson(personId, updatedPersonData) {
  const db = getDB();
  const idx = db.people.findIndex(p => p.id === personId);
  if (idx === -1) {
    return Promise.reject(new Error("Person not found"));
  }
  db.people[idx] = { ...db.people[idx], ...updatedPersonData, updatedAt: new Date().toISOString() };
  saveDB();
  return Promise.resolve(db.people[idx]);
}

/**
 * Deletes a person and cleans up their relationships in other data models.
 * This is a perfect 1:1 copy of the logic from your original dataService.
 */
function deletePerson(personId) {
    const db = getDB();
    const personIdx = db.people.findIndex(p => p.id === personId);
    if (personIdx === -1) {
        return Promise.reject(new Error("Person not found"));
    }

    // --- Relationship Cleanup Logic (from original dataService) ---
    const marriagesToRemove = [];
    // Iterate backwards to safely remove items from the array while looping.
    for (let i = db.marriages.length - 1; i >= 0; i--) {
        const m = db.marriages[i];
        if (!m) continue;
        
        // If monogamous, remove the entire marriage if the person is one of the spouses.
        if (m.marriageType === 'monogamous') {
            if (Array.isArray(m.spouses) && m.spouses.includes(personId)) {
                marriagesToRemove.push(m.id);
                db.marriages.splice(i, 1);
            }
        } 
        // If polygamous, the logic is more complex.
        else if (m.marriageType === 'polygamous') {
            // If the person is the husband, remove the entire marriage.
            if (m.husbandId === personId) {
                marriagesToRemove.push(m.id);
                db.marriages.splice(i, 1);
                continue; // Move to the next marriage
            }
            // If the person is one of the wives, remove only that wife from the marriage.
            if (Array.isArray(m.wives)) {
                const wifeIdx = m.wives.findIndex(w => w.wifeId === personId);
                if (wifeIdx !== -1) {
                    m.wives.splice(wifeIdx, 1);
                }
            }
        }
    }
    // --- End of Cleanup Logic ---

    // Finally, remove the person themselves.
    const removedPerson = db.people.splice(personIdx, 1)[0];
    
    saveDB(); // Save all the changes (person removed, marriages cleaned up).

    console.log(`DBG:personServiceLocal.deletePerson -> removed person: ${removedPerson?.id}, removed marriages: ${marriagesToRemove.join(', ')}`);
    return Promise.resolve({ person: removedPerson, removedMarriageIds: marriagesToRemove });
}

function getAllPeople() {
  const db = getDB();
  return Promise.resolve([...db.people]);
}

function findPeopleByName(query) {
  const db = getDB();
  if (!query) return Promise.resolve([]);
  const q = String(query).trim().toLowerCase();
  const results = db.people.filter(p => (p.name || '').toLowerCase().includes(q));
  return Promise.resolve(results);
}

function getPeopleByTreeId(treeId) {
  const db = getDB();
  if (!treeId) return Promise.resolve([]);
  const results = db.people.filter(p => p.treeId === treeId);
  return Promise.resolve(results);
}


// Export all the functions in a single service object.
export const personServiceLocal = {
  addPerson,
  getPerson,
  updatePerson,
  deletePerson,
  getAllPeople,
  findPeopleByName,
  getPeopleByTreeId,
};