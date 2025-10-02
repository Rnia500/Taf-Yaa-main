// src/services/data/personServiceFirebase.js

import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  writeBatch,
  arrayUnion,
  arrayRemove,
  increment,
  deleteField
} from 'firebase/firestore';
import { db } from '../../config/firebase.js';
import { generateId } from '../../utils/personUtils/idGenerator.js';
import { marriageServiceFirebase } from './marriageServiceFirebase.js';
import { eventServiceFirebase } from './eventServiceFirebase.js';
import { storyServiceFirebase } from './storyServiceFirebase.js';

// Helper function to get current timestamp
const getCurrentTimestamp = () => serverTimestamp();

// Helper function to generate deletion batch ID
const generateDeletionBatchId = () => generateId("deletion");

async function addPerson(person) {
  try {
    // Check if person with same ID already exists
    const existingPerson = await getPerson(person.id);
    if (existingPerson) {
      console.warn("personServiceFirebase.addPerson -> duplicate person id detected:", person.id);
      person = { ...person, id: generateId("person") };
    }

    const personRef = doc(db, 'people', person.id);
    const personData = {
      ...person,
      active: true, // Add active field for better querying
      createdAt: getCurrentTimestamp(),
      updatedAt: getCurrentTimestamp()
    };

    await setDoc(personRef, personData);
    return person;
  } catch (error) {
    throw new Error(`Failed to add person: ${error.message}`);
  }
}

async function getPerson(id) {
  try {
    const personRef = doc(db, 'people', id);
    const personSnap = await getDoc(personRef);
    
    if (personSnap.exists()) {
      return { id: personSnap.id, ...personSnap.data() };
    } else {
      return null;
    }
  } catch (error) {
    throw new Error(`Failed to get person: ${error.message}`);
  }
}

async function updatePerson(personId, updatedPersonData) {
  try {
    const personRef = doc(db, 'people', personId);
    const updateData = {
      ...updatedPersonData,
      updatedAt: getCurrentTimestamp()
    };

    await updateDoc(personRef, updateData);
    
    // Return updated person
    return await getPerson(personId);
  } catch (error) {
    throw new Error(`Failed to update person: ${error.message}`);
  }
}

