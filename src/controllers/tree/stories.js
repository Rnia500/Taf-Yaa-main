// The complete, corrected file: src/controllers/tree/stories.js

import * as dataService from "../../services/dataService";
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
  const { treeId, personId, addedBy, storyTitle, language, audioFile } = params;
  let audioUrl = null;

  // Step 1: Handle the file upload. This is a critical piece of logic from your original function.
  if (audioFile) {
    try {
      const uploaded = await dataService.uploadFile(audioFile, "audio");
      audioUrl = uploaded.url;
      console.log(`DBG:stories.createAudioStory -> audio uploaded, url: ${audioUrl}`);
    } catch (err) {
      console.error("Audio upload failed:", err);
      // Depending on requirements, you could throw an error here or proceed without audio.
    }
  }

  // Step 2: Ensure a story should still be created.
  // The original logic would create a story if either a title OR a file was present.
  if (!storyTitle && !audioUrl) {
    console.log("Skipping story creation: no title or uploaded audio URL provided.");
    return null; // Return null to indicate no action was taken.
  }

  // Step 3: Use the low-level `addStory` controller to create the final record.
  // This reuses your existing clean code.
  return addStory({
    treeId,
    personId,
    addedBy,
    title: storyTitle || "Oral History", // Default title from original logic
    type: "audio",
    language: language || null,
    audioUrl: audioUrl, // Use the URL from the successful upload
    // The createStory factory will handle the rest (storyId, timestamp)
  });
}