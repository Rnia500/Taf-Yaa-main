// src/services/data/personServiceLocal.js

import { getDB, saveDB } from "./localDB"; 
import { generateId } from "../../utils/personUtils/idGenerator";
import { eventServiceLocal } from "./eventServiceLocal";
import { storyServiceLocal } from "./storyServiceLocal";

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
 * Delete a person with two supported modes:
 * - mode: "soft" => replace person with placeholder (reversible)
 * - mode: "cascade" => conditionally delete marriages + descendants (reversible)
 *
 * Direct line spouse (monogamous or polygamous):
 *   -> entire marriage + descendants marked deleted.
 * Non-direct line child:
 *   -> person + descendants marked deleted, marriage kept intact.
 *
 * Options:
 * - undoWindowDays: number of days to allow undo (default 30)
 */
function deletePerson(personId, mode = "soft", options = {}) {
  const db = getDB();
  const person = db.people.find(p => p.id === personId);
  if (!person) {
    return Promise.reject(new Error("Person not found"));
  }

  const now = new Date();
  const undoWindowDays = Number.isFinite(options.undoWindowDays) ? options.undoWindowDays : 30;
  const undoExpiresAt = new Date(now.getTime() + undoWindowDays * 24 * 60 * 60 * 1000).toISOString();
  const batchId = generateId("deletion");

  if (mode === "soft") {
    console.log(`DBG:personServiceLocal.deletePerson[soft] -> Starting soft delete for person ${personId}`);
    console.log(`DBG:personServiceLocal.deletePerson[soft] -> Person before soft delete:`, {
      id: person.id,
      name: person.name,
      isPlaceholder: person.isPlaceholder,
      isDeleted: person.isDeleted,
      deletionMode: person.deletionMode,
      pendingDeletion: person.pendingDeletion,
      treeId: person.treeId
    });
    
    // Convert to placeholder, keep relationships
    person.isPlaceholder = true;
    person.name = person.name || "Unknown";
    person.deletedAt = now.toISOString();
    person.deletionMode = "soft";
    person.pendingDeletion = true;
    person.undoExpiresAt = undoExpiresAt;
    person.deletionBatchId = batchId;
    
    // Debug: Log the person state after soft delete
    console.log(`DBG:personServiceLocal.deletePerson[soft] -> Person ${personId} after soft delete:`, {
      id: person.id,
      name: person.name,
      isPlaceholder: person.isPlaceholder,
      isDeleted: person.isDeleted,
      deletionMode: person.deletionMode,
      pendingDeletion: person.pendingDeletion,
      treeId: person.treeId
    });
    
    // Mark related events and stories as deleted (but keep them in DB for undo)
    Promise.all([
      eventServiceLocal.markEventsForPersonDeleted(personId, batchId, undoExpiresAt),
      storyServiceLocal.markStoriesForPersonDeleted(personId, batchId, undoExpiresAt)
    ]).then(() => {
      console.log(`DBG:personServiceLocal.deletePerson[soft] -> marked related events and stories`);
    });
    
    saveDB();
    console.log(`DBG:personServiceLocal.deletePerson[soft] -> ${personId} now placeholder, batch=${batchId}`);
    return Promise.resolve({ person, removedMarriageIds: [], batchId, undoExpiresAt });
  }

  if (mode === "cascade") {
    const toDelete = new Set();
    const marriagesToDelete = new Set();

    // Recursive helper
    const collectDescendants = (id) => {
      if (toDelete.has(id)) return;
      toDelete.add(id);

      for (const m of db.marriages) {
        if (!m) continue;

        // --- Case 1: Person is a spouse (direct line) ---
        if (
          (m.marriageType === "monogamous" && Array.isArray(m.spouses) && m.spouses.includes(id)) ||
          (m.marriageType === "polygamous" && (m.husbandId === id || (Array.isArray(m.wives) && m.wives.some(w => w.wifeId === id))))
        ) {
          marriagesToDelete.add(m.id);

          // Cascade to all children of this marriage
          if (Array.isArray(m.childrenIds)) {
            m.childrenIds.forEach(childId => collectDescendants(childId));
          }
          if (Array.isArray(m.wives)) {
            m.wives.forEach(w => (w.childrenIds || []).forEach(childId => collectDescendants(childId)));
          }
        }

        // --- Case 2: Person is a child (non-direct line) ---
        if (Array.isArray(m.childrenIds) && m.childrenIds.includes(id)) {
          // Cascade delete this child + their descendants
          (m.childrenIds || []).forEach(childId => {
            if (childId === id) collectDescendants(id);
          });
        }
        if (Array.isArray(m.wives)) {
          for (const w of m.wives) {
            if (Array.isArray(w.childrenIds) && w.childrenIds.includes(id)) {
              collectDescendants(id);
            }
          }
        }
      }
    };

    collectDescendants(personId);

    // Mark people
    const nowIso = now.toISOString();
    for (const p of db.people) {
      if (toDelete.has(p.id)) {
        p.isDeleted = true;
        p.deletedAt = nowIso;
        p.deletionMode = "cascade";
        p.pendingDeletion = true;
        p.undoExpiresAt = undoExpiresAt;
        p.deletionBatchId = batchId;
      }
    }

    // Mark marriages
    for (const m of db.marriages) {
      if (marriagesToDelete.has(m.id)) {
        m.isDeleted = true;
        m.deletedAt = nowIso;
        m.deletionMode = "cascade";
        m.pendingDeletion = true;
        m.undoExpiresAt = undoExpiresAt;
        m.deletionBatchId = batchId;
      }
    }

    // Mark related events and stories for all deleted people
    Promise.all([
      ...Array.from(toDelete).map(id => eventServiceLocal.markEventsForPersonDeleted(id, batchId, undoExpiresAt)),
      ...Array.from(toDelete).map(id => storyServiceLocal.markStoriesForPersonDeleted(id, batchId, undoExpiresAt))
    ]).then(() => {
      console.log(`DBG:personServiceLocal.deletePerson[cascade] -> marked related events and stories`);
    });

    saveDB();
    console.log(`DBG:personServiceLocal.deletePerson[cascade] -> batch=${batchId}, marked ${toDelete.size} people and ${marriagesToDelete.size} marriages as deleted, undo until ${undoExpiresAt}`);
    return Promise.resolve({ batchId, deletedIds: Array.from(toDelete), deletedMarriageIds: Array.from(marriagesToDelete), undoExpiresAt });
  }

  return Promise.reject(new Error(`Unsupported delete mode: ${mode}`));
}

