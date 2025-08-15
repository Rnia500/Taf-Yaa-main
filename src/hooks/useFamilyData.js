// src/hooks/useFamilyData.js

// ✨ STEP 1: Import useMemo from React
import { useMemo } from 'react';
import { people as allPeople, marriages as allMarriages } from '../data/dummyData';

export function useFamilyData(treeId) {
  // ✨ STEP 2: Wrap the filtering logic in useMemo.
  // This ensures that the `people` array is only re-calculated if `treeId` changes.
  const people = useMemo(
    () => allPeople.filter(p => p.treeId === treeId),
    [treeId]
  );

  // Do the same for the `marriages` array.
  const marriages = useMemo(
    () => allMarriages.filter(m => m.treeId === treeId),
    [treeId]
  );

  // ✨ STEP 3: Memoize the final returned object as well for ultimate stability.
  return useMemo(
    () => ({ people, marriages, loading: false }),
    [people, marriages]
  );
}