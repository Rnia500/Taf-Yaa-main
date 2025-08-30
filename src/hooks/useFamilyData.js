// src/hooks/useFamilyData.js
import { useEffect, useState, useCallback } from "react";

// Local dummy data (used only when USE_LOCAL = true)
import { people as dummyPeople, marriages as dummyMarriages } from "../data/dummyData.js";

const STORAGE_KEY = "familyDB";
const USE_LOCAL = true;

export function useFamilyData(treeId) {
  const [people, setPeople] = useState([]);
  const [marriages, setMarriages] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadLocal = useCallback(() => {
    console.log("DBG:useFamilyData.loadLocal -> start");
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        console.log("DBG:useFamilyData.loadLocal -> loaded parsed saved DB counts:", (parsed.people || []).length, (parsed.marriages || []).length);
        setPeople(parsed.people || []);
        setMarriages(parsed.marriages || []);
        setLoading(false);
        return;
      } catch (err) {
        console.error("DBG:useFamilyData.loadLocal -> Failed to parse local DB:", err);
      }
    }
    console.log("DBG:useFamilyData.loadLocal -> fallback to dummy data");
    setPeople(dummyPeople);
    setMarriages(dummyMarriages);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (USE_LOCAL) {
      window.addEventListener('familyDataChanged', loadLocal);
      loadLocal();
      return () => window.removeEventListener('familyDataChanged', loadLocal);
    }

    // Firebase mode (real-time listeners)
    /*
    const peopleQuery = query(collection(db, "people"));
    const marriagesQuery = query(collection(db, "marriages"));

    const unsubPeople = onSnapshot(peopleQuery, (snapshot) => {
      const docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setPeople(docs);
    });

    const unsubMarriages = onSnapshot(marriagesQuery, (snapshot) => {
      const docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMarriages(docs);
    });

    setLoading(false);

    return () => {
      unsubPeople();
      unsubMarriages();
    };
    */
  }, [treeId, loadLocal]);

  return {
    people,
    marriages,
    loading,
    reload: loadLocal, 
  };
}
