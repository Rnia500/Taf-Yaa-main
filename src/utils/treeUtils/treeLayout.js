import { layoutVertical } from "./layoutVertical";
import { layoutHorizontal } from "./layoutHorizontal";
import {
  VERTICAL_NODE_WIDTH,
  VERTICAL_NODE_HEIGHT,
  HORIZONTAL_NODE_WIDTH,
  HORIZONTAL_NODE_HEIGHT,
} from "./treeLayoutConstants";

// Re-export constants for use in other modules
export {
  VERTICAL_NODE_WIDTH,
  VERTICAL_NODE_HEIGHT,
  HORIZONTAL_NODE_WIDTH,
  HORIZONTAL_NODE_HEIGHT,
} from "./treeLayoutConstants";

// Re-export layout functions
export { layoutVertical } from "./layoutVertical";
export { layoutHorizontal } from "./layoutHorizontal";



export function traceLineage(personId, people, marriages) {
  const highlightedNodesSet = new Set();
  const highlightedEdgesSet = new Set();
  const visited = new Set();

  function addNode(id) {
    if (!id) return;
    highlightedNodesSet.add(id);
  }

  function addEdgeId(id) {
    if (!id) return;
    highlightedEdgesSet.add(id);
  }

  function findAncestors(currentPersonId) {
    if (!currentPersonId || visited.has(currentPersonId)) return;
    visited.add(currentPersonId);

    const parentMarriage = marriages.find(
      m =>
        (m.marriageType === 'monogamous' && m.childrenIds.includes(currentPersonId)) ||
        (m.marriageType === 'polygamous' && m.wives.some(w => w.childrenIds.includes(currentPersonId)))
    );
    if (!parentMarriage) return;

    if (parentMarriage.marriageType === 'monogamous') {
      const [p1, p2] = parentMarriage.spouses;
      const marriageNodeId = `marriage-${parentMarriage.id}`;

      addNode(p1);
      addNode(p2);
      addNode(marriageNodeId);

      addEdgeId(`edge-${p1}-${marriageNodeId}`);
      addEdgeId(`edge-${p2}-${marriageNodeId}`);
      addEdgeId(`edge-${marriageNodeId}-${currentPersonId}`);

      findAncestors(p1);
      findAncestors(p2);
    } else if (parentMarriage.marriageType === 'polygamous') {
      const husbandId = parentMarriage.husbandId;
      const wifeData = parentMarriage.wives.find(w => w.childrenIds.includes(currentPersonId));
      if (wifeData) {
        const wifeId = wifeData.wifeId;

        addNode(husbandId);
        addNode(wifeId);

        addEdgeId(`edge-${husbandId}-${wifeId}`);
        addEdgeId(`edge-${wifeId}-${currentPersonId}`);

        findAncestors(husbandId);
        findAncestors(wifeId);
      }
    }
  }

  addNode(personId);
  findAncestors(personId);

  return { nodes: Array.from(highlightedNodesSet), edges: Array.from(highlightedEdgesSet) };
}

