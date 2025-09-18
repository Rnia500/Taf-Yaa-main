
import dataService from "../../services/dataService";
import { createPerson } from "../../models/treeModels/PersonModel";
import { handleSpouseAddition } from "./marriages";
import { addBirth, addDeath, addCustom } from "./events";
import { createAudioStory } from "./stories";

export async function addSpouse(treeId, existingSpouseId, newSpouseData, options = {}) {
    const { onError, confirmConvert, createdBy = "system" } = options;
    try {
        // --- 1. INITIAL VALIDATION ---
        const existingSpouse = await dataService.getPerson(existingSpouseId);
        if (!existingSpouse) throw new Error("Existing spouse not found");
        if (existingSpouse.isPlaceholder) {
            onError?.("Cannot add a spouse to a placeholder partner.", "error");
            return null;
        }
        if (existingSpouse.gender === newSpouseData.gender) {
            throw new Error("Same-sex marriages are not allowed.");
        }

        // --- 2. FILE UPLOADS ---
        let uploadedPhotoUrl = null;
        if (newSpouseData.profilePhoto) {
            try {
                const uploaded = await dataService.uploadFile(newSpouseData.profilePhoto, "image");
                uploadedPhotoUrl = uploaded.url;
            } catch (err) {
                console.error("Photo upload failed", err);
            }
        }
        // --- 3. PERSON "FIND OR CREATE" LOGIC ---
        let newSpouse = await dataService.findPersonByFields?.({
            treeId,
            name: newSpouseData.fullName,
            gender: newSpouseData.gender,
            dob: newSpouseData.dateOfBirth || null,
        });

        if (!newSpouse) {
            //2 Map the form data names to the model property names.
            newSpouse = createPerson({
                treeId: treeId,
                name: newSpouseData.fullName,
                gender: newSpouseData.gender,
                dob: newSpouseData.dateOfBirth,
                dod: newSpouseData.dateOfDeath,
                placeOfBirth: newSpouseData.placeOfBirth,
                placeOfDeath: newSpouseData.placeOfDeath,
                nationality: newSpouseData.nationality,
                countryOfResidence: newSpouseData.countryOfResidence,
                email: newSpouseData.email,
                phoneNumber: newSpouseData.phoneNumber,
                photoUrl: uploadedPhotoUrl,
                bio: newSpouseData.biography,
                tribe: newSpouseData.tribe,
                language: newSpouseData.language,
                isDeceased: newSpouseData.isDeceased,
                privacyLevel: newSpouseData.privacyLevel,
                allowGlobalMatching: newSpouseData.allowGlobalMatching,
                isSpouse: true,
            });

            await dataService.addPerson(newSpouse);

            // --- 4. CREATE ASSOCIATED RECORDS ---
            // This logic remains the same.
            if (newSpouse.dob) await addBirth(treeId, newSpouse.id, { date: newSpouse.dob, title: "Birth" });
            if (newSpouse.dod) await addDeath(treeId, newSpouse.id, { date: newSpouse.dod, title: "Death" });

            if (Array.isArray(newSpouseData.events)) {
                for (const ev of newSpouseData.events) {
                    await addCustom(treeId, [newSpouse.id], ev.customType, ev);
                }
            }
            if (newSpouseData.audioFile || newSpouseData.storyTitle) {
                await createAudioStory({
                    treeId: treeId,
                    personId: newSpouse.id,
                    addedBy: createdBy,
                    storyTitle: newSpouseData.storyTitle,
                    language: newSpouseData.language,
                    audioFile: newSpouseData.audioFile, // Pass the file directly to the service
                });
            }

        }


        // --- 5. DELEGATE MARRIAGE LOGIC ---
        const { marriage, marriageAction } = await handleSpouseAddition(
            existingSpouse,
            newSpouse,
            newSpouseData, // Pass the original form data for marriage-specific fields
            confirmConvert,
            createdBy
        );

        // --- 6. RETURN SUCCESS ---
        return {
            spouse: newSpouse,
            marriage: marriage,
            marriageAction: marriageAction,
        };

    } catch (err) {
        if (err.message === "User cancelled conversion.") {
            onError?.("User cancelled spouse addition.", "warning");
            return null;
        }
        console.error("Error in addSpouse orchestrator:", err);
        onError?.(err.message || "Unexpected error.", "error");
        throw err;
    }
}