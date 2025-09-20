// src/services/commands/addTree.js
import dataService from "../../services/dataService";
import { createTree } from "../../models/treeModels/treeModel";
import { createPerson } from "../../models/treeModels/PersonModel";
import { addBirth, addDeath } from "./events";
import { createAudioStory } from "./stories";
import { generateId } from "../../utils/personUtils/idGenerator";


export async function addTree(formData, options = {}) {
  const { createdBy = "system", onError } = options;

  try {
    // --- 1. INITIAL VALIDATION ---
    if (!formData.familyName) throw new Error("Family name is required");
    if (!formData.rootPersonName) throw new Error("Root person name is required");
    if (!formData.rootPersonGender) throw new Error("Root person gender is required");

    // --- 2. FILE UPLOADS ---
    let uploadedPhotoUrl = null;
    if (formData.rootPersonPhoto) {
      try {
        const uploaded = await dataService.uploadFile(formData.rootPersonPhoto, "image");
        uploadedPhotoUrl = uploaded.url;
      } catch (err) {
        console.error("Root person photo upload failed", err);
      }
    }

    let uploadedAudioUrl = null;
    if (formData.rootPersonAudioFile) {
      try {
        const uploaded = await dataService.uploadFile(formData.rootPersonAudioFile, "audio");
        uploadedAudioUrl = uploaded.url;
      } catch (err) {
        console.error("Root person audio upload failed", err);
      }
    }

    // --- 3. CREATE TREE OBJECT ---
    const treeId = generateId("tree");
    const tree = createTree({
      id: treeId,
      familyName: formData.familyName,
      createdBy,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      currentRootId: null, 
      familyDescription: formData.familyDescription,
      orgineTribe: formData.orgineTribe,
      origineHomeLand: formData.origineHomeLand,
      origineTongue: formData.origineTongue,
      roles: { [createdBy]: "admin" },
      settings: {
        privacy: {
          isPublic: formData.isPublic ?? false,
          allowMergeRequests: formData.allowMergeRequests ?? true,
          globalMatchOptIn: formData.globalMatchOptIn ?? false,
          allowInvites: formData.allowInvites ?? true,
        },
        relationship: {
          allowPolygamy: formData.allowPolygamy ?? false,
          allowMultipleMarriages: formData.allowMultipleMarriages ?? true,
          allowUnknownParentLinking: formData.allowUnknownParentLinking ?? false,
          maxGenerationsDisplayed: formData.maxGenerationsDisplayed ?? 10,
        },
        display: {
          showRoleBadges: true,
          showGenderIcons: true,
          defaultRootPerson: null,
        },
        language: {
          interfaceLanguage: formData.language || "en",
          allowPerUserLanguageOverride: true,
        },
        lifeEvents: {
          birth: true,
          death: true,
          marriage: true,
          divorce: true,
          migration: false,
        },
        limits: {
          maxStoryLength: 500,
          maxImageFileSize: "2mb",
          maxAudioFileSize: "5mb",
        },
      },
    });

    await dataService.addTree(tree);

    // --- 4. CREATE ROOT PERSON ---
    const rootPersonId = generateId("person");
    const rootPerson = createPerson({
      id: rootPersonId,
      treeId,
      name: formData.rootPersonName,
      gender: formData.rootPersonGender,
      dob: formData.rootPersonDob || null,
      dod: formData.rootPersonDod || null,
      tribe: formData.rootPersonTribe || null,
      placeOfBirth: formData.rootPersonPlaceOfBirth || null,
      placeOfDeath: formData.rootPersonPlaceOfDeath || null,
      photoUrl: uploadedPhotoUrl,
      bio: formData.rootPersonBiography || "",
      isDeceased: !!formData.rootPersonDod,
      isSpouse: false,
      allowGlobalMatching: true,
      privacyLevel: "membersOnly",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    await dataService.addPerson(rootPerson);

    // Update tree root
    await dataService.updateTree(treeId, { currentRootId: rootPersonId });

    // --- 5. CREATE ASSOCIATED RECORDS ---
    if (rootPerson.dob) {
      await addBirth(treeId, rootPersonId, { date: rootPerson.dob, title: "Birth" });
    }
    if (rootPerson.dod) {
      await addDeath(treeId, rootPersonId, { date: rootPerson.dod, title: "Death" });
    }

    if (uploadedAudioUrl || formData.rootPersonStoryTitle) {
      await createAudioStory({
        treeId,
        personId: rootPersonId,
        addedBy: createdBy,
        storyTitle: formData.rootPersonStoryTitle || "Life Story",
        language: formData.language || "en",
        audioFile: uploadedAudioUrl,
      });
    }

    // --- 6. RETURN SUCCESS ---
    return { tree: { ...tree, currentRootId: rootPersonId }, rootPerson };
  } catch (err) {
    console.error("Error in addTree orchestrator:", err);
    onError?.(err.message || "Unexpected error", "error");
    throw err;
  }
}
