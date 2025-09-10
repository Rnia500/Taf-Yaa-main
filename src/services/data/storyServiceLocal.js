// src/services/data/storyServiceLocal.js

// 1. Import the database manager.
import { getDB, saveDB } from "./localDB.js";
import { generateId } from "../../utils/personUtils/idGenerator.js";

// --- Story-Specific Data Access Functions (Local Storage Implementation) ---

function addStory(story) {
  const db = getDB();
  db.stories = db.stories || [];

  const exists = db.stories.find(s => s.storyId === story.storyId);
  if (exists) {
    console.warn("storyServiceLocal.addStory -> duplicate story id detected:", story.storyId);
    story = { ...story, storyId: generateId("story") };
  }
  db.stories.push(story);
  saveDB();
  return Promise.resolve(story);
}

function getStory(storyId) {
  const db = getDB();
  const s = (db.stories || []).find(st => st.storyId === storyId);
  return Promise.resolve(s);
}

function updateStory(storyId, updatedData) {
  const db = getDB();
  const storyIndex = (db.stories || []).findIndex(s => s.storyId === storyId);
  if (storyIndex === -1) {
    return Promise.reject(new Error("Story not found"));
  }
  db.stories[storyIndex] = { ...db.stories[storyIndex], ...updatedData, updatedAt: new Date().toISOString() };
  saveDB();
  return Promise.resolve(db.stories[storyIndex]);
}

function deleteStory(storyId) {
  const db = getDB();
  const storyIndex = (db.stories || []).findIndex(s => s.storyId === storyId);
  if (storyIndex === -1) {
    return Promise.reject(new Error("Story not found"));
  }
  const removed = db.stories.splice(storyIndex, 1)[0];
  saveDB();
  return Promise.resolve(removed);
}

function getAllStories() {
  const db = getDB();
  return Promise.resolve([...(db.stories || [])]);
}

function getStoriesByPersonId(personId) {
  const db = getDB();
  const stories = (db.stories || []).filter(s => s.personId === personId || (Array.isArray(s.personIds) && s.personIds.includes(personId)));
  return Promise.resolve(stories);
}

function findStoriesByTitle(query) {
  const db = getDB();
  if (!query) return Promise.resolve([]);
  const q = String(query).trim().toLowerCase();
  const results = (db.stories || []).filter(s => (s.title || '').toLowerCase().includes(q));
  return Promise.resolve(results);
}


// Export all the functions in a single, coherent service object.
export const storyServiceLocal = {
  addStory,
  getStory,
  updateStory,
  deleteStory,
  getAllStories,
  getStoriesByPersonId,
  findStoriesByTitle,
};