async function deletePerson(personId, mode = "soft", options = {}) {
  try {
    const person = await getPerson(personId);
    if (!person) {
      throw new Error("Person not found");
    }

    const now = new Date();
    const undoWindowDays = Number.isFinite(options.undoWindowDays) ? options.undoWindowDays : 30;
    const undoExpiresAt = new Date(now.getTime() + undoWindowDays * 24 * 60 * 60 * 1000).toISOString();
    const batchId = generateDeletionBatchId();

    if (mode === "soft") {
      // Convert to placeholder, keep relationships
      const updateData = {
        isPlaceholder: true,
        name: person.name || "Unknown",
        deletedAt: now.toISOString(),
        deletionMode: "soft",
        pendingDeletion: true,
        undoExpiresAt: undoExpiresAt,
        deletionBatchId: batchId,
        active: false, // Mark as inactive for querying
        updatedAt: getCurrentTimestamp()
      };

      await updatePerson(personId, updateData);
      // Mark related events and stories as deleted (implement when event/story services are ready)
      console.log(`DBG:personServiceFirebase.deletePerson[soft] -> marked related events and stories`);

      console.log(`DBG:personServiceFirebase.deletePerson[soft] -> ${personId} now placeholder, batch=${batchId}`);
      return { person: { ...person, ...updateData }, removedMarriageIds: [], batchId, undoExpiresAt };
    }

    if (mode === "cascade") {
      // Helper function to collect descendants and handle direct line spouse deletion
      const toDelete = new Set();
      const marriagesToDelete = new Set();

      // Helper function to collect descendants and handle direct line spouse deletion
      const collectDescendants = async (id) => {
        if (toDelete.has(id)) return;
        toDelete.add(id);

        // Get marriages where this person is a spouse
        const marriages = await marriageServiceFirebase.getMarriagesByPersonId(id);

        for (const marriage of marriages) {
          if (marriage.marriageType === "monogamous") {
            // Check if person is direct line spouse
            if (marriage.spouses.includes(id)) {
              // Direct line spouse deletion: delete entire marriage and descendants
              marriagesToDelete.add(marriage.id);
              marriage.spouses.forEach(spouseId => toDelete.add(spouseId));
              if (Array.isArray(marriage.childrenIds)) {
                for (const childId of marriage.childrenIds) {
                  await collectDescendants(childId);
                }
              }
            }
          } else if (marriage.marriageType === "polygamous") {
            if (marriage.husbandId === id) {
              // Direct line spouse deletion: delete entire marriage and descendants
              marriagesToDelete.add(marriage.id);
              toDelete.add(marriage.husbandId);
              if (Array.isArray(marriage.wives)) {
                marriage.wives.forEach(w => {
                  toDelete.add(w.wifeId);
                  if (Array.isArray(w.childrenIds)) {
                    w.childrenIds.forEach(childId => collectDescendants(childId));
                  }
                });
              }
            } else {
              // Check if person is a wife
              const wifeData = marriage.wives.find(w => w.wifeId === id);
              if (wifeData) {
                // Wife deletion: delete wife and descendants, but keep marriage
                toDelete.add(wifeData.wifeId);
                if (Array.isArray(wifeData.childrenIds)) {
                  for (const childId of wifeData.childrenIds) {
                    await collectDescendants(childId);
                  }
                }
              }
            }
          }
        }

        // Get marriages where this person is a child
        const childMarriages = await marriageServiceFirebase.getMarriagesByChildId(id);
        for (const marriage of childMarriages) {
          await collectDescendants(id);
        }
      };

      // Start cascade from the root person
      await collectDescendants(personId);

      // Mark all people as deleted
      const nowIso = now.toISOString();
      for (const personIdToDelete of toDelete) {
        const updateData = {
          isDeleted: true,
          deletedAt: nowIso,
          deletionMode: "cascade",
          pendingDeletion: true,
          undoExpiresAt: undoExpiresAt,
          deletionBatchId: batchId,
          active: false,
          updatedAt: getCurrentTimestamp()
        };

        // Mark the initiating person as cascade root
        if (personIdToDelete === personId) {
          updateData.isCascadeRoot = true;
        }

        await updatePerson(personIdToDelete, updateData);
      }

      // Mark all marriages as deleted
      for (const marriageId of marriagesToDelete) {
        const marriageUpdateData = {
          isDeleted: true,
          deletedAt: nowIso,
          deletionMode: "cascade",
          pendingDeletion: true,
          undoExpiresAt: undoExpiresAt,
          deletionBatchId: batchId,
          active: false,
          updatedAt: getCurrentTimestamp()
        };

        await marriageServiceFirebase.updateMarriage(marriageId, marriageUpdateData);
      }

      // Mark related events and stories for all deleted people
      for (const personIdToDelete of toDelete) {
        await Promise.all([
          eventServiceFirebase.markEventsForPersonDeleted(personIdToDelete, batchId, undoExpiresAt),
          storyServiceFirebase.markStoriesForPersonDeleted(personIdToDelete, batchId, undoExpiresAt)
        ]);
      }

      console.log(`DBG:personServiceFirebase.deletePerson[cascade] -> batch=${batchId}, marked ${toDelete.size} people and ${marriagesToDelete.size} marriages as deleted, undo until ${undoExpiresAt}`);
      return { batchId, deletedIds: Array.from(toDelete), deletedMarriageIds: Array.from(marriagesToDelete), undoExpiresAt };
    }

    throw new Error(`Unsupported delete mode: ${mode}`);
  } catch (error) {
    throw new Error(`Failed to delete person: ${error.message}`);
  }
}