export function filterFamilyByRoot(rootId, allPeople, allMarriages) {
  console.log(`DBG:filterFamilyByRoot -> Starting with rootId: ${rootId}`);
  console.log(`DBG:filterFamilyByRoot -> Input people:`, allPeople.map(p => ({
    id: p.id,
    name: p.name,
    isPlaceholder: p.isPlaceholder,
    isDeleted: p.isDeleted,
    deletionMode: p.deletionMode,
    pendingDeletion: p.pendingDeletion
  })));
  console.log(`DBG:filterFamilyByRoot -> Input marriages:`, allMarriages.map(m => ({
    id: m.id,
    marriageType: m.marriageType,
    spouses: m.spouses,
    husbandId: m.husbandId,
    wives: m.wives?.map(w => ({ wifeId: w.wifeId, childrenIds: w.childrenIds })),
    childrenIds: m.childrenIds
  })));
  
  if (!rootId) {
    throw new Error("filterFamilyByRoot: rootId is required");
  }
  if (!Array.isArray(allPeople)) {
    throw new Error("filterFamilyByRoot: allPeople must be an array");
  }
  if (!Array.isArray(allMarriages)) {
    throw new Error("filterFamilyByRoot: allMarriages must be an array");
  }

  const visiblePeopleIds = new Set();
  const queue = [rootId];

  while (queue.length > 0) {
    const currentPersonId = queue.shift();
    if (visiblePeopleIds.has(currentPersonId)) continue;
    visiblePeopleIds.add(currentPersonId);

    const personMarriages = allMarriages.filter(m =>
      (m.marriageType === "monogamous" && m.spouses.includes(currentPersonId)) ||
      (m.marriageType === "polygamous" && m.husbandId === currentPersonId)
    );

    for (const marriage of personMarriages) {
      if (marriage.marriageType === "monogamous") {
        marriage.spouses.forEach(id => visiblePeopleIds.add(id));
      } else {
        marriage.wives.forEach(w => visiblePeopleIds.add(w.wifeId));
      }

      const children = marriage.marriageType === "monogamous"
        ? marriage.childrenIds
        : marriage.wives.flatMap(w => w.childrenIds);

      children.forEach(childId => queue.push(childId));
    }
  }

  // First, include all people that were found through traversal
  let visiblePeople = allPeople.filter(p => visiblePeopleIds.has(p.id));
  
  // Additionally, include any soft deleted placeholders that are referenced in marriages
  // but might not have been reached through traversal
  const placeholderIds = new Set();
  allMarriages.forEach(m => {
    if (m.marriageType === "monogamous") {
      m.spouses?.forEach(id => {
        if (id && !visiblePeopleIds.has(id)) {
          const person = allPeople.find(p => p.id === id);
          if (person && person.isPlaceholder) {
            placeholderIds.add(id);
          }
        }
      });
      m.childrenIds?.forEach(id => {
        if (id && !visiblePeopleIds.has(id)) {
          const person = allPeople.find(p => p.id === id);
          if (person && person.isPlaceholder) {
            placeholderIds.add(id);
          }
        }
      });
    } else if (m.marriageType === "polygamous") {
      if (m.husbandId && !visiblePeopleIds.has(m.husbandId)) {
        const person = allPeople.find(p => p.id === m.husbandId);
        if (person && person.isPlaceholder) {
          placeholderIds.add(m.husbandId);
        }
      }
      m.wives?.forEach(w => {
        if (w.wifeId && !visiblePeopleIds.has(w.wifeId)) {
          const person = allPeople.find(p => p.id === w.wifeId);
          if (person && person.isPlaceholder) {
            placeholderIds.add(w.wifeId);
          }
        }
        w.childrenIds?.forEach(id => {
          if (id && !visiblePeopleIds.has(id)) {
            const person = allPeople.find(p => p.id === id);
            if (person && person.isPlaceholder) {
              placeholderIds.add(id);
            }
          }
        });
      });
    }
  });
  
  // Add placeholder IDs to visible people IDs
  placeholderIds.forEach(id => visiblePeopleIds.add(id));
  
  // Now filter people again to include placeholders
  visiblePeople = allPeople.filter(p => visiblePeopleIds.has(p.id));
  
  const visibleMarriages = allMarriages.filter(m => {
    if (m.marriageType === "monogamous") {
      if (m.spouses.some(id => !id)) return false;
      // Include marriage if any spouse is visible (including placeholders)
      return m.spouses.some(id => visiblePeopleIds.has(id));
    }
    if (m.marriageType === "polygamous") {
      // Include marriage if husband is visible OR any wife is visible (including placeholders)
      return visiblePeopleIds.has(m.husbandId) || 
             (m.wives || []).some(w => visiblePeopleIds.has(w.wifeId));
    }
    return false;
  });

  console.log(`DBG:filterFamilyByRoot -> Final visible people:`, visiblePeople.map(p => ({
    id: p.id,
    name: p.name,
    isPlaceholder: p.isPlaceholder,
    isDeleted: p.isDeleted,
    deletionMode: p.deletionMode,
    pendingDeletion: p.pendingDeletion
  })));
  console.log(`DBG:filterFamilyByRoot -> Final visible marriages:`, visibleMarriages.map(m => ({
    id: m.id,
    marriageType: m.marriageType,
    spouses: m.spouses,
    husbandId: m.husbandId,
    wives: m.wives?.map(w => ({ wifeId: w.wifeId, childrenIds: w.childrenIds })),
    childrenIds: m.childrenIds
  })));
  
  return { people: visiblePeople, marriages: visibleMarriages };
}
export function formatPersonData(person, marriages, handleToggleCollapse, handleOpenProfile, variant = "directline") {
  if (!person) return {};
  const hasChildren = marriages.some(m =>
    (m.marriageType === "monogamous" &&
      m.spouses?.includes(person.id) &&
      (m.childrenIds?.length ?? 0) > 0) ||  

    (m.marriageType === "polygamous" &&
      (
        (m.husbandId === person.id && m.wives?.some(w => (w.childrenIds?.length ?? 0) > 0)) ||
        m.wives?.some(w => w.wifeId === person.id && (w.childrenIds?.length ?? 0) > 0)
      )
    )
  );
  
  // Debug logging for all soft deleted persons
  if (person.isPlaceholder && person.pendingDeletion && person.deletionMode === 'soft') {
    console.log('DBG:formatPersonData for soft deleted person:', {
      id: person.id,
      name: person.name,
      isPlaceholder: person.isPlaceholder,
      deletionMode: person.deletionMode,
      pendingDeletion: person.pendingDeletion,
      isSoftDeleted: person.deletionMode === "soft" && person.pendingDeletion
    });
  }
  
  return {
    id: person.id,
    name: person.name,
    profileImage: person.photoUrl,
    sex: person.gender === "male" ? "M" : "F",
    birthDate: person.dob,
    deathDate: person.dod,
    isDead: person.dod ? true : false,
    role: person.role,
    isCollapsed: person.isCollapsed,
    hasChildren,
    isPlaceholder: person.isPlaceholder || false,
    isSoftDeleted: person.deletionMode === "soft" && person.pendingDeletion || false,
    undoExpiresAt: person.undoExpiresAt || null,
    onToggleCollapse: () => handleToggleCollapse(person.id),
    onOpenProfile: () => handleOpenProfile(person.id),
    variant,
  };
}

export function getDescendantIds(personId, marriages) {
  const descendants = new Set();
  const visitedMarriages = new Set();

  function findDescendants(currentPersonId) {
    for (const marriage of marriages) {
      let childrenInMarriage = [];
      let isParentInMarriage = false;

      if (marriage.marriageType === "monogamous" && marriage.spouses.includes(currentPersonId)) {
        isParentInMarriage = true;
        childrenInMarriage = marriage.childrenIds;
      } else if (marriage.marriageType === "polygamous") {
        if (marriage.husbandId === currentPersonId) {
          isParentInMarriage = true;
          childrenInMarriage = marriage.wives.flatMap(w => w.childrenIds);
        } else {
          const wifeData = marriage.wives.find(w => w.wifeId === currentPersonId);
          if (wifeData) {
            isParentInMarriage = true;
            childrenInMarriage = wifeData.childrenIds;
          }
        }
      }

      if (isParentInMarriage && !visitedMarriages.has(marriage.id)) {
        visitedMarriages.add(marriage.id);
        for (const childId of childrenInMarriage) {
          if (!descendants.has(childId)) {
            descendants.add(childId);
            findDescendants(childId);
          }
        }
      }
    }
  }

  findDescendants(personId);
  return Array.from(descendants);
}

export function findHighestAncestor(startPersonId, allPeople, allMarriages) {
  let currentPersonId = startPersonId;
  let highestAncestorId = startPersonId;
  const visited = new Set(); 
  
  while (currentPersonId && !visited.has(currentPersonId)) {
    visited.add(currentPersonId);
    
   
    const parentMarriage = allMarriages.find(m => 
      (m.childrenIds?.includes(currentPersonId)) || 
      (m.marriageType === 'polygamous' && m.wives.some(w => w.childrenIds?.includes(currentPersonId)))
    );

    if (parentMarriage) {
     
      const newParentId = parentMarriage.husbandId || parentMarriage.spouses?.[0];
      if (newParentId) {
        currentPersonId = newParentId;
        highestAncestorId = newParentId;
      } else {
        
        break;
      }
    } else {
      
      break;
    }
  }

  console.log(`findHighestAncestor: starting from ${startPersonId}, found true root: ${highestAncestorId}`);
  return highestAncestorId;
}

