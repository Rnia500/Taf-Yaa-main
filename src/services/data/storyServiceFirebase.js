// src/services/data/storyServiceFirebase.js

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

async function addStory(story) {
  try {
    // Check if story with same ID already exists
    const existingStory = await getStory(story.storyId);
    if (existingStory) {
      console.warn("storyServiceFirebase.addStory -> duplicate story id detected:", story.storyId);
      story = { ...story, storyId: generateId("story") };
    }

    const storyRef = doc(db, 'stories', story.storyId);
    const storyData = {
      ...story,
      active: true, // Add active field for better querying
      createdAt: getCurrentTimestamp(),
      updatedAt: getCurrentTimestamp()
    };

    await setDoc(storyRef, storyData);
    return story;
  } catch (error) {
    throw new Error(`Failed to add story: ${error.message}`);
  }
}

async function getStory(storyId) {
  try {
    const storyRef = doc(db, 'stories', storyId);
    const storySnap = await getDoc(storyRef);
    
    if (storySnap.exists()) {
      return { id: storySnap.id, ...storySnap.data() };
    } else {
      return null;
    }
  } catch (error) {
    throw new Error(`Failed to get story: ${error.message}`);
  }
}

async function updateStory(storyId, updatedData) {
  try {
    const storyRef = doc(db, 'stories', storyId);
    const updateData = {
      ...updatedData,
      updatedAt: getCurrentTimestamp()
    };

    await updateDoc(storyRef, updateData);
    
    // Return updated story
    return await getStory(storyId);
  } catch (error) {
    throw new Error(`Failed to update story: ${error.message}`);
  }
}

async function deleteStory(storyId) {
  try {
    const story = await getStory(storyId);
    if (!story) {
      throw new Error("Story not found");
    }

    // Permanently delete the story
    await deleteDoc(doc(db, 'stories', storyId));
    
    console.log(`DBG:storyServiceFirebase.deleteStory -> permanently removed ${storyId}`);
    return story;
  } catch (error) {
    throw new Error(`Failed to delete story: ${error.message}`);
  }
}

async function getAllStories() {
  try {
    const storiesRef = collection(db, 'stories');
    const q = query(storiesRef, where('active', '==', true));
    const querySnapshot = await getDocs(q);
    
    const stories = [];
    querySnapshot.forEach((doc) => {
      stories.push({ id: doc.id, ...doc.data() });
    });
    
    return stories;
  } catch (error) {
    throw new Error(`Failed to get all stories: ${error.message}`);
  }
}

async function getStoriesByPersonId(personId) {
  try {
    const storiesRef = collection(db, 'stories');
    const q = query(storiesRef, where('active', '==', true));
    const querySnapshot = await getDocs(q);
    
    const stories = [];
    querySnapshot.forEach((doc) => {
      const story = { id: doc.id, ...doc.data() };
      
      // Check if story is for this person
      if (story.personId === personId || 
          (Array.isArray(story.personIds) && story.personIds.includes(personId))) {
        stories.push(story);
      }
    });
    
    return stories;
  } catch (error) {
    throw new Error(`Failed to get stories by person ID: ${error.message}`);
  }
}

async function findStoriesByTitle(query) {
  try {
    if (!query) {
      return [];
    }

    const storiesRef = collection(db, 'stories');
    const q = query(
      storiesRef,
      where('active', '==', true),
      where('title', '>=', query.trim()),
      where('title', '<=', query.trim() + '\uf8ff')
    );
    
    const querySnapshot = await getDocs(q);
    const results = [];
    
    querySnapshot.forEach((doc) => {
      const story = { id: doc.id, ...doc.data() };
      if (story.title && story.title.toLowerCase().includes(query.toLowerCase())) {
        results.push(story);
      }
    });
    
    return results;
  } catch (error) {
    throw new Error(`Failed to find stories by title: ${error.message}`);
  }
}

// Mark stories as deleted for a person (used during person deletion)
async function markStoriesForPersonDeleted(personId, batchId, undoExpiresAt) {
  try {
    const storiesRef = collection(db, 'stories');
    const q = query(storiesRef, where('active', '==', true));
    const querySnapshot = await getDocs(q);
    
    let markedCount = 0;
    const now = new Date().toISOString();

    for (const doc of querySnapshot.docs) {
      const story = { id: doc.id, ...doc.data() };
      
      // Check if story is for this person
      if (story.personId === personId || 
          (Array.isArray(story.personIds) && story.personIds.includes(personId))) {
        
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
    }

    console.log(`DBG:storyServiceFirebase.markStoriesForPersonDeleted -> marked ${markedCount} stories for person ${personId}`);
    return { markedCount };
  } catch (error) {
    throw new Error(`Failed to mark stories for person deleted: ${error.message}`);
  }
}

// Undo deletion for stories in a batch
async function undoStoriesDeletion(batchId) {
  try {
    const storiesRef = collection(db, 'stories');
    const q = query(storiesRef, where('deletionBatchId', '==', batchId));
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

    console.log(`DBG:storyServiceFirebase.undoStoriesDeletion -> restored ${restoredCount} stories for batch ${batchId}`);
    return { restoredCount };
  } catch (error) {
    throw new Error(`Failed to undo stories deletion: ${error.message}`);
  }
}

// Permanently remove expired deleted stories
async function purgeExpiredDeletedStories() {
  try {
    const storiesRef = collection(db, 'stories');
    const now = new Date();
    const q = query(
      storiesRef,
      where('pendingDeletion', '==', true),
      where('undoExpiresAt', '<=', now.toISOString())
    );
    const querySnapshot = await getDocs(q);
    
    let removedCount = 0;

    for (const doc of querySnapshot.docs) {
      await deleteDoc(doc.ref);
      removedCount++;
    }

    console.log(`DBG:storyServiceFirebase.purgeExpiredDeletedStories -> removed ${removedCount} expired stories`);
    return { removedCount };
  } catch (error) {
    throw new Error(`Failed to purge expired deleted stories: ${error.message}`);
  }
}

// Export all the functions in a single service object.
export const storyServiceFirebase = {
  addStory,
  getStory,
  updateStory,
  deleteStory,
  getAllStories,
  getStoriesByPersonId,
  findStoriesByTitle,
  markStoriesForPersonDeleted,
  undoStoriesDeletion,
  purgeExpiredDeletedStories,
};