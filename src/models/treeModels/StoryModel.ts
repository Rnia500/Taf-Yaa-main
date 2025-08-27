// src/models/stories.ts

export interface Story {
  storyId: string;
  treeId: string;
  personId: string;
  title: string;
  type: "audio" | "text";
  language?: string;
  text?: string | null;
  audioUrl?: string | null;
  addedBy: string;
  timestamp: string;  // ISO string
  tags?: string[];
}

// --- Helpers ---

/** Format the story date for UI */
export const formatStoryDate = (story: Story, locale = "en-US"): string =>
  new Date(story.timestamp).toLocaleDateString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

/** Check if story has audio */
export const hasAudio = (story: Story): boolean =>
  story.type === "audio" && !!story.audioUrl;