export function calculateLayout(
  rootId,
  people,
  marriages,
  handleToggleCollapse,
  handleOpenProfile,
  orientation = "vertical"
) {
  if (!rootId) {
    throw new Error("calculateLayout: rootId is required");
  }
  if (!Array.isArray(people)) {
    throw new Error("calculateLayout: people must be an array");
  }
  if (!Array.isArray(marriages)) {
    throw new Error("calculateLayout: marriages must be an array");
  }
  if (typeof handleToggleCollapse !== "function") {
    throw new Error("calculateLayout: handleToggleCollapse must be a function");
  }
  if (typeof handleOpenProfile !== "function") {
    throw new Error("calculateLayout: handleOpenProfile must be a function");
  }

  // // Filter family members relevant to the chosen root
  // const { people: visiblePeople, marriages: visibleMarriages } =
  //   filterFamilyByRoot(rootId, people, marriages);

  const visiblePeople = people;
  const visibleMarriages = marriages;

  const isVertical = orientation === "vertical";
  const NODE_WIDTH = isVertical ? VERTICAL_NODE_WIDTH : HORIZONTAL_NODE_WIDTH;
  const NODE_HEIGHT = isVertical ? VERTICAL_NODE_HEIGHT : HORIZONTAL_NODE_HEIGHT;

  const edges = [];
  const nodesMap = new Map();

  // Track collapsed descendants (to skip them)
  const collapsedDescendantIds = new Set();
  visiblePeople.forEach((person) => {
    if (person.isCollapsed) {
      getDescendantIds(person.id, visibleMarriages).forEach((id) =>
        collapsedDescendantIds.add(id)
      );
    }
  });

// Ensure spouse/wives of collapsed person are also collapsed
visibleMarriages.forEach((marriage) => {
  if (marriage.marriageType === "monogamous") {
    const [p1, p2] = marriage.spouses;
    if (collapsedDescendantIds.has(p1)) collapsedDescendantIds.add(p2);
    if (collapsedDescendantIds.has(p2)) collapsedDescendantIds.add(p1);
  } else if (marriage.marriageType === "polygamous") {
    const { husbandId, wives } = marriage;
    if (collapsedDescendantIds.has(husbandId)) {
      wives.forEach((w) => collapsedDescendantIds.add(w.wifeId));
    }
    wives.forEach((w) => {
      if (collapsedDescendantIds.has(w.wifeId)) {
        collapsedDescendantIds.add(husbandId);
        wives.forEach((other) => collapsedDescendantIds.add(other.wifeId));
      }
    });
  }
});


  // Build person nodes map (without assigning variant!)
  const personNodeType = isVertical ? "person" : "personHorizontal";
  console.log(`DBG:calculateLayout -> Creating nodes for ${visiblePeople.length} visible people`);
  visiblePeople.forEach((person) => {
    if (!collapsedDescendantIds.has(person.id)) {
      const nodeData = formatPersonData(
        person,
        visibleMarriages,
        handleToggleCollapse,
        handleOpenProfile
        // 🚫 variant removed — layout will assign later
      );
      console.log(`DBG:calculateLayout -> Creating node for person ${person.id}:`, {
        id: person.id,
        name: person.name,
        isPlaceholder: person.isPlaceholder,
        isSoftDeleted: nodeData.isSoftDeleted,
        variant: nodeData.variant
      });
      nodesMap.set(person.id, {
        id: person.id,
        type: personNodeType,
        data: nodeData,
        position: { x: 0, y: 0 },
        isPositioned: false,
      });
    } else {
      console.log(`DBG:calculateLayout -> Skipping collapsed person ${person.id}`);
    }
  });

  // Helper: sort marriages by traversal
  const getMarriagesByGeneration = () => {
    const sortedMarriages = [];
    const queue = [rootId];
    const visitedPeople = new Set([rootId]);
    const visitedMarriages = new Set();

    while (queue.length > 0) {
      const currentPersonId = queue.shift();

      const personMarriages = visibleMarriages.filter((m) => {
        if (visitedMarriages.has(m.id)) return false;
        if (m.marriageType === "monogamous")
          return m.spouses.includes(currentPersonId);
        if (m.marriageType === "polygamous")
          return (
            m.husbandId === currentPersonId ||
            m.wives.some((w) => w.wifeId === currentPersonId)
          );
        return false;
      });

      for (const marriage of personMarriages) {
        visitedMarriages.add(marriage.id);
        sortedMarriages.push(marriage);

        let children = [];
        if (marriage.marriageType === "monogamous")
          children = marriage.childrenIds || [];
        else children = (marriage.wives || []).flatMap((w) => w.childrenIds || []);

        for (const childId of children) {
          if (childId && !visitedPeople.has(childId)) {
            visitedPeople.add(childId);
            if (nodesMap.has(childId)) queue.push(childId);
          }
        }
      }
    }
    return sortedMarriages;
  };

  const sortedMarriages = getMarriagesByGeneration();

  // Delegate to orientation-specific layout (they set variants + positions)
  return isVertical
    ? layoutVertical(nodesMap, sortedMarriages, edges, rootId)
    : layoutHorizontal(nodesMap, sortedMarriages, edges, rootId);
}
