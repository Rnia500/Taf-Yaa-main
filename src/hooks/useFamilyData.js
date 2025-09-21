// src/hooks/useFamilyData.js
import { useEffect, useState, useCallback } from "react";

// Import your services
import { personServiceLocal } from "../services/data/personServiceLocal";
import { marriageServiceLocal } from "../services/data/marriageServiceLocal";
import { treeServiceLocal } from "../services/data/treeServiceLocal";
import { eventServiceLocal } from "../services/data/eventServiceLocal";
import { storyServiceLocal } from "../services/data/storyServiceLocal";

/**
 * useFamilyData
 * Centralized hook to load + manage all family-related data (people, marriages, trees, events, stories).
 */
export function useFamilyData(treeId) {
  const [people, setPeople] = useState([]);
  const [marriages, setMarriages] = useState([]);
  const [tree, setTree] = useState(null);
  const [events, setEvents] = useState([]);
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    console.log(`DBG:useFamilyData.reload -> Starting reload for treeId: ${treeId}`);
    setLoading(true);
    try {
      // 1. Load the tree
      const t = await treeServiceLocal.getTree(treeId);
      setTree(t);

      if (!t) {
        console.log(`DBG:useFamilyData.reload -> No tree found, clearing data`);
        setPeople([]);
        setMarriages([]);
        setEvents([]);
        setStories([]);
        setLoading(false);
        return;
      }

      // 2. Load people
      let p = await personServiceLocal.getPeopleByTreeId(treeId);
      console.log(`DBG:useFamilyData.reload -> Loaded ${p.length} people for tree ${treeId}:`, p.map(person => ({
        id: person.id,
        name: person.name,
        isPlaceholder: person.isPlaceholder,
        isDeleted: person.isDeleted,
        deletionMode: person.deletionMode,
        pendingDeletion: person.pendingDeletion
      })));

      // 3. Load marriages
      const m = await marriageServiceLocal.getAllMarriages();
      const personIds = new Set(p.map(per => per.id));
      const mFiltered = m.filter(marr => {
        if (marr.marriageType === "monogamous") {
          // Include marriage if any spouse is in personIds OR if any child is in personIds
          const hasSpouseInPersonIds = marr.spouses?.some(id => personIds.has(id));
          const hasChildInPersonIds = marr.childrenIds?.some(id => personIds.has(id));
          return hasSpouseInPersonIds || hasChildInPersonIds;
        }
        if (marr.marriageType === "polygamous") {
          // Include marriage if husband is in personIds OR any wife is in personIds OR any child is in personIds
          const hasHusbandInPersonIds = personIds.has(marr.husbandId);
          const hasWifeInPersonIds = (marr.wives || []).some(w => personIds.has(w.wifeId));
          const hasChildInPersonIds = (marr.wives || []).some(w => 
            w.childrenIds?.some(id => personIds.has(id))
          );
          return hasHusbandInPersonIds || hasWifeInPersonIds || hasChildInPersonIds;
        }
        return false;
      });

      // --- PATCH: enforce root + spouse variants ---
      if (t.currentRootId) {
        const rootId = t.currentRootId;

        // find root person
        const rootPerson = p.find(per => per.id === rootId);

        if (rootPerson) {
          // mark root explicitly
          rootPerson.variant = "root";

          // find marriages where root is a spouse
          const rootMarriages = mFiltered.filter(marr =>
            marr.spouses?.includes(rootId) ||
            marr.husbandId === rootId ||
            (marr.wives || []).some(w => w.wifeId === rootId)
          );

          // for each spouse, if they were "root", downgrade them to "spouse"
          rootMarriages.forEach(marr => {
            const spouseIds = marr.spouses?.filter(id => id !== rootId) ||
              (marr.husbandId === rootId
                ? (marr.wives || []).map(w => w.wifeId)
                : [marr.husbandId]);

            spouseIds.forEach(sid => {
              const spouse = p.find(per => per.id === sid);
              if (spouse && spouse.variant === "root") {
                spouse.variant = "spouse";
              }
            });
          });
        }
      }

      setPeople(p);
      setMarriages(mFiltered);

      // 4. Load events
      const evts = await eventServiceLocal.getAllEvents();
      const evtsFiltered = evts.filter(e =>
        e.personIds?.some(pid => personIds.has(pid))
      );
      setEvents(evtsFiltered);

      // 5. Load stories
      const sts = await storyServiceLocal.getAllStories();
      const stsFiltered = sts.filter(
        s =>
          personIds.has(s.personId) ||
          (s.personIds || []).some(pid => personIds.has(pid))
      );
      setStories(stsFiltered);

      console.log(
        `DBG:useFamilyData.reload -> loaded people:${p.length}, marriages:${mFiltered.length}, events:${evtsFiltered.length}, stories:${stsFiltered.length}`
      );
    } catch (err) {
      console.error("useFamilyData.reload -> error:", err);
    } finally {
      setLoading(false);
    }
  }, [treeId]);

  useEffect(() => {
    if (!treeId) {
      setPeople([]);
      setMarriages([]);
      setTree(null);
      setEvents([]);
      setStories([]);
      setLoading(false);
      return;
    }
    reload();
  }, [treeId, reload]);

  // Listen for purge events to reload data when soft deletions expire
  useEffect(() => {
    const handlePurgeEvent = (event) => {
      if (event.detail?.action === 'purge_expired_soft_deletions') {
        console.log('useFamilyData: Received purge event, reloading data');
        reload();
      }
    };

    window.addEventListener('familyTreeDataUpdated', handlePurgeEvent);
    return () => window.removeEventListener('familyTreeDataUpdated', handlePurgeEvent);
  }, [reload]);

  return {
    tree,
    people,
    marriages,
    events,
    stories,
    loading,
    reload,
  };
}