/**
 * Compute the set of people and marriages that would be affected by a cascade delete, without modifying data.
 */
function previewCascadeDelete(personId) {
  const db = getDB();
  const person = db.people.find(p => p.id === personId);
  if (!person) return Promise.resolve({ peopleIds: [], marriageIds: [] });

  const toDelete = new Set();
  const marriagesToDelete = new Set();

  const collectDescendants = (id) => {
    if (toDelete.has(id)) return;
    toDelete.add(id);

    for (const m of db.marriages) {
      if (!m) continue;

      if (
        (m.marriageType === "monogamous" && Array.isArray(m.spouses) && m.spouses.includes(id)) ||
        (m.marriageType === "polygamous" && (m.husbandId === id || (Array.isArray(m.wives) && m.wives.some(w => w.wifeId === id))))
      ) {
        marriagesToDelete.add(m.id);
        if (Array.isArray(m.childrenIds)) m.childrenIds.forEach(collectDescendants);
        if (Array.isArray(m.wives)) m.wives.forEach(w => (w.childrenIds || []).forEach(collectDescendants));
      }

      if (Array.isArray(m.childrenIds) && m.childrenIds.includes(id)) collectDescendants(id);
      if (Array.isArray(m.wives)) {
        for (const w of m.wives) {
          if (Array.isArray(w.childrenIds) && w.childrenIds.includes(id)) collectDescendants(id);
        }
      }
    }
  };

  collectDescendants(personId);
  return Promise.resolve({ peopleIds: Array.from(toDelete), marriageIds: Array.from(marriagesToDelete) });
}

/**
 * Undo a previous deletion operation (soft or cascade) using personId as entry point.
 * For cascade, all entities in the same deletion batch will be restored.
 */
