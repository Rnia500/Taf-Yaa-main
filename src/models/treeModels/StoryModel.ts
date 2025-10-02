import { generateId } from "../../utils/personUtils/idGenerator";

export interface Story {
  storyId: string;
  treeId: string;
  personId: string;
  title: string;
  type: "audio" | "text";
  language?: string | null;
  audioUrl?: string | null;
  addedBy: string;
  timestamp: string;  // ISO string
  tags?: string[];
  // Deletion metadata for soft/cascade delete with undo
  isDeleted?: boolean;
  deletedAt?: string | null;
  deletionMode?: "soft" | "cascade" | null;
  pendingDeletion?: boolean;
  undoExpiresAt?: string | null;
  deletionBatchId?: string | null;
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



/** Factory to create a new story */
export const createStory = (params: Omit<Story, "storyId" | "timestamp">): Story => {
  return {
    storyId: generateId("story"),
    treeId: params.treeId,
    personId: params.personId,
    title: params.title,
    type: params.type,
    language: params.language || null,
    audioUrl: params.audioUrl || null,
    addedBy: params.addedBy,
    timestamp: new Date().toISOString(),
    tags: params.tags || [],
    // Deletion metadata defaults
    isDeleted: false,
    deletedAt: null,
    deletionMode: null,
    pendingDeletion: false,
    undoExpiresAt: null,
    deletionBatchId: null,
  };
};

/** Quick tag adder */
export const addTag = (story: Story, tag: string): Story => {
  return {
    ...story,
    tags: [...(story.tags || []), tag],
    timestamp: new Date().toISOString(), // update timestamp on change
  };
};
