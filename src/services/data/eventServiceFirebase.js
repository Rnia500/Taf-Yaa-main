// src/services/data/eventServiceFirebase.js

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
  deleteField
} from 'firebase/firestore';
import { db } from '../../config/firebase.js';
import { generateId } from '../../utils/personUtils/idGenerator.js';

// Helper function to get current timestamp
const getCurrentTimestamp = () => serverTimestamp();

async function addEvent(event) {
  try {
    // Check if event with same ID already exists
    const existingEvent = await getEvent(event.id);
    if (existingEvent) {
      console.warn("eventServiceFirebase.addEvent -> duplicate event id detected:", event.id);
      event = { ...event, id: generateId("event") };
    }

    const eventRef = doc(db, 'events', event.id);
    const eventData = {
      ...event,
      active: true, // Add active field for better querying
      createdAt: getCurrentTimestamp(),
      updatedAt: getCurrentTimestamp()
    };

    await setDoc(eventRef, eventData);
    return event;
  } catch (error) {
    throw new Error(`Failed to add event: ${error.message}`);
  }
}

async function getEvent(eventId) {
  try {
    const eventRef = doc(db, 'events', eventId);
    const eventSnap = await getDoc(eventRef);
    
    if (eventSnap.exists()) {
      return { id: eventSnap.id, ...eventSnap.data() };
    } else {
      return null;
    }
  } catch (error) {
    throw new Error(`Failed to get event: ${error.message}`);
  }
}

async function updateEvent(eventId, updatedData) {
  try {
    const eventRef = doc(db, 'events', eventId);
    const updateData = {
      ...updatedData,
      updatedAt: getCurrentTimestamp()
    };

    await updateDoc(eventRef, updateData);
    
    // Return updated event
    return await getEvent(eventId);
  } catch (error) {
    throw new Error(`Failed to update event: ${error.message}`);
  }
}

async function deleteEvent(eventId) {
  try {
    const event = await getEvent(eventId);
    if (!event) {
      throw new Error("Event not found");
    }

    // Permanently delete the event
    await deleteDoc(doc(db, 'events', eventId));
    
    console.log(`DBG:eventServiceFirebase.deleteEvent -> permanently removed ${eventId}`);
    return event;
  } catch (error) {
    throw new Error(`Failed to delete event: ${error.message}`);
  }
}

async function getAllEvents() {
  try {
    const eventsRef = collection(db, 'events');
    const q = query(eventsRef, where('active', '==', true));
    const querySnapshot = await getDocs(q);
    
    const events = [];
    querySnapshot.forEach((doc) => {
      events.push({ id: doc.id, ...doc.data() });
    });
    
    return events;
  } catch (error) {
    throw new Error(`Failed to get all events: ${error.message}`);
  }
}

async function getEventsByPersonId(personId) {
  try {
    const eventsRef = collection(db, 'events');
    const q = query(
      eventsRef,
      where('active', '==', true),
      where('personIds', 'array-contains', personId)
    );
    const querySnapshot = await getDocs(q);
    
    const events = [];
    querySnapshot.forEach((doc) => {
      events.push({ id: doc.id, ...doc.data() });
    });

    // Sort: Birth first, then chronological by date
    const birthEvent = events.find(e => e.type === 'birth');
    const otherEvents = events.filter(e => e.type !== 'birth');

    // Sort other events by date (earliest first), null dates last
    otherEvents.sort((a, b) => {
      const dateA = a.date ? new Date(a.date).getTime() : Infinity;
      const dateB = b.date ? new Date(b.date).getTime() : Infinity;
      return dateA - dateB;
    });

    const sortedEvents = birthEvent ? [birthEvent, ...otherEvents] : otherEvents;
    return sortedEvents;
  } catch (error) {
    throw new Error(`Failed to get events by person ID: ${error.message}`);
  }
}

async function findEventsByTitle(query) {
  try {
    if (!query) {
      return [];
    }

    const eventsRef = collection(db, 'events');
    const q = query(
      eventsRef,
      where('active', '==', true),
      where('title', '>=', query.trim()),
      where('title', '<=', query.trim() + '\uf8ff')
    );
    
    const querySnapshot = await getDocs(q);
    const results = [];
    
    querySnapshot.forEach((doc) => {
      const event = { id: doc.id, ...doc.data() };
      if (event.title && event.title.toLowerCase().includes(query.toLowerCase())) {
        results.push(event);
      }
    });
    
    return results;
  } catch (error) {
    throw new Error(`Failed to find events by title: ${error.message}`);
  }
}

// Mark events as deleted for a person (used during person deletion)
async function markEventsForPersonDeleted(personId, batchId, undoExpiresAt) {
  try {
    const eventsRef = collection(db, 'events');
    const q = query(
      eventsRef,
      where('active', '==', true),
      where('personIds', 'array-contains', personId)
    );
    const querySnapshot = await getDocs(q);
    
    let markedCount = 0;
    const now = new Date().toISOString();

    for (const doc of querySnapshot.docs) {
      const updateData = {
        isDeleted: true,
        deletedAt: now,
        deletionMode: "cascade",
        pendingDeletion: true,
        undoExpiresAt: undoExpiresAt,
        deletionBatchId: batchId,
        active: false, // Mark as inactive
        updatedAt: getCurrentTimestamp()
      };

      await updateDoc(doc.ref, updateData);
      markedCount++;
    }

    console.log(`DBG:eventServiceFirebase.markEventsForPersonDeleted -> marked ${markedCount} events for person ${personId}`);
    return { markedCount };
  } catch (error) {
    throw new Error(`Failed to mark events for person deleted: ${error.message}`);
  }
}

// Undo deletion for events in a batch
async function undoEventsDeletion(batchId) {
  try {
    const eventsRef = collection(db, 'events');
    const q = query(eventsRef, where('deletionBatchId', '==', batchId));
    const querySnapshot = await getDocs(q);
    
    let restoredCount = 0;

    for (const doc of querySnapshot.docs) {
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
      restoredCount++;
    }

    console.log(`DBG:eventServiceFirebase.undoEventsDeletion -> restored ${restoredCount} events for batch ${batchId}`);
    return { restoredCount };
  } catch (error) {
    throw new Error(`Failed to undo events deletion: ${error.message}`);
  }
}

// Permanently remove expired deleted events
async function purgeExpiredDeletedEvents() {
  try {
    const eventsRef = collection(db, 'events');
    const now = new Date();
    const q = query(
      eventsRef,
      where('pendingDeletion', '==', true),
      where('undoExpiresAt', '<=', now.toISOString())
    );
    const querySnapshot = await getDocs(q);
    
    let removedCount = 0;

    for (const doc of querySnapshot.docs) {
      await deleteDoc(doc.ref);
      removedCount++;
    }

    console.log(`DBG:eventServiceFirebase.purgeExpiredDeletedEvents -> removed ${removedCount} expired events`);
    return { removedCount };
  } catch (error) {
    throw new Error(`Failed to purge expired deleted events: ${error.message}`);
  }
}

// Export all the functions in a single service object.
export const eventServiceFirebase = {
  addEvent,
  getEvent,
  updateEvent,
  deleteEvent,
  getAllEvents,
  getEventsByPersonId,
  findEventsByTitle,
  markEventsForPersonDeleted,
  undoEventsDeletion,
  purgeExpiredDeletedEvents,
};