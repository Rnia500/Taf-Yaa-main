// src/models/tree.ts
import { generateId } from "../../utils/personUtils/idGenerator";

export interface Tree {
  id: string;
  familyName: string;            // "Diallo Family"
  createdBy: string;             // userId of the creator
  createdAt: string;             // ISO timestamp
  updatedAt: string;             // ISO timestamp
  currentRootId?: string | null; // Person.id that is the "entry point" to the tree

  // Roles apply only to registered users
  roles: Record<string, "admin" | "moderator" | "editor" | "viewer">;

  // Tree-wide settings
  settings: {
    privacy: {
      isPublic: boolean;                // Tree discoverability
      allowMergeRequests: boolean;      // Other users can propose merges
      globalMatchOptIn: boolean;        // Allow cross-tree matching
      defaultMemberVisibility: "visible" | "hidden";
    };

    relationship: {
      allowPolygamy: boolean;
      allowMultipleMarriages: boolean;
      allowUnknownParentLinking: boolean;
      maxGenerationsDisplayed: number;  // e.g. slider 5–20
    };

    display: {
      showRoleBadges: boolean;
      showGenderIcons: boolean;
      defaultRootPerson?: string | null; // personId
      nodeColorScheme: "classic" | "modern" | "custom";
    };

    language: {
      interfaceLanguage: string;       // e.g. "en"
      defaultStorytellingDialect?: string | null;
      allowPerUserLanguageOverride: boolean;
    };

    lifeEvents: {
      birth: boolean;
      death: boolean;
      marriage: boolean;
      divorce: boolean;
      migration?: boolean;
      [key: string]: boolean | undefined; // extensible for custom events
    };

    limits: {
      maxStoryLength: number;          // e.g. 100–1000 chars
      maxImageFileSize: string;        // e.g. "2mb"
      maxAudioFileSize: string;        // e.g. "5mb"
    };
  };
}

// --- Factory ---
export function createTree(input: Partial<Tree>): Tree {
  const id = input.id || generateId("tree");
  return {
    id,
    familyName: input.familyName || "Untitled Tree",
    createdBy: input.createdBy!,
    createdAt: input.createdAt || new Date().toISOString(),
    updatedAt: input.updatedAt || new Date().toISOString(),
    currentRootId: input.currentRootId || null,

    roles: input.roles || { [input.createdBy!]: "admin" },

    settings: {
      privacy: {
        isPublic: input.settings?.privacy?.isPublic ?? false,
        allowMergeRequests: input.settings?.privacy?.allowMergeRequests ?? false,
        globalMatchOptIn: input.settings?.privacy?.globalMatchOptIn ?? false,
        defaultMemberVisibility: input.settings?.privacy?.defaultMemberVisibility || "visible",
      },
      relationship: {
        allowPolygamy: input.settings?.relationship?.allowPolygamy ?? false,
        allowMultipleMarriages: input.settings?.relationship?.allowMultipleMarriages ?? true,
        allowUnknownParentLinking: input.settings?.relationship?.allowUnknownParentLinking ?? false,
        maxGenerationsDisplayed: input.settings?.relationship?.maxGenerationsDisplayed || 10,
      },
      display: {
        showRoleBadges: input.settings?.display?.showRoleBadges ?? true,
        showGenderIcons: input.settings?.display?.showGenderIcons ?? true,
        defaultRootPerson: input.settings?.display?.defaultRootPerson || null,
        nodeColorScheme: input.settings?.display?.nodeColorScheme || "classic",
      },
      language: {
        interfaceLanguage: input.settings?.language?.interfaceLanguage || "en",
        defaultStorytellingDialect: input.settings?.language?.defaultStorytellingDialect || null,
        allowPerUserLanguageOverride: input.settings?.language?.allowPerUserLanguageOverride ?? true,
      },
      lifeEvents: {
        birth: true,
        death: true,
        marriage: true,
        divorce: true,
        migration: false,
        ...(input.settings?.lifeEvents || {}),
      },
      limits: {
        maxStoryLength: input.settings?.limits?.maxStoryLength || 500,
        maxImageFileSize: input.settings?.limits?.maxImageFileSize || "2mb",
        maxAudioFileSize: input.settings?.limits?.maxAudioFileSize || "5mb",
      },
    },
  };
}