function undoDelete(personId) {
  const db = getDB();
  const person = db.people.find(p => p.id === personId);
  if (!person) return Promise.reject(new Error("Person not found"));

  // Determine batch scope
  const batchId = person.deletionBatchId || null;
  const mode = person.deletionMode || null;

  if (!mode) {
    return Promise.reject(new Error("This person is not marked for deletion"));
  }

  const now = new Date();
  const expired = person.undoExpiresAt && new Date(person.undoExpiresAt) < now;
  if (expired) {
    return Promise.reject(new Error("Undo window has expired for this deletion"));
  }

  if (mode === "soft") {
    // Restore this single person
    delete person.isPlaceholder;
    delete person.deletedAt;
    delete person.deletionMode;
    delete person.pendingDeletion;
    delete person.undoExpiresAt;
    delete person.deletionBatchId;
    saveDB();
    console.log(`DBG:personServiceLocal.undoDelete[soft] -> restored ${personId}`);
    return Promise.resolve({ restoredIds: [personId], restoredMarriageIds: [] });
  }

  if (mode === "cascade") {
    if (!batchId) return Promise.reject(new Error("Missing deletion batch id for cascade undo"));

    const restoredIds = [];
    const restoredMarriageIds = [];

    for (const p of db.people) {
      if (p.deletionBatchId === batchId && p.deletionMode === "cascade" && p.pendingDeletion) {
        delete p.isDeleted;
        delete p.deletedAt;
        delete p.deletionMode;
        delete p.pendingDeletion;
        delete p.undoExpiresAt;
        delete p.deletionBatchId;
        restoredIds.push(p.id);
      }
    }

    for (const m of db.marriages) {
      if (m.deletionBatchId === batchId && m.deletionMode === "cascade" && m.pendingDeletion) {
        delete m.isDeleted;
        delete m.deletedAt;
        delete m.deletionMode;
        delete m.pendingDeletion;
        delete m.undoExpiresAt;
        delete m.deletionBatchId;
        restoredMarriageIds.push(m.id);
      }
    }

    // Restore related events and stories
    Promise.all([
      eventServiceLocal.undoEventsDeletion(batchId),
      storyServiceLocal.undoStoriesDeletion(batchId)
    ]).then(() => {
      console.log(`DBG:personServiceLocal.undoDelete[cascade] -> restored related events and stories`);
    });

    saveDB();
    console.log(`DBG:personServiceLocal.undoDelete[cascade] -> restored ${restoredIds.length} people and ${restoredMarriageIds.length} marriages (batch=${batchId})`);
    return Promise.resolve({ restoredIds, restoredMarriageIds });
  }

  return Promise.reject(new Error("Unsupported deletion mode to undo"));
}

/**
 * Permanently remove expired deletions. For soft deletes, convert to normal placeholder.
 * For cascade deletes, remove people and marriages marked with expired undo window, and cleanup references.
 */
function purgeExpiredDeletions() {
  const db = getDB();
  const now = new Date();

  // Identify expired entities
  const expiredSoft = [];
  const expiredCascadePeople = [];
  const expiredCascadeMarriages = [];

  for (const p of db.people) {
    if (!p || !p.pendingDeletion || !p.undoExpiresAt) continue;
    const isExpired = new Date(p.undoExpiresAt) < now;
    if (!isExpired) continue;
    if (p.deletionMode === "soft") expiredSoft.push(p);
    else if (p.deletionMode === "cascade") expiredCascadePeople.push(p);
  }
  for (const m of db.marriages) {
    if (!m || !m.pendingDeletion || !m.undoExpiresAt) continue;
    const isExpired = new Date(m.undoExpiresAt) < now;
    if (!isExpired) continue;
    if (m.deletionMode === "cascade") expiredCascadeMarriages.push(m);
  }

  // Soft: convert to normal placeholder
  for (const p of expiredSoft) {
    // Clear all soft delete metadata
    delete p.pendingDeletion;
    delete p.undoExpiresAt;
    delete p.deletionBatchId;
    delete p.deletedAt;
    delete p.deletionMode;
    
    // Convert to normal placeholder
    p.isPlaceholder = true;
    p.name = "Unknown Person"; // Generic name for expired soft deleted persons
    
    console.log(`DBG:purge -> converted soft deleted person ${p.id} to normal placeholder`);
  }

  // Cascade: build sets by batch to ensure consistent cleanup
  const cascadePeopleIdsToRemove = new Set(expiredCascadePeople.map(p => p.id));
  const cascadeMarriageIdsToRemove = new Set(expiredCascadeMarriages.map(m => m.id));

  // Remove references in marriages that are NOT being removed
  for (const m of db.marriages) {
    if (!m) continue;
    if (cascadeMarriageIdsToRemove.has(m.id)) continue; // will be removed entirely

    if (Array.isArray(m.childrenIds)) {
      m.childrenIds = m.childrenIds.filter(cid => !cascadePeopleIdsToRemove.has(cid));
    }
    if (Array.isArray(m.wives)) {
      m.wives.forEach(w => {
        if (Array.isArray(w.childrenIds)) {
          w.childrenIds = w.childrenIds.filter(cid => !cascadePeopleIdsToRemove.has(cid));
        }
      });
      // Also drop wives entries that themselves are removed
      m.wives = m.wives.filter(w => !cascadePeopleIdsToRemove.has(w.wifeId));
    }

    // For monogamous marriages, if a spouse is removed but the marriage isn't flagged for removal, keep as-is.
    if (m.marriageType === "monogamous" && Array.isArray(m.spouses)) {
      m.spouses = m.spouses.filter(spId => !cascadePeopleIdsToRemove.has(spId));
    }
  }

  // Physically remove people
  if (cascadePeopleIdsToRemove.size > 0) {
    db.people = db.people.filter(p => !cascadePeopleIdsToRemove.has(p.id));
  }

  // Physically remove marriages
  if (cascadeMarriageIdsToRemove.size > 0) {
    db.marriages = db.marriages.filter(m => !cascadeMarriageIdsToRemove.has(m.id));
  }

  // Purge expired events and stories
  Promise.all([
    eventServiceLocal.purgeExpiredDeletedEvents(),
    storyServiceLocal.purgeExpiredDeletedStories()
  ]).then(() => {
    console.log(`DBG:purgeExpiredDeletions -> purged related events and stories`);
  });

  saveDB();

  return Promise.resolve({
    finalizedSoftCount: expiredSoft.length,
    removedPeopleCount: cascadePeopleIdsToRemove.size,
    removedMarriageCount: cascadeMarriageIdsToRemove.size,
  });
}

function getAllPeople() {
  const db = getDB();
  // Filter out deleted people
  const people = (db.people || []).filter(p => !p.isDeleted);
  return Promise.resolve(people);
}

function findPeopleByName(query) {
  const db = getDB();
  if (!query) return Promise.resolve([]);
  const q = String(query).trim().toLowerCase();
  // Filter out deleted people
  const results = (db.people || []).filter(p => 
    !p.isDeleted && 
    (p.name || '').toLowerCase().includes(q)
  );
  return Promise.resolve(results);
}

function getPeopleByTreeId(treeId) {
  const db = getDB();
  if (!treeId) return Promise.resolve([]);
  
  // First, check and purge any expired soft deletions
  purgeExpiredSoftDeletions();
  
  // Filter out cascade-deleted people, but include soft-deleted placeholders
  const results = (db.people || []).filter(p => 
    !p.isDeleted &&  // Exclude cascade-deleted people
    p.treeId === treeId
    // Include soft-deleted people (they become placeholders)
  );
  
  // Debug: Log what people are being returned
  console.log(`DBG:personServiceLocal.getPeopleByTreeId -> Tree ${treeId} people:`, results.map(p => ({
    id: p.id,
    name: p.name,
    isPlaceholder: p.isPlaceholder,
    isDeleted: p.isDeleted,
    deletionMode: p.deletionMode,
    pendingDeletion: p.pendingDeletion
  })));
  
  return Promise.resolve(results);
}

/**
 * Check and purge expired soft deletions, converting them to normal placeholders
 */
function purgeExpiredSoftDeletions() {
  const db = getDB();
  const now = new Date();
  let purgedCount = 0;

  for (const p of db.people) {
    if (!p || !p.pendingDeletion || !p.undoExpiresAt || p.deletionMode !== "soft") continue;
    
    const isExpired = new Date(p.undoExpiresAt) < now;
    if (!isExpired) continue;

    // Clear all soft delete metadata
    delete p.pendingDeletion;
    delete p.undoExpiresAt;
    delete p.deletionBatchId;
    delete p.deletedAt;
    delete p.deletionMode;
    
    // Convert to normal placeholder
    p.isPlaceholder = true;
    p.name = "Unknown Person"; // Generic name for expired soft deleted persons
    
    purgedCount++;
    console.log(`DBG:purgeExpiredSoftDeletions -> converted soft deleted person ${p.id} to normal placeholder`);
  }

  if (purgedCount > 0) {
    saveDB();
    console.log(`DBG:purgeExpiredSoftDeletions -> converted ${purgedCount} expired soft deletions to placeholders`);
  }

  return purgedCount;
}

// Export all the functions in a single service object.
export const personServiceLocal = {
  addPerson,
  getPerson,
  updatePerson,
  deletePerson,
  previewCascadeDelete,
  undoDelete,
  purgeExpiredDeletions,
  purgeExpiredSoftDeletions,
  getAllPeople,
  findPeopleByName,
  getPeopleByTreeId,
};
