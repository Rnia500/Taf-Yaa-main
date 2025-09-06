// src/controllers/treeController.js
import dataService from "../../services/dataService";
import { generateId } from "../../utils/personUtils/idGenerator";


/**
 * Add a Spouse to a marriage or create a new marriage with a spouse.
 */
export async function addSpouse(treeId, existingSpouseId, newSpouseData, options = {}) {
  const { onError, confirmConvert } = options;
  try {
    const existingSpouse = await dataService.getPerson(existingSpouseId);
    if (!existingSpouse) throw new Error("Existing spouse not found");
    if (existingSpouse.isPlaceholder) {
      onError?.(
        "Cannot add a spouse to a placeholder partner. Only directline members can initiate marriages.",
        "error"
      );
      return null;
    }

    // --- 🔹 Handle photo upload first ---
    let uploadedPhotoUrl = null;
    if (newSpouseData.profilePhoto) {
      try {
        const uploaded = await dataService.uploadFile(newSpouseData.profilePhoto, "image");
        uploadedPhotoUrl = uploaded.url;
      } catch (err) {
        console.error("DBG:addSpouse -> photo upload failed", err);
        uploadedPhotoUrl = null;
      }
    }

    const existingMarriages = await dataService.getMarriagesByPersonId(existingSpouseId);
    console.log("DBG:addSpouse existingMarriages:", JSON.parse(JSON.stringify(existingMarriages)));

    // Detect existing marriage types for this person
    const existingMonogamous = existingMarriages.find((m) => m.marriageType === "monogamous");
    const existingPolygamousForHusband = existingMarriages.find(
      (m) => m.marriageType === "polygamous" && m.husbandId === existingSpouseId
    );

    // If a polygamous marriage already exists for this husband, we ALWAYS append to it,
    if (existingSpouse.gender === "male" && existingPolygamousForHusband) {
      newSpouseData = { ...newSpouseData, marriageType: "polygamous" };
    }

    // If caller tries to add a monogamous marriage when one already exists, block unless conversion is approved.
    if (!existingPolygamousForHusband && existingMonogamous && newSpouseData.marriageType !== "polygamous") {
      if (confirmConvert) {
        const ok = await confirmConvert(existingMonogamous);
        if (!ok) {
          onError?.("User cancelled spouse addition.", "warning");
          return null;
        }
        // User confirmed conversion: treat the requested operation as polygamous
        newSpouseData = { ...newSpouseData, marriageType: "polygamous" };
      } else {
        throw new Error(" Existing marriage is monogamous. Conversion required.");
      }
    }

    // Relationship rules
    const rules = { allowSameSexMarriage: false, allowPolyandry: false, allowPolygyny: true };
    if (!rules.allowSameSexMarriage && existingSpouse.gender === newSpouseData.gender) {
      throw new Error(" Same-sex marriages are not allowed.");
    }
    if (newSpouseData.marriageType === "polygamous") {
      if (existingSpouse.gender !== "male" && !rules.allowPolyandry) {
        throw new Error(" Only husbands can have multiple wives. Polyandry is not allowed.");
      }
      if (newSpouseData.gender !== "female" && !rules.allowSameSexMarriage) {
        throw new Error(" Polygamous marriages must add female wives.");
      }
    }

    // create/reuse spouse
    let newSpouseId, newSpousePayload;
    const possibleMatch = await dataService.findPersonByFields?.({
      treeId,
      name: newSpouseData.fullName,
      gender: newSpouseData.gender,
      dob: newSpouseData.dateOfBirth || null,
    });
    if (possibleMatch) {
      newSpouseId = possibleMatch.id;
      newSpousePayload = possibleMatch;
    } else {
      newSpouseId = generateId("person");
      newSpousePayload = {
        id: newSpouseId,
        treeId,
        name: newSpouseData.fullName,
        gender: newSpouseData.gender,
        dob: newSpouseData.dateOfBirth || null,
        placeOfBirth: newSpouseData.placeOfBirth || newSpouseData.birthPlace || "",
        placeOfDeath: newSpouseData.placeOfDeath || newSpouseData.deathPlace || "",
        nationality: newSpouseData.nationality || "",
        countryOfResidence: newSpouseData.countryOfResidence || "",
        privacyLevel: newSpouseData.privacyLevel || "membersOnly",
        allowGlobalMatching: newSpouseData.allowGlobalMatching || true,
        isDeceased: newSpouseData.isDeceased || false,
        dod: newSpouseData.dateOfDeath || null,
        photoUrl: uploadedPhotoUrl, // 🔹 use uploaded URL here
        bio: newSpouseData.biography || "",
        tribe: newSpouseData.tribe || "",
        language: newSpouseData.language || "",
        isSpouse: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await dataService.addPerson(newSpousePayload);

      // Create birth/death events for the newly created spouse if dates available
      try {
        if (newSpousePayload.dob) {
          const eventId = generateId("event");
          const ev = {
            id: eventId,
            treeId,
            personIds: [newSpouseId],
            type: "birth",
            title: "Birth",
            date: newSpousePayload.dob,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          await dataService.addEvent(ev);
        }
        if (newSpousePayload.dod) {
          const eventId = generateId("event");
          const ev = {
            id: eventId,
            treeId,
            personIds: [newSpouseId],
            type: "death",
            title: "Death",
            date: newSpousePayload.dod,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          await dataService.addEvent(ev);
        }
      } catch (e) {
        console.error("DBG:addSpouse -> failed to create birth/death events for new spouse", e);
      }
    }

    // --- 🔹 Handle audio story upload before creating story ---
    try {
      let audioUrl = null;
      if (newSpouseData.audioFile || newSpouseData.audioURL) {
        const fileToUpload = newSpouseData.audioFile || newSpouseData.audioURL;
        try {
          const uploaded = await dataService.uploadFile(fileToUpload, "audio");
          audioUrl = uploaded.url;
        } catch (err) {
          console.error("DBG:addSpouse -> audio upload failed", err);
        }
      }

      if (newSpouseData && (audioUrl || newSpouseData.storyTitle)) {
        const storyId = generateId("story");
        const storyPayload = {
          storyId,
          treeId,
          personId: newSpouseId,
          title: newSpouseData.storyTitle || "Oral History",
          type: "audio",
          language: newSpouseData.language || null,
          text: null,
          audioUrl, // 🔹 use uploaded URL here
          addedBy: newSpouseData.addedBy || "system",
          timestamp: new Date().toISOString(),
        };
        await dataService.addStory(storyPayload);

        if (typeof window !== "undefined" && window) window.__LAST_ADDED_STORY__ = storyPayload;
      }
    } catch (err) {
      console.error("DBG:addSpouse -> failed to persist story:", err);
    }

    // Persist any event entries included with the spouse payload
    try {
      if (newSpouseData && Array.isArray(newSpouseData.events) && newSpouseData.events.length) {
        for (const ev of newSpouseData.events) {
          const eventPayload = {
            ...ev,
            id: ev.id || generateId("event"),
            treeId,
            personIds: [newSpouseId],
            createdAt: ev.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          try {
            await dataService.addEvent(eventPayload);
          } catch (e) {
            console.error("DBG:addSpouse -> failed to add event", e);
          }
        }
      }
    } catch (e) {
      console.error("DBG:addSpouse -> events persist error", e);
    }

    // ---- POLYGAMOUS PATH (append if one exists; else convert/create) ----
    if (newSpouseData.marriageType === "polygamous") {
      // 1) If monogamous exists , convert it to polygamous 
      if (existingMonogamous && !existingPolygamousForHusband) {
        const [sp1, sp2] = existingMonogamous.spouses || [];
        const sp1Person = await dataService.getPerson(sp1);
        const sp2Person = await dataService.getPerson(sp2);
        const husbandId = sp1Person?.gender === "male" ? sp1 : sp2Person?.gender === "male" ? sp2 : null;
        if (!husbandId) throw new Error("Invalid existing monogamous marriage: no male spouse found for conversion.");
        const wifeId = husbandId === sp1 ? sp2 : sp1;

        const converted = {
          ...existingMonogamous,
          marriageType: "polygamous",
          husbandId,
          wives: [
            {
              wifeId,
              order: 1,
              childrenIds: existingMonogamous.childrenIds || [],
              startDate: existingMonogamous.startDate || null,
              location: existingMonogamous.location || null,
              notes: existingMonogamous.notes || null,
              createdAt: existingMonogamous.createdAt,
              updatedAt: new Date().toISOString(),
            },
            {
              wifeId: newSpouseId,
              order: 2,
              childrenIds: [],
              startDate: newSpouseData.marriageDate || null,
              location: newSpouseData.marriageLocation || null,
              notes: newSpouseData.marriageNotes || null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
          spouses: undefined,
          childrenIds: [],
          updatedAt: new Date().toISOString(),
        };

        const updated = await dataService.updateMarriage(existingMonogamous.id, converted);
        // Create marriage events for each wife entry (including the converted existing wife)
        try {
          const husbandId = converted.husbandId;
          (converted.wives || []).forEach(async (w) => {
            const evId = generateId("event");
            const ev = {
              id: evId,
              treeId,
              personIds: [husbandId, w.wifeId],
              type: "marriage",
              title: `Marriage (${w.order}th wife)`,
              date: w.startDate || null,
              location: w.location || null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            await dataService.addEvent(ev);
          });
        } catch (e) {
          console.error("DBG:addSpouse -> failed to create events for converted polygamous marriage", e);
        }
        return { spouse: newSpousePayload, marriage: updated, marriageAction: "converted" };
      }

      // 2) If a polygamous for this husband already exists, append the new wife
      if (existingPolygamousForHusband) {
        if (existingPolygamousForHusband.wives.some((w) => w.wifeId === newSpouseId)) {
          return { spouse: newSpousePayload, marriage: existingPolygamousForHusband, marriageAction: "noop" };
        }
        const newWives = [
          ...(existingPolygamousForHusband.wives || []),
          {
            wifeId: newSpouseId,
            order: newSpouseData.wifeOrder || (existingPolygamousForHusband.wives?.length || 0) + 1,
            startDate: newSpouseData.marriageDate || null,
            location: newSpouseData.marriageLocation || null,
            notes: newSpouseData.marriageNotes || null,
            childrenIds: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ];
        const updatedMarriage = await dataService.updateMarriage(existingPolygamousForHusband.id, {
          wives: newWives,
          updatedAt: new Date().toISOString(),
        });
        // Create a marriage event for the newly appended wife
        try {
          const evId = generateId("event");
          const ev = {
            id: evId,
            treeId,
            personIds: [existingPolygamousForHusband.husbandId, newSpouseId],
            type: "marriage",
            title: `Marriage (wife ${newWives.length})`,
            date: newSpouseData.marriageDate || null,
            location: newSpouseData.marriageLocation || null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          await dataService.addEvent(ev);
        } catch (e) {
          console.error("DBG:addSpouse -> failed to create event for appended polygamous wife", e);
        }
        return { spouse: newSpousePayload, marriage: updatedMarriage, marriageAction: "updated" };
      }

      // 3) No marriages yet → create fresh polygamous
      const marriageId = generateId("marriage");
      const marriagePayload = {
        id: marriageId,
        treeId,
        marriageType: "polygamous",
        husbandId: existingSpouseId,
        wives: [
          {
            wifeId: newSpouseId,
            order: newSpouseData.wifeOrder || 1,
            startDate: newSpouseData.marriageDate || null,
            location: newSpouseData.marriageLocation || null,
            notes: newSpouseData.marriageNotes || null,
            childrenIds: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await dataService.addMarriage(marriagePayload);
      // create marriage event(s) for the new polygamous marriage
      try {
        const husbandId = marriagePayload.husbandId;
        (marriagePayload.wives || []).forEach(async (w) => {
          const evId = generateId("event");
          const ev = {
            id: evId,
            treeId,
            personIds: [husbandId, w.wifeId],
            type: "marriage",
            title: `Marriage (wife ${w.order})`,
            date: w.startDate || null,
            location: w.location || null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          await dataService.addEvent(ev);
        });
      } catch (e) {
        console.error("DBG:addSpouse -> failed to create events for new polygamous marriage", e);
      }
      return { spouse: newSpousePayload, marriage: marriagePayload, marriageAction: "created" };
    }

    // ---- MONOGAMOUS PATH (only when NO polygamous exists for husband) ----
    if (existingPolygamousForHusband) {
      throw new Error(" Cannot create a monogamous marriage: husband already has a polygamous marriage.");
    }

    if (existingMonogamous) {
      throw new Error(" Existing marriage is monogamous. Conversion required.");
    }

    //new monogamous
    const marriageId = generateId("marriage");
    const marriagePayload = {
      id: marriageId,
      treeId,
      marriageType: "monogamous",
      spouses: [existingSpouseId, newSpouseId],
      childrenIds: [],
      startDate: newSpouseData.marriageDate || null,
      location: newSpouseData.marriageLocation || null,
      notes: newSpouseData.marriageNotes || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await dataService.addMarriage(marriagePayload);
    // Create a marriage event for the new monogamous marriage
    try {
      const evId = generateId("event");
      const ev = {
        id: evId,
        treeId,
        personIds: [existingSpouseId, newSpouseId],
        type: "marriage",
        title: "Marriage",
        date: marriagePayload.startDate || newSpouseData.marriageDate || null,
        location: marriagePayload.location || newSpouseData.marriageLocation || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await dataService.addEvent(ev);
    } catch (e) {
      console.error("DBG:addSpouse -> failed to create event for new monogamous marriage", e);
    }
    return { spouse: newSpousePayload, marriage: marriagePayload, marriageAction: "created" };

  } catch (err) {
    console.error("DBG:addSpouse -> Error:", err);
    onError?.(err.message || "Unexpected error.", "error");
    throw err;
  }
}




/**
 * Add a child under a marriage or single parent (with placeholder partner).
 */

export async function addChild(treeId, options) {
  const { marriageId, parentId, childData, motherId } = options;

  try {
    // -------------------------------------------------------
    // 1. Build child payload
    // -------------------------------------------------------
    const childId = generateId("person");
    const childPayload = {
      id: childId,
      treeId,
      name: childData.fullName,
      gender: childData.gender,
      dob: childData.dateOfBirth || null,
      isDeceased: childData.isDeceased || false,
      dod: childData.dateOfDeath || null,
      placeOfBirth: childData.placeOfBirth || childData.birthPlace || "",
      placeOfDeath: childData.placeOfDeath || childData.deathPlace || "",
      nationality: childData.nationality || "",
      countryOfResidence: childData.countryOfResidence || "",
      privacyLevel: childData.privacyLevel || "membersOnly",
      photoUrl: childData.profilePhoto || null,
      bio: childData.biography || "",
      tribe: childData.tribe || "",
      language: childData.language || "",
      isSpouse: false,
      isPlaceholder: false,
      allowGlobalMatching: childData.allowGlobalMatching || true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await dataService.addPerson(childPayload);

    // Create birth/death events for the newly created child if dates available
    try {
      if (childPayload.dob) {
        const evId = generateId('event');
        const ev = {
          id: evId,
          treeId,
          personIds: [childId],
          type: 'birth',
          title: 'Birth',
          date: childPayload.dob,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await dataService.addEvent(ev);
      }
      if (childPayload.dod) {
        const evId = generateId('event');
        const ev = {
          id: evId,
          treeId,
          personIds: [childId],
          type: 'death',
          title: 'Death',
          date: childPayload.dod,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await dataService.addEvent(ev);
      }
    } catch (e) {
      console.error('DBG:addChild -> failed to create birth/death events for child', e);
    }

    // If the form included an audio story or title, create a Story record
    try {
      if (childData && (childData.audioURL || childData.storyTitle)) {
        const storyId = generateId('story');
        const storyPayload = {
          storyId,
          treeId,
          personId: childId,
          title: childData.storyTitle || 'Oral History',
          type: 'audio',
          language: childData.language || null,
          text: null,
          audioUrl: childData.audioURL || null,
          addedBy: childData.addedBy || 'system',
          timestamp: new Date().toISOString(),
        };
        await dataService.addStory(storyPayload);
        // Expose for quick debugging during dev (guarded)
        if (typeof window !== 'undefined' && window) window.__LAST_ADDED_STORY__ = storyPayload;
      }
    } catch (err) {
      console.error('DBG:addChild -> failed to persist story:', err);
      // don't block child creation if story save fails
    }
    // If events were added in the form, persist them and attach the childId
    try {
      if (childData && Array.isArray(childData.events) && childData.events.length) {
        for (const ev of childData.events) {
          const eventPayload = {
            ...ev,
            id: ev.id || generateId('event'),
            treeId,
            personIds: ev.personIds && ev.personIds.length ? ev.personIds : [childId],
            createdAt: ev.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          try { await dataService.addEvent(eventPayload); } catch (e) { console.error('DBG:addChild -> failed to add event', e); }
        }
      }
    } catch (e) { console.error('DBG:addChild -> events persist error', e); }

    // -------------------------------------------------------
    // 2. If adding to an existing marriage
    // -------------------------------------------------------
    if (marriageId) {
      const marriage = await dataService.getMarriage(marriageId);
      if (!marriage) throw new Error("Marriage not found.");

      if (marriage.marriageType === "polygamous") {
        if (!motherId) {
          throw new Error("Polygamous marriage requires specifying the mother of the child.");
        }

        const wifeExists = marriage.wives.some((w) => w.wifeId === motherId);
        if (!wifeExists) {
          throw new Error("Selected mother does not belong to this marriage.");
        }

        await dataService.addChildToMarriage(marriageId, childId, motherId);
      } else if (marriage.marriageType === "monogamous") {
        await dataService.addChildToMarriage(marriageId, childId, null);
      } else {
        throw new Error(`Unsupported marriage type: ${marriage.marriageType}`);
      }

      return { child: childPayload, marriageId };
    }

    // -------------------------------------------------------
    // 3. If single parent (no marriage yet)
    // -------------------------------------------------------
    if (parentId) {
      const placeholderId = generateId("person");
      const newMarriageId = generateId("marriage");

      // Determine placeholder gender as the opposite of the known parent when possible
      const parentPerson = await dataService.getPerson(parentId);
      const placeholderGender = parentPerson && parentPerson.gender
        ? (parentPerson.gender === 'male' ? 'female' : 'male')
        : null;

      const placeholderPayload = {
        id: placeholderId,
        treeId,
        name: "Partner",
        gender: placeholderGender,
        isSpouse: true,         // placeholders act as spouses
        isPlaceholder: true,    // mark clearly
        allowGlobalMatching: false,   // placeholders should not allow global matching
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const marriagePayload = {
        id: newMarriageId,
        treeId,
        marriageType: "monogamous",
        spouses: [parentId, placeholderId],
        childrenIds: [childId],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await dataService.addPerson(placeholderPayload);
      await dataService.addMarriage(marriagePayload);

      // create marriage event for the single-parent placeholder marriage
      try {
        const evId = generateId('event');
        const ev = {
          id: evId,
          treeId,
          personIds: [parentId, placeholderId],
          type: 'marriage',
          title: 'Marriage (placeholder)',
          date: null,
          location: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await dataService.addEvent(ev);
      } catch (e) {
        console.error('DBG:addChild -> failed to create event for single-parent marriage', e);
      }

      return {
        child: childPayload,
        placeholder: placeholderPayload,
        marriage: marriagePayload,
      };
    }

    // -------------------------------------------------------
    // 4. If neither marriageId nor parentId provided
    // -------------------------------------------------------
    throw new Error("addChild requires either marriageId or parentId");
  } catch (err) {
    console.error("DBG:addChild -> Error:", err);
    throw err;
  }
}




/**
 * Add a parent to a single child (with placeholder partner).
 */
export async function addParent(treeId, childId, parentData) {
  try {
    const parentId = generateId("person");
    const marriageId = generateId("marriage");

    const parentPayload = {
      id: parentId,
      treeId,
      ...parentData,
      isSpouse: false,         // real directline parent
      isPlaceholder: false,    // actual person
      allowGlobalMatching: typeof parentData.allowGlobalMatching === 'boolean' ? parentData.allowGlobalMatching : true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const placeholderId = generateId("person");
    // Determine placeholder gender as opposite of the parent being added
    const placeholderGender = parentPayload.gender
      ? (parentPayload.gender === 'male' ? 'female' : 'male')
      : null;

    const placeholderPayload = {
      id: placeholderId,
      treeId,
      name: "Partner",
      gender: placeholderGender,
      isSpouse: true,          // partner role
      isPlaceholder: true,     // clearly fake
      allowGlobalMatching: false,    // never allow global matching
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const marriagePayload = {
      id: marriageId,
      treeId,
      marriageType: "monogamous",
      spouses: [parentId, placeholderId],
      childrenIds: [childId],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await dataService.addPerson(parentPayload);
    await dataService.addPerson(placeholderPayload);
    await dataService.addMarriage(marriagePayload);
    // Create birth/death events for the new parent if dates provided
    try {
      if (parentPayload.dob) {
        const evId = generateId('event');
        await dataService.addEvent({
          id: evId,
          treeId,
          personIds: [parentId],
          type: 'birth',
          title: 'Birth',
          date: parentPayload.dob,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
      if (parentPayload.dod) {
        const evId = generateId('event');
        await dataService.addEvent({
          id: evId,
          treeId,
          personIds: [parentId],
          type: 'death',
          title: 'Death',
          date: parentPayload.dod,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    } catch (e) {
      console.error('DBG:addParent -> failed to create birth/death events for parent', e);
    }

    // Create marriage event for the parent + placeholder
    try {
      const evId = generateId('event');
      await dataService.addEvent({
        id: evId,
        treeId,
        personIds: [parentId, placeholderId],
        type: 'marriage',
        title: 'Marriage (placeholder)',
        date: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } catch (e) {
      console.error('DBG:addParent -> failed to create marriage event for parent', e);
    }
    // Persist any events attached to the parent payload
    try {
      if (parentData && Array.isArray(parentData.events) && parentData.events.length) {
        for (const ev of parentData.events) {
          const eventPayload = {
            ...ev,
            id: ev.id || generateId('event'),
            treeId,
            personIds: ev.personIds && ev.personIds.length ? ev.personIds : [parentId],
            createdAt: ev.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          try { await dataService.addEvent(eventPayload); } catch (e) { console.error('DBG:addParent -> failed to add event', e); }
        }
      }
    } catch (e) { console.error('DBG:addParent -> events persist error', e); }

    return { parent: parentPayload, placeholder: placeholderPayload, marriage: marriagePayload };
  } catch (err) {
    console.error("Error adding parent:", err);
    throw err;
  }
}
