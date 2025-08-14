// src/utils/treeLayout.js

const NODE_WIDTH = 200;
const NODE_HEIGHT = 100;
const HORIZONTAL_SPACING = 50;
const VERTICAL_SPACING = 120;

// ✨ NEW HELPER FUNCTION: To create the final data object for the PersonCard
function formatPersonData(person) {
  if (!person) return {};
  
  return {
    // --- Transformations ---
    // name: person.name,
    name: person.id,
    profileImage: person.photoUrl, // Rename photoUrl to profileImage
    sex: person.gender === 'male' ? 'M' : 'F', // Convert gender to sex
    birthDate: person.dob, // Rename dob to birthDate
    deathDate: person.dod, // Rename dod to deathDate
    role: person.role || 'viewer', // Pass role, default to 'viewer'
  };
}


export function calculateLayout(people, marriages) {
  const nodes = [];
  const edges = [];
  const peopleMap = new Map(people.map(p => [p.id, p]));
  let currentY = 0;

  for (const marriage of marriages) {
    if (marriage.marriageType === 'polygamous') {
      const { husbandId, wives } = marriage;
      const husbandData = peopleMap.get(husbandId);
      const husbandNode = nodes.find(n => n.id === husbandId);
      
      const husbandX = husbandNode ? husbandNode.position.x : 0;
      const husbandY = husbandNode ? husbandNode.position.y : currentY;

      if (!husbandNode) {
        nodes.push({
          id: husbandId,
          type: 'person',
          position: { x: husbandX, y: husbandY },
          // ✨ USE THE FORMATTER and SET THE VARIANT
          data: { ...formatPersonData(husbandData), variant: 'root' }, // Assuming first husband is a root
        });
      }

      let wifeXOffset = husbandX + NODE_WIDTH + HORIZONTAL_SPACING;
      for (const wife of wives) {
        const wifeData = peopleMap.get(wife.wifeId);
        nodes.push({
          id: wife.wifeId,
          type: 'person',
          position: { x: wifeXOffset, y: husbandY },
          // ✨ USE THE FORMATTER and SET THE VARIANT
          data: { ...formatPersonData(wifeData), variant: 'spouce' },
        });

        edges.push({ id: `edge-${husbandId}-${wife.wifeId}`, source: husbandId, target: wife.wifeId, type: 'polygamousEdge' });

        let childXOffset = wifeXOffset;
        for (const childId of wife.childrenIds) {
          const childData = peopleMap.get(childId);
          nodes.push({
            id: childId,
            type: 'person',
            position: { x: childXOffset, y: husbandY + NODE_HEIGHT + VERTICAL_SPACING },
            // ✨ USE THE FORMATTER and SET THE VARIANT
            data: { ...formatPersonData(childData), variant: 'directline' },
          });
          edges.push({ id: `edge-${wife.wifeId}-${childId}`, source: wife.wifeId, target: childId });
          childXOffset += NODE_WIDTH + HORIZONTAL_SPACING;
        }
        wifeXOffset += NODE_WIDTH + HORIZONTAL_SPACING;
      }
      currentY = husbandY + (NODE_HEIGHT + VERTICAL_SPACING) * 2;
    }
    
    if (marriage.marriageType === 'monogamous') {
      const [spouse1Id, spouse2Id] = marriage.spouses;
      const spouse1Data = peopleMap.get(spouse1Id);
      const spouse2Data = peopleMap.get(spouse2Id);
      
      const spouse1Node = nodes.find(n => n.id === spouse1Id);
      const startX = spouse1Node ? spouse1Node.position.x : 0;
      const startY = spouse1Node ? spouse1Node.position.y : currentY;

      if (!spouse1Node) {
        nodes.push({
          id: spouse1Id, type: 'person', position: { x: startX, y: startY },
          // ✨ USE THE FORMATTER and SET THE VARIANT
          data: { ...formatPersonData(spouse1Data), variant: 'directline' },
        });
      }
      
      nodes.push({
        id: spouse2Id, type: 'person', position: { x: startX + NODE_WIDTH + HORIZONTAL_SPACING, y: startY },
        // ✨ USE THE FORMATTER and SET THE VARIANT
        data: { ...formatPersonData(spouse2Data), variant: 'spouce' },
      });

      edges.push({ id: `edge-${spouse1Id}-${spouse2Id}`, source: spouse1Id, target: spouse2Id, type: 'monogamousEdge' });

      const childrenY = startY + NODE_HEIGHT + VERTICAL_SPACING;
      let childXOffset = startX + (NODE_WIDTH + HORIZONTAL_SPACING) / 2 - NODE_WIDTH / 2;
      for (const childId of marriage.childrenIds) {
        const childData = peopleMap.get(childId);
        nodes.push({
          id: childId, type: 'person', position: { x: childXOffset, y: childrenY },
          // ✨ USE THE FORMATTER and SET THE VARIANT
          data: { ...formatPersonData(childData), variant: 'directline' },
        });
        edges.push({ id: `edge-${spouse1Id}-${childId}`, source: spouse1Id, target: childId });
        childXOffset += NODE_WIDTH + HORIZONTAL_SPACING;
      }
      currentY = childrenY + NODE_HEIGHT + VERTICAL_SPACING;
    }
  }

  return { nodes, edges };
}