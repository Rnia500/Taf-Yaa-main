// The complete, corrected file: src/controllers/tree/stories.js

import dataService from "../../services/dataService";
import { createStory } from "../../models/treeModels/StoryModel";



 

export async function addStory(params) {
  console.log("DBG:stories.addStory ->", params);

  // Use the factory from the StoryModel to ensure the object is valid.
  const story = createStory(params);

  // Persist the valid story object using the data service.
  const saved = await dataService.addStory(story);

  return saved;
}

export async function updateStory(storyId, updates) {
  console.log("DBG:stories.updateStory ->", storyId, updates);
  return dataService.updateStory(storyId, updates);
}


export async function getStoriesByPerson(personId) {
  console.log(`DBG:stories.getStoriesByPerson -> for personId: ${personId}`);
  // Delegate the filtering to the dataService for performance.
  return dataService.getStoriesByPersonId(personId);
}


export async function createAudioStory(params) {
  const { treeId, personId, addedBy, storyTitle, language, audioFile, subtitle, tags } = params;
  let audioUrl = null;

  if (audioFile) {
    try {
      const uploaded = await dataService.uploadFile(audioFile, "audio");
      audioUrl = uploaded.url;
      console.log("DBG: audio uploaded", audioUrl);
    } catch (err) {
      console.error("Audio upload failed:", err);
    }
  }

  if (!storyTitle && !audioUrl) return null;

  const saved = await addStory({
    treeId,
    personId,
    addedBy,
    title: storyTitle || "Oral History",
    type: "audio",
    language: language || null,
    audioUrl,
    text: subtitle || null,
    tags: Array.isArray(tags) && tags.length ? tags : undefined,
  });

  try {
    // Inform listeners that stories changed (so UI can reload)
    window.dispatchEvent(new Event('familyDataChanged'));
  } catch {}

  return saved;
}