async function previewCascadeDelete(personId) {
  try {
    const person = await getPerson(personId);
    if (!person) {
      return { peopleIds: [], marriageIds: [] };
    }

    const toDelete = new Set();
    const marriagesToDelete = new Set();

    // Helper function to collect descendants (same logic as deletePerson)
    const collectDescendants = async (id) => {
      if (toDelete.has(id)) return;
      toDelete.add(id);

      // Get marriages where this person is a spouse
      const marriages = await marriageServiceFirebase.getMarriagesByPersonId(id);
      
      for (const marriage of marriages) {
        if (marriage.marriageType === "monogamous") {
          // Add all spouses to deletion set
          if (Array.isArray(marriage.spouses)) {
            marriage.spouses.forEach(spouseId => toDelete.add(spouseId));
          }
          // Add all children to deletion set
          if (Array.isArray(marriage.childrenIds)) {
            for (const childId of marriage.childrenIds) {
              await collectDescendants(childId);
            }
          }
          marriagesToDelete.add(marriage.id);
        } else if (marriage.marriageType === "polygamous") {
          // Add husband to deletion set
          if (marriage.husbandId) {
            toDelete.add(marriage.husbandId);
          }
          // Add all wives to deletion set
          if (Array.isArray(marriage.wives)) {
            marriage.wives.forEach(wife => {
              toDelete.add(wife.wifeId);
              // Add children of each wife
              if (Array.isArray(wife.childrenIds)) {
                wife.childrenIds.forEach(childId => collectDescendants(childId));
              }
            });
          }
          marriagesToDelete.add(marriage.id);
        }
      }

      // Get marriages where this person is a child
      const childMarriages = await marriageServiceFirebase.getMarriagesByChildId(id);
      for (const marriage of childMarriages) {
        await collectDescendants(id);
      }
    };

    // Start cascade from the root person
    await collectDescendants(personId);

    return { peopleIds: Array.from(toDelete), marriageIds: Array.from(marriagesToDelete) };
  } catch (error) {
    throw new Error(`Failed to preview cascade delete: ${error.message}`);
  }
}

async function undoDelete(personId) {
  try {
    const person = await getPerson(personId);
    if (!person) {
      throw new Error("Person not found");
    }

    const batchId = person.deletionBatchId || null;
    const mode = person.deletionMode || null;

    if (!mode) {
      throw new Error("This person is not marked for deletion");
    }

    const now = new Date();
    const expired = person.undoExpiresAt && new Date(person.undoExpiresAt) < now;
    if (expired) {
      throw new Error("Undo window has expired for this deletion");
    }

    if (mode === "soft") {
      // Restore this single person using FieldValue.delete() to properly remove fields
      const updateData = {
        isPlaceholder: deleteField(),
        deletedAt: deleteField(),
        deletionMode: deleteField(),
        pendingDeletion: deleteField(),
        undoExpiresAt: deleteField(),
        deletionBatchId: deleteField(),
        active: true, // Restore active status
        updatedAt: getCurrentTimestamp()
      };

      await updatePerson(personId, updateData);
      console.log(`DBG:personServiceFirebase.undoDelete[soft] -> restored ${personId}`);
      return { restoredIds: [personId], restoredMarriageIds: [] };
    }

    if (mode === "cascade") {
      if (!batchId) {
        throw new Error("Missing deletion batch id for cascade undo");
      }

      // Restore all people in the same deletion batch
      const peopleRef = collection(db, 'people');
      const peopleQuery = query(
        peopleRef,
        where('deletionBatchId', '==', batchId),
        where('deletionMode', '==', 'cascade')
      );
      const peopleSnapshot = await getDocs(peopleQuery);
      
      const restoredIds = [];
      for (const doc of peopleSnapshot.docs) {
        const updateData = {
          isDeleted: deleteField(),
          deletedAt: deleteField(),
          deletionMode: deleteField(),
          pendingDeletion: deleteField(),
          undoExpiresAt: deleteField(),
          deletionBatchId: deleteField(),
          isCascadeRoot: deleteField(),
          active: true, // Restore active status
          updatedAt: getCurrentTimestamp()
        };

        await updateDoc(doc.ref, updateData);
        restoredIds.push(doc.id);
      }

      // Restore all marriages in the same deletion batch
      const marriagesRef = collection(db, 'marriages');
      const marriagesQuery = query(
        marriagesRef,
        where('deletionBatchId', '==', batchId),
        where('deletionMode', '==', 'cascade')
      );
      const marriagesSnapshot = await getDocs(marriagesQuery);
      
      const restoredMarriageIds = [];
      for (const doc of marriagesSnapshot.docs) {
        const updateData = {
          isDeleted: deleteField(),
          deletedAt: deleteField(),
          deletionMode: deleteField(),
          pendingDeletion: deleteField(),
          undoExpiresAt: deleteField(),
          deletionBatchId: deleteField(),
          active: true, // Restore active status
          updatedAt: getCurrentTimestamp()
        };

        await updateDoc(doc.ref, updateData);
        restoredMarriageIds.push(doc.id);
      }

      // Restore related events and stories
      await Promise.all([
        eventServiceFirebase.undoEventsDeletion(batchId),
        storyServiceFirebase.undoStoriesDeletion(batchId)
      ]);

      console.log(`DBG:personServiceFirebase.undoDelete[cascade] -> restored ${restoredIds.length} people and ${restoredMarriageIds.length} marriages (batch=${batchId})`);
      return { restoredIds, restoredMarriageIds };
    }

    throw new Error("Unsupported deletion mode to undo");
  } catch (error) {
    throw new Error(`Failed to undo delete: ${error.message}`);
  }
}

async function purgeExpiredDeletions() {
  try {
    const now = new Date();
    const peopleRef = collection(db, 'people');
    
    // Get all people with pending deletions
    const q = query(
      peopleRef,
      where('pendingDeletion', '==', true),
      where('undoExpiresAt', '<=', now.toISOString())
    );
    
    const querySnapshot = await getDocs(q);
    const expiredPeople = [];
    
    querySnapshot.forEach((doc) => {
      expiredPeople.push({ id: doc.id, ...doc.data() });
    });

    let finalizedSoftCount = 0;
    let removedPeopleCount = 0;

    for (const person of expiredPeople) {
      if (person.deletionMode === "soft") {
        // Keep placeholder, clear metadata using FieldValue.delete()
        const updateData = {
          pendingDeletion: deleteField(),
          undoExpiresAt: deleteField(),
          deletionBatchId: deleteField(),
          updatedAt: getCurrentTimestamp()
        };

        await updatePerson(person.id, updateData);
        finalizedSoftCount++;
        console.log(`DBG:purge -> finalized soft delete for ${person.id}`);
      } else if (person.deletionMode === "cascade") {
        // TODO: Check for marriage/event references before permanent deletion
        // Permanently remove
        await deleteDoc(doc(db, 'people', person.id));
        removedPeopleCount++;
        console.log(`DBG:purge -> permanently removed ${person.id}`);
      }
    }

      // Purge expired marriages
      const marriagesRef = collection(db, 'marriages');
      const marriagesQuery = query(
        marriagesRef,
        where('pendingDeletion', '==', true),
        where('undoExpiresAt', '<=', now.toISOString())
      );
      const marriagesSnapshot = await getDocs(marriagesQuery);
      
      let removedMarriageCount = 0;
      for (const doc of marriagesSnapshot.docs) {
        await deleteDoc(doc.ref);
        removedMarriageCount++;
      }

      // Purge expired events and stories
      const [eventPurgeResult, storyPurgeResult] = await Promise.all([
        eventServiceFirebase.purgeExpiredDeletedEvents(),
        storyServiceFirebase.purgeExpiredDeletedStories()
      ]);

      console.log(`DBG:purgeExpiredDeletions -> purged ${eventPurgeResult.removedCount} events and ${storyPurgeResult.removedCount} stories`);

      return {
        finalizedSoftCount,
        removedPeopleCount,
        removedMarriageCount
      };
  } catch (error) {
    throw new Error(`Failed to purge expired deletions: ${error.message}`);
  }
}

