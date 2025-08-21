import { layoutVertical } from "./layoutVertical";
import { layoutHorizontal } from "./layoutHorizontal";
import {
  VERTICAL_NODE_WIDTH,
  VERTICAL_NODE_HEIGHT,
  HORIZONTAL_NODE_WIDTH,
  HORIZONTAL_NODE_HEIGHT,
} from "./treeLayoutConstants";



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
  const visiblePeopleIds = new Set();
  const queue = [rootId];

  while (queue.length > 0) {
    const currentPersonId = queue.shift();
    if (visiblePeopleIds.has(currentPersonId)) continue;
    visiblePeopleIds.add(currentPersonId);

    const personMarriages = allMarriages.filter(m =>
      (m.marriageType === 'monogamous' && m.spouses.includes(currentPersonId)) ||
      (m.marriageType === 'polygamous' && m.husbandId === currentPersonId)
    );

    for (const marriage of personMarriages) {
        // Also add the other spouse(s) to the visible set immediately
        if (marriage.marriageType === 'monogamous') {
            marriage.spouses.forEach(id => visiblePeopleIds.add(id));
        } else { //polygamous
            marriage.wives.forEach(w => visiblePeopleIds.add(w.wifeId));
        }

        const children = marriage.marriageType === 'monogamous'
            ? marriage.childrenIds
            : marriage.wives.flatMap(w => w.childrenIds);
        children.forEach(childId => queue.push(childId));
    }
  }
  
  // This second loop is no longer strictly necessary, but we leave it for safety.
  // The logic inside the while loop now handles this.
  allMarriages.forEach(m => {
    if (m.marriageType === 'monogamous') {
      const [p1, p2] = m.spouses;
      if (visiblePeopleIds.has(p1) || visiblePeopleIds.has(p2)) {
        visiblePeopleIds.add(p1); visiblePeopleIds.add(p2);
      }
    } else if (m.marriageType === 'polygamous') {
      if (visiblePeopleIds.has(m.husbandId)) {
        m.wives.forEach(w => visiblePeopleIds.add(w.wifeId));
      }
    }
  });

  const visiblePeople = allPeople.filter(p => visiblePeopleIds.has(p.id));
  const visibleMarriages = allMarriages.filter(m => {
    if (m.marriageType === 'monogamous') return m.spouses.every(id => visiblePeopleIds.has(id));
    if (m.marriageType === 'polygamous') return visiblePeopleIds.has(m.husbandId);
    return false;
  });

  return { people: visiblePeople, marriages: visibleMarriages };
}

function formatPersonData(person, marriages, handleToggleCollapse, handleOpenProfile) {
  if (!person) return {};
  const hasChildren = marriages.some(m =>
    (m.marriageType === "monogamous" &&
      m.spouses.includes(person.id) &&
      m.childrenIds.length > 0) ||
    (m.marriageType === "polygamous" &&
      ((m.husbandId === person.id && m.wives.some(w => w.childrenIds.length > 0)) ||
        m.wives.some(w => w.wifeId === person.id && w.childrenIds.length > 0)))
  );
  return {
    id: person.id,
    name: person.name,
    profileImage: person.photoUrl,
    sex: person.gender === "male" ? "M" : "F",
    birthDate: person.dob,
    deathDate: person.dod,
    role: person.role || "viewer",
    isCollapsed: person.isCollapsed,
    hasChildren,
    onToggleCollapse: () => handleToggleCollapse(person.id),
    onOpenProfile: () => handleOpenProfile(person.id),
  };
}

function getDescendantIds(personId, marriages) {
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

export function calculateLayout(
  rootId,
  people,
  marriages,
  handleToggleCollapse,
  handleOpenProfile,
  orientation = "vertical"
) {
  
  const { people: visiblePeople, marriages: visibleMarriages } = filterFamilyByRoot(rootId, people, marriages);

  const isVertical = orientation === "vertical";
  const NODE_WIDTH = isVertical ? VERTICAL_NODE_WIDTH : HORIZONTAL_NODE_WIDTH;
  const NODE_HEIGHT = isVertical ? VERTICAL_NODE_HEIGHT : HORIZONTAL_NODE_HEIGHT;

  const edges = [];
  const nodesMap = new Map();

  // Step 1: Collapse logic - Now runs on the CLEANED data
  const collapsedDescendantIds = new Set();
  visiblePeople.forEach(person => {
    if (person.isCollapsed) {
      getDescendantIds(person.id, visibleMarriages).forEach(id => collapsedDescendantIds.add(id));
    }
  });
  visibleMarriages.forEach(marriage => {
    if (marriage.marriageType === "monogamous") {
      const [p1, p2] = marriage.spouses;
      if (collapsedDescendantIds.has(p1)) collapsedDescendantIds.add(p2);
      if (collapsedDescendantIds.has(p2)) collapsedDescendantIds.add(p1);
    }
  });

  // Step 2: Build person nodes map - Now runs on the CLEANED data
  const personNodeType = isVertical ? "person" : "personHorizontal";
  visiblePeople.forEach(person => {
    if (!collapsedDescendantIds.has(person.id)) {
      nodesMap.set(person.id, {
        id: person.id,
        type: personNodeType,
        data: formatPersonData(person, visibleMarriages, handleToggleCollapse, handleOpenProfile),
        position: { x: 0, y: 0 },
        isPositioned: false,
      });
    }
  });

  // Step 3: Generational Sorting - Now runs on the CLEANED, fully connected data
  // (The simple child-based BFS is now sufficient and robust)
  const getMarriagesByGeneration = () => {
      const sortedMarriages = [];
      const queue = [rootId];
      const visitedPeople = new Set([rootId]);
      const visitedMarriages = new Set();
      while (queue.length > 0) {
          const currentPersonId = queue.shift();
          const personMarriages = visibleMarriages.filter(m => {
              if (visitedMarriages.has(m.id)) return false;
              if (m.marriageType === 'monogamous') return m.spouses.includes(currentPersonId);
              if (m.marriageType === 'polygamous') return m.husbandId === currentPersonId || m.wives.some(w=>w.wifeId === currentPersonId);
              return false;
          });
          for (const marriage of personMarriages) {
              visitedMarriages.add(marriage.id);
              sortedMarriages.push(marriage);
              let children = [];
              if (marriage.marriageType === 'monogamous') children = marriage.childrenIds || [];
              else children = (marriage.wives || []).flatMap(w => w.childrenIds || []);
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

  // Step 4: Delegate to layout engines
  return isVertical
    ? layoutVertical(nodesMap, sortedMarriages, edges, NODE_WIDTH, NODE_HEIGHT)
    : layoutHorizontal(nodesMap, sortedMarriages, edges, NODE_WIDTH, NODE_HEIGHT);
}