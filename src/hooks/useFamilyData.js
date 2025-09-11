// src/hooks/useFamilyData.js
import { useEffect, useState, useCallback } from "react";
import { getDB } from "../services/data/localDB";

// Local dummy data (used only when USE_LOCAL = true)
import { people as dummyPeople, marriages as dummyMarriages } from "../data/dummyData.js";

const STORAGE_KEY = "familyDB";
const USE_LOCAL = true;

/**
 * Hook to load people + marriages scoped to a specific treeId.
 */
export function useFamilyData(treeId) {
  const [people, setPeople] = useState([]);
  const [marriages, setMarriages] = useState([]);
  const [rootPersonId, setRootPersonId] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadLocal = useCallback(() => {
    console.log("DBG:useFamilyData.loadLocal -> start", { treeId });

    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);

        
        const tree = (parsed.trees || []).find((t) => t.id === treeId);

        if (!tree) {
          console.warn("DBG:useFamilyData.loadLocal -> tree not found in localDB:", treeId);
          setPeople([]);
          setMarriages([]);
          setRootPersonId(null);
          setLoading(false);
          return;
        }

        const scopedPeople = (parsed.people || []).filter((p) => p.treeId === treeId);
        const scopedMarriages = (parsed.marriages || []).filter((m) => m.treeId === treeId);

        console.log(
          "DBG:useFamilyData.loadLocal -> loaded scoped counts:",
          scopedPeople.length,
          scopedMarriages.length
        );

        setPeople(scopedPeople);
        setMarriages(scopedMarriages);
        setRootPersonId(tree.currentRootId || null);
        setLoading(false);
        return;
      } catch (err) {
        console.error("DBG:useFamilyData.loadLocal -> Failed to parse local DB:", err);
      }
    }

    // --- Fallback: dummy data (scoped by treeId if needed) ---
    console.log("DBG:useFamilyData.loadLocal -> fallback to dummy data");
    setPeople(dummyPeople.filter((p) => p.treeId === treeId));
    setMarriages(dummyMarriages.filter((m) => m.treeId === treeId));
    setRootPersonId(null);
    setLoading(false);
  }, [treeId]);

  useEffect(() => {
    if (USE_LOCAL) {
      window.addEventListener("familyDataChanged", loadLocal);
      loadLocal();
      return () => window.removeEventListener("familyDataChanged", loadLocal);
    }
  }, [treeId, loadLocal]);

  return {
    people,
    marriages,
    rootPersonId,
    loading,
    reload: loadLocal,
  };
}