async function getAllPeople() {
  try {
    const peopleRef = collection(db, 'people');
    // Use active field instead of != query for better Firestore compatibility
    const q = query(peopleRef, where('active', '==', true));
    const querySnapshot = await getDocs(q);
    
    const people = [];
    querySnapshot.forEach((doc) => {
      people.push({ id: doc.id, ...doc.data() });
    });
    
    return people;
  } catch (error) {
    throw new Error(`Failed to get all people: ${error.message}`);
  }
}

async function findPeopleByName(query) {
  try {
    if (!query) {
      return [];
    }

    const peopleRef = collection(db, 'people');
    const q = query(
      peopleRef,
      where('active', '==', true),
      where('name', '>=', query.trim()),
      where('name', '<=', query.trim() + '\uf8ff')
    );
    
    const querySnapshot = await getDocs(q);
    const results = [];
    
    querySnapshot.forEach((doc) => {
      const person = { id: doc.id, ...doc.data() };
      if (person.name && person.name.toLowerCase().includes(query.toLowerCase())) {
        results.push(person);
      }
    });
    
    return results;
  } catch (error) {
    throw new Error(`Failed to find people by name: ${error.message}`);
  }
}

async function getPeopleByTreeId(treeId) {
  try {
    if (!treeId) {
      return [];
    }

    const peopleRef = collection(db, 'people');
    // Query for active people
    const activeQuery = query(
      peopleRef,
      where('treeId', '==', treeId),
      where('active', '==', true)
    );
    // Query for soft deleted placeholders
    const placeholderQuery = query(
      peopleRef,
      where('treeId', '==', treeId),
      where('isPlaceholder', '==', true),
      where('pendingDeletion', '==', true)
    );
    const [activeSnapshot, placeholderSnapshot] = await Promise.all([
      getDocs(activeQuery),
      getDocs(placeholderQuery)
    ]);
    const results = [];
    activeSnapshot.forEach((doc) => {
      results.push({ id: doc.id, ...doc.data() });
    });
    placeholderSnapshot.forEach((doc) => {
      results.push({ id: doc.id, ...doc.data() });
    });
    return results;
  } catch (error) {
    throw new Error(`Failed to get people by tree ID: ${error.message}`);
  }
}

async function getDeletedPersons() {
  try {
    const peopleRef = collection(db, 'people');
    const q = query(
      peopleRef,
      where('pendingDeletion', '==', true)
    );
    
    const querySnapshot = await getDocs(q);
    const now = new Date();
    const deletedPersons = [];
    
    querySnapshot.forEach((doc) => {
      const person = { id: doc.id, ...doc.data() };
      if (person.isPlaceholder || person.isDeleted) {
        const undoExpiresAt = person.undoExpiresAt ? new Date(person.undoExpiresAt) : null;
        const timeRemaining = undoExpiresAt ? Math.max(0, undoExpiresAt.getTime() - now.getTime()) : 0;
        const isExpired = timeRemaining === 0;
        
        deletedPersons.push({
          ...person,
          timeRemaining,
          isExpired,
          daysRemaining: Math.ceil(timeRemaining / (1000 * 60 * 60 * 24)),
          hoursRemaining: Math.ceil(timeRemaining / (1000 * 60 * 60)),
          minutesRemaining: Math.ceil(timeRemaining / (1000 * 60))
        });
      }
    });
    
    return deletedPersons;
  } catch (error) {
    throw new Error(`Failed to get deleted persons: ${error.message}`);
  }
}

async function getDeletedPersonsByTreeId(treeId) {
  try {
    if (!treeId) {
      return [];
    }

    const peopleRef = collection(db, 'people');
    const q = query(
      peopleRef,
      where('treeId', '==', treeId),
      where('pendingDeletion', '==', true)
    );
    
    const querySnapshot = await getDocs(q);
    const now = new Date();
    const deletedPersons = [];
    
    querySnapshot.forEach((doc) => {
      const person = { id: doc.id, ...doc.data() };
      if (person.isPlaceholder || person.isDeleted) {
        const undoExpiresAt = person.undoExpiresAt ? new Date(person.undoExpiresAt) : null;
        const timeRemaining = undoExpiresAt ? Math.max(0, undoExpiresAt.getTime() - now.getTime()) : 0;
        const isExpired = timeRemaining === 0;
        
        deletedPersons.push({
          ...person,
          timeRemaining,
          isExpired,
          daysRemaining: Math.ceil(timeRemaining / (1000 * 60 * 60 * 24)),
          hoursRemaining: Math.ceil(timeRemaining / (1000 * 60 * 60)),
          minutesRemaining: Math.ceil(timeRemaining / (1000 * 60))
        });
      }
    });
    
    return deletedPersons;
  } catch (error) {
    throw new Error(`Failed to get deleted persons by tree ID: ${error.message}`);
  }
}

async function purgePerson(personId) {
  try {
    const person = await getPerson(personId);
    if (!person) {
      throw new Error("Person not found");
    }

    if (!person.pendingDeletion) {
      throw new Error("Person is not marked for deletion");
    }

    // Clean up references in marriages before permanent deletion
    const marriages = await marriageServiceFirebase.getMarriagesByPersonId(personId);
    for (const marriage of marriages) {
      if (marriage.marriageType === "monogamous") {
        // Remove person from spouses array
        const updatedSpouses = marriage.spouses?.filter(id => id !== personId) || [];
        await marriageServiceFirebase.updateMarriage(marriage.id, { spouses: updatedSpouses });
      } else if (marriage.marriageType === "polygamous") {
        if (marriage.husbandId === personId) {
          // Remove husband
          await marriageServiceFirebase.updateMarriage(marriage.id, { husbandId: null });
        } else {
          // Remove person from wives array
          const updatedWives = marriage.wives?.filter(w => w.wifeId !== personId) || [];
          await marriageServiceFirebase.updateMarriage(marriage.id, { wives: updatedWives });
        }
      }
    }

    // Permanently delete the person
    await deleteDoc(doc(db, 'people', personId));
    
    console.log(`DBG:personServiceFirebase.purgePerson -> permanently removed ${personId}`);
    return { purgedId: personId };
  } catch (error) {
    throw new Error(`Failed to purge person: ${error.message}`);
  }
}

// Additional function used by controllers
async function findPersonByFields(fields) {
  try {
    if (!fields || !fields.treeId) {
      return null;
    }

    const peopleRef = collection(db, 'people');
    let q = query(
      peopleRef,
      where('treeId', '==', fields.treeId),
      where('active', '==', true)
    );

    // Add additional field filters if provided
    if (fields.name) {
      q = query(q, where('name', '==', fields.name));
    }
    if (fields.gender) {
      q = query(q, where('gender', '==', fields.gender));
    }
    if (fields.dob) {
      q = query(q, where('dob', '==', fields.dob));
    }

    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }

    // Return the first match
    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...doc.data() };
  } catch (error) {
    throw new Error(`Failed to find person by fields: ${error.message}`);
  }
}

// Export all the functions in a single service object.
export const personServiceFirebase = {
  addPerson,
  getPerson,
  updatePerson,
  deletePerson,
  previewCascadeDelete,
  undoDelete,
  purgeExpiredDeletions,
  getAllPeople,
  findPeopleByName,
  getPeopleByTreeId,
  getDeletedPersons,
  getDeletedPersonsByTreeId,
  purgePerson,
  findPersonByFields, // Added missing function
};
