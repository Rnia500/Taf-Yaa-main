// src/hooks/useFamilyData.js
import { people as allPeople, marriages as allMarriages } from '../data/dummyData';

// This is our temporary hook that mimics fetching from Firebase.
export function useFamilyData(treeId) {
  // When Firebase is ready, this hook will become async.
  // It will have useState for loading and error states.
  // For example:
  // const [data, setData] = useState({ people: [], marriages: [] });
  // const [loading, setLoading] = useState(true);
  // useEffect(() => {
  //   const unsubscribe = onSnapshot(query(collection(db, 'people'), where('treeId', '==', treeId)), (snapshot) => { ... });
  //   // ...fetch marriages too
  //   // setData(...)
  //   // setLoading(false)
  // }, [treeId]);

  // For now, we just filter our dummy data.
  const people = allPeople.filter(p => p.treeId === treeId);
  const marriages = allMarriages.filter(m => m.treeId === treeId);

  // We return the data directly. We add 'loading: false' to match what a real hook would do.
  return { people, marriages, loading: false };
}

// ---

// ### Step 3: Create the Layout "Brain"

// This is the most important file. It contains the pure logic for turning your data into visual coordinates for React Flow.

// **File Location:** `src/utils/treeLayout.js`

// ```javascript
// src/utils/treeLayout.js

// These constants control the spacing of the nodes on the canvas.
const NODE_WIDTH = 200; // The assumed width of your PersonCard
const NODE_HEIGHT = 100; // The assumed height of your PersonCard
const HORIZONTAL_SPACING = 50;
const VERTICAL_SPACING = 120;

export function calculateLayout(people, marriages) {
  const nodes = [];
  const edges = [];
  
  // Use a Map for efficient lookups. Much faster than find() in a loop.
  const peopleMap = new Map(people.map(p => [p.id, p]));

  let currentY = 0; // This will track the vertical position on the canvas.

  // For this basic algorithm, we'll sort marriages to try and render parents first.
  // A more advanced solution would build a dependency graph.
  // We will assume for now that `marriages` are ordered correctly (parents before children's marriages).
  
  for (const marriage of marriages) {
    if (marriage.marriageType === 'polygamous') {
      const { husbandId, wives } = marriage;
      const husbandNode = nodes.find(n => n.id === husbandId);
      
      // Position the husband. If he's already placed as a child, use his existing position.
      const husbandX = husbandNode ? husbandNode.position.x : 0;
      const husbandY = husbandNode ? husbandNode.position.y : currentY;

      if (!husbandNode) {
        nodes.push({
          id: husbandId,
          type: 'person', // This type must match the key in your nodeTypes map
          position: { x: husbandX, y: husbandY },
          data: { ...peopleMap.get(husbandId), isDeceased: !!peopleMap.get(husbandId).dod },
        });
      }

      // Position the wives relative to the husband
      let wifeXOffset = husbandX + NODE_WIDTH + HORIZONTAL_SPACING;
      for (const wife of wives) {
        // Place the wife node
        nodes.push({
          id: wife.wifeId,
          type: 'person',
          position: { x: wifeXOffset, y: husbandY },
          data: { ...peopleMap.get(wife.wifeId), isDeceased: !!peopleMap.get(wife.wifeId).dod },
        });

        // Add the marriage edge (we'll make this custom later)
        edges.push({
          id: `edge-${husbandId}-${wife.wifeId}`,
          source: husbandId,
          target: wife.wifeId,
          type: 'polygamousEdge', // Custom edge type
        });

        // Place the children under THIS wife
        let childXOffset = wifeXOffset;
        for (const childId of wife.childrenIds) {
          nodes.push({
            id: childId,
            type: 'person',
            position: { x: childXOffset, y: husbandY + NODE_HEIGHT + VERTICAL_SPACING },
            data: { ...peopleMap.get(childId), isDeceased: !!peopleMap.get(childId).dod },
          });
          // Add edge from mother to child
          edges.push({
            id: `edge-${wife.wifeId}-${childId}`,
            source: wife.wifeId,
            target: childId,
          });
          childXOffset += NODE_WIDTH + HORIZONTAL_SPACING;
        }

        wifeXOffset += NODE_WIDTH + HORIZONTAL_SPACING;
      }
      // Increment currentY for the next family unit
      currentY = husbandY + (NODE_HEIGHT + VERTICAL_SPACING) * 2;
    }
    
    if (marriage.marriageType === 'monogamous') {
      const [spouse1Id, spouse2Id] = marriage.spouses;
      const spouse1Node = nodes.find(n => n.id === spouse1Id);
      
      const startX = spouse1Node ? spouse1Node.position.x - (NODE_WIDTH + HORIZONTAL_SPACING) / 2 : 0;
      const startY = spouse1Node ? spouse1Node.position.y : currentY;

      if (!spouse1Node) {
         nodes.push({
           id: spouse1Id, type: 'person', position: { x: startX, y: startY },
           data: { ...peopleMap.get(spouse1Id), isDeceased: !!peopleMap.get(spouse1Id).dod },
         });
      }
      
      nodes.push({
        id: spouse2Id, type: 'person', position: { x: startX + NODE_WIDTH + HORIZONTAL_SPACING, y: startY },
        data: { ...peopleMap.get(spouse2Id), isDeceased: !!peopleMap.get(spouse2Id).dod },
      });

      edges.push({
        id: `edge-${spouse1Id}-${spouse2Id}`, source: spouse1Id, target: spouse2Id, type: 'monogamousEdge',
      });

      // Position children
      const childrenY = startY + NODE_HEIGHT + VERTICAL_SPACING;
      let childXOffset = startX;
      for (const childId of marriage.childrenIds) {
        nodes.push({
          id: childId,
          type: 'person',
          position: { x: childXOffset, y: childrenY },
          data: { ...peopleMap.get(childId), isDeceased: !!peopleMap.get(childId).dod },
        });
        edges.push({
          id: `edge-${spouse1Id}-${childId}`, source: spouse1Id, target: childId,
        });
        childXOffset += NODE_WIDTH + HORIZONTAL_SPACING;
      }
      currentY = childrenY + NODE_HEIGHT + VERTICAL_SPACING;
    }
  }

  return { nodes, edges };
}