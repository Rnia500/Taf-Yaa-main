// src/utils/layoutVertical.js
import {
  VERTICAL_NODE_WIDTH,
  VERTICAL_NODE_HEIGHT,
  HORIZONTAL_SPACING, // Horizontal gap between stacked items in vertical layout
  VERTICAL_SPACING,   // Vertical gap between generations (rows)
  MARRIAGE_ICON_Y_OFFSET,
  MARRIAGE_ICON_X_OFFSET,
} from './treeLayoutConstants.js';

import {
  createParentChildEdge,
  createMonogamousEdge,
  createPolygamousEdge,
  createEdgeWithGuard,
} from './edgeHelpers.js';

import { buildTree } from './layoutHelpers.js';

const NODE_WIDTH = VERTICAL_NODE_WIDTH;
const NODE_HEIGHT = VERTICAL_NODE_HEIGHT;
const GAP = HORIZONTAL_SPACING; // In vertical, the gap between siblings is horizontal

/* -----------------------------------------------------------
   Universal Placeholder Creation 
----------------------------------------------------------- */
function createAndInjectPlaceholders(nodesMap, marriages) {
  console.log("DBG:layoutVertical.createAndInjectPlaceholders -> start", { nodesKeys: Array.from(nodesMap.keys()), marriagesCount: marriages.length });

  const processedMarriages = JSON.parse(JSON.stringify(marriages));

  for (const marriage of processedMarriages) {
    if (marriage.marriageType === 'monogamous') {
      const emptyIndex = marriage.spouses.findIndex(id => !id);
      if (emptyIndex !== -1) {
        const knownSpouseId = marriage.spouses.find(id => id);
        const knownSpouseNode = nodesMap.get(knownSpouseId);
        const knownSpouse = knownSpouseNode?.data;
        const placeholderId = `placeholder-spouse-${marriage.id}`;
        console.log("DBG:layoutVertical -> injecting placeholder for marriage", marriage.id, "placeholderId:", placeholderId);
        if (!nodesMap.has(placeholderId)) {
          nodesMap.set(placeholderId, {
            id: placeholderId,
            type: 'person',
            data: {
              id: placeholderId,
              name: "Unknown Partner",
              gender: knownSpouse?.gender === 'male' ? 'female' : 'male',
              isPlaceholder: true,
              variant: 'placeholder'
            },
            position: { x: 0, y: 0 },
            isPositioned: false
          });
        }
        marriage.spouses[emptyIndex] = placeholderId;
      }
    }

    if (marriage.marriageType === 'polygamous') {
      if (!marriage.husbandId) {
        const placeholderId = `placeholder-husband-${marriage.id}`;
        console.log("DBG:layoutVertical -> injecting polygamous husband placeholder for marriage", marriage.id);
        if (!nodesMap.has(placeholderId)) {
          nodesMap.set(placeholderId, {
            id: placeholderId,
            type: 'person',
            data: { id: placeholderId, name: "Unknown Husband", gender: "male", isPlaceholder: true, variant: 'placeholder' },
            position: { x: 0, y: 0 },
            isPositioned: false
          });
        }
        marriage.husbandId = placeholderId;
      }
      if (marriage.wives?.length) {
        for (let i = 0; i < marriage.wives.length; i++) {
          if (!marriage.wives[i].wifeId) {
            const placeholderId = `placeholder-wife-${marriage.id}-${i}`;
            console.log("DBG:layoutVertical -> injecting polygamous wife placeholder for marriage", marriage.id, "index", i);
            if (!nodesMap.has(placeholderId)) {
              nodesMap.set(placeholderId, {
                id: placeholderId,
                type: 'person',
                data: { id: placeholderId, name: "Unknown Wife", gender: "female", isPlaceholder: true, variant: 'placeholder' },
                position: { x: 0, y: 0 },
                isPositioned: false
              });
            }
            marriage.wives[i].wifeId = placeholderId;
          }
        }
      }
    }
  }

  // Filter out floating placeholders (not linked to any marriage)
  for (const [id, node] of nodesMap) {
    if (node.data?.isPlaceholder) {
      const isConnected = processedMarriages.some(m => {
        if (m.marriageType === 'monogamous') return m.spouses.includes(id);
        if (m.marriageType === 'polygamous') {
          if (m.husbandId === id) return true;
          if (m.wives?.some(w => w.wifeId === id)) return true;
        }
        return false;
      });
      if (!isConnected) {
        console.log("DBG:layoutVertical -> removing unlinked placeholder node:", id);
        nodesMap.delete(id);
      }
    }
  }

  console.log("DBG:layoutVertical.createAndInjectPlaceholders -> done; nodesMap keys:", Array.from(nodesMap.keys()));
  return { processedMarriages, nodesMap };
}



/* ------------ Helpers (Orientation-Swapped) ------------ */
function topLeftXFromCenterX(centerX) { return centerX - NODE_WIDTH / 2; }

function parentBlockWidth(marriage) {
  if (!marriage) return NODE_WIDTH;
  if (marriage.marriageType === 'monogamous') return 2 * NODE_WIDTH + GAP;
  if (marriage.marriageType === 'polygamous') {
    const n = (marriage.wives?.length || 0) + 1;
    return n * NODE_WIDTH + (n - 1) * GAP;
  }
  return NODE_WIDTH;
}

/* ------------ Phase 2: measure subtree widths (Swapped from heights) ------------ */
function firstPass(node) {
  if (!node.children?.length) {
    node.subtreeWidth = parentBlockWidth(node.marriage);
    return node.subtreeWidth;
  }
  let total = 0;
  for (let i = 0; i < node.children.length; i++) {
    total += firstPass(node.children[i]);
    if (i > 0) total += GAP;
  }
  node.subtreeWidth = Math.max(parentBlockWidth(node.marriage), total);
  return node.subtreeWidth;
}

/* ------------ Phase 3: assign positions (Orientation-Swapped) ------------ */
function secondPass(node, centerX, centerY, nodesMap) {
  const rfNode = nodesMap.get(node.id);

  if (rfNode) {
    const isDead = !!rfNode.data?.deathDate; 
    rfNode.position = { x: topLeftXFromCenterX(centerX), y: centerY };
    rfNode.isPositioned = true;

    rfNode.data = {
      ...rfNode.data, 
      isDead,
      variant: isDead
        ? "dead"
        : rfNode.data?.variant || "directline",
    };
  }

  const marriage = node.marriage;

  // --- Monogamous Marriage ---
  if (marriage?.marriageType === "monogamous") {
    const blockW = parentBlockWidth(marriage);
    const leftC = centerX - blockW / 2 + NODE_WIDTH / 2;
    const rightC = leftC + NODE_WIDTH + GAP;

    const [s1, s2] = marriage.spouses;
    const spouseId = node.id === s1 ? s2 : s1;
    const spouseRF = nodesMap.get(spouseId);

    if (rfNode) rfNode.position.x = topLeftXFromCenterX(leftC);

    if (spouseRF) {
      const isDead = !!spouseRF.data?.deathDate;
      spouseRF.position = { x: topLeftXFromCenterX(rightC), y: centerY };
      spouseRF.isPositioned = true;
      spouseRF.data = {
        ...spouseRF.data,
        isDead,
        variant: isDead ? "dead" : "spouse",
      };
      
    }
  }

  // --- Polygamous Marriage ---
  if (marriage?.marriageType === "polygamous") {
    const wives = marriage.wives || [];
    const blockW = parentBlockWidth(marriage);
    let slotC = centerX - blockW / 2 + NODE_WIDTH / 2;
    const leftCount = Math.floor(wives.length / 2);

    // Left wives
    for (let i = leftCount - 1; i >= 0; i--) {
      const wRF = nodesMap.get(wives[i].wifeId);
      if (wRF) {
        const isDead = !!wRF.data?.deathDate;
        wRF.position = { x: topLeftXFromCenterX(slotC), y: centerY };
        wRF.isPositioned = true;
        wRF.data = {
          ...wRF.data,
          isDead,
          variant: isDead ? "dead" : "spouse",
        };
        
      }
      slotC += NODE_WIDTH + GAP;
    }

    // Husband in center
    if (rfNode) rfNode.position.x = topLeftXFromCenterX(slotC);
    slotC += NODE_WIDTH + GAP;

    // Right wives
    for (let i = leftCount; i < wives.length; i++) {
      const wRF = nodesMap.get(wives[i].wifeId);
      if (wRF) {
        const isDead = !!wRF.data?.deathDate;
        wRF.position = { x: topLeftXFromCenterX(slotC), y: centerY };
        wRF.isPositioned = true;
        wRF.data = {
          ...wRF.data,
          isDead,
          variant: isDead ? "dead" : "spouse",
        };
      }
      slotC += NODE_WIDTH + GAP;
    }
  }

  // --- Children ---
  if (node.children?.length) {
    const childY = centerY + NODE_HEIGHT + VERTICAL_SPACING;
    let total = node.children.reduce(
      (sum, c, i) => sum + c.subtreeWidth + (i > 0 ? GAP : 0),
      0
    );
    let childC = centerX - total / 2;
    for (let i = 0; i < node.children.length; i++) {
      childC += node.children[i].subtreeWidth / 2;
      secondPass(node.children[i], childC, childY, nodesMap);
      childC += node.children[i].subtreeWidth / 2 + GAP;
    }
  }
}


/* ------------ Phase 4: edges (Orientation-Swapped) ------------ */
function createEdges(marriages, nodesMap) {
  const edges = [];
  for (const marriage of marriages) {
    if (marriage.marriageType === 'polygamous') {
      const { husbandId, wives = [] } = marriage;
      for (const w of wives) {
        const e = createEdgeWithGuard(
          createPolygamousEdge, nodesMap, husbandId, w.wifeId,
          { orientation: 'vertical', sourceHandle: 'source-top', targetHandle: 'target-top' }
        );
        if (e) edges.push(e);

        for (const childId of (w.childrenIds || [])) {
          const ec = createEdgeWithGuard(createParentChildEdge, nodesMap, w.wifeId, childId);
          if (ec) edges.push(ec);
        }
      }
    } else if (marriage.marriageType === 'monogamous') {
      const [p1, p2] = marriage.spouses;
      const n1 = nodesMap.get(p1), n2 = nodesMap.get(p2);
      if (!n1?.position || !n2?.position) continue;

      const leftId = n1.position.x < n2.position.x ? p1 : p2;
      const rightId = leftId === p1 ? p2 : p1;
      const mId = `marriage-${marriage.id}`;

      const mx = (n1.position.x + n2.position.x) / 2 + (NODE_WIDTH / 2) + MARRIAGE_ICON_X_OFFSET;
      const my = n1.position.y + NODE_HEIGHT - (NODE_HEIGHT / 2) + MARRIAGE_ICON_Y_OFFSET;

      nodesMap.set(mId, {
        id: mId, type: 'marriage', position: { x: mx, y: my },
        data: { hasChildren: (marriage.childrenIds || []).length > 0, orientation: 'vertical' },
        isPositioned: true,
      });


      const e1 = createEdgeWithGuard(createMonogamousEdge, nodesMap, leftId, mId, marriage.id, {
        sourceHandle: 'source-right',
        targetHandle: 'target-left'
      });
      const e2 = createEdgeWithGuard(createMonogamousEdge, nodesMap, rightId, mId, marriage.id, {
        sourceHandle: 'source-left',
        targetHandle: 'target-right'
      });

      if (e1) edges.push(e1);
      if (e2) edges.push(e2);

      for (const cId of (marriage.childrenIds || [])) {
        const ec = createEdgeWithGuard(createParentChildEdge, nodesMap, mId, cId);
        if (ec) edges.push(ec);
      }
    }
  }
  return edges;
}


/* ------------ Main ------------ */
export function layoutVertical(nodesMap, marriages, initialEdges) {
  if (!nodesMap?.size || !marriages?.length) {
    return { nodes: Array.from(nodesMap.values()), edges: initialEdges };
  }

  // 1️⃣ Inject placeholders only where needed
  const { processedMarriages, nodesMap: updatedNodesMap } = createAndInjectPlaceholders(nodesMap, marriages);

  // 2️⃣ Build tree structure
  const { root } = buildTree(updatedNodesMap, processedMarriages, NODE_WIDTH, NODE_HEIGHT);
  if (!root) return { nodes: Array.from(updatedNodesMap.values()), edges: initialEdges };

  // 3️⃣ Measure subtree widths
  firstPass(root);

  // 4️⃣ Assign positions (root at 0,0)
  secondPass(root, 0, 0, updatedNodesMap);

  // 5️⃣ Set root variant
  const setNodeVariant = (node) => {
    if (!node) return;
    node.data.variant = node.data.deathDate ? "dead" : "root";
  };
  if (root.marriage?.marriageType === "polygamous") {
    setNodeVariant(updatedNodesMap.get(root.marriage.husbandId));
    (root.marriage.wives || []).forEach(w => setNodeVariant(updatedNodesMap.get(w.wifeId)));
  } else if (root.marriage?.marriageType === "monogamous") {
    (root.marriage.spouses || []).forEach(s => setNodeVariant(updatedNodesMap.get(s)));
  } else {
    setNodeVariant(updatedNodesMap.get(root.id));
  }

  // 6️⃣ Create edges
  const edges = createEdges(processedMarriages, updatedNodesMap);

  // 7️⃣ Filter out unlinked placeholders
const filteredNodes = Array.from(updatedNodesMap.values()).filter(node => {
    if (!node.data?.isPlaceholder) return true;
    return processedMarriages.some(m => {
      if (m.marriageType === "monogamous") return m.spouses.includes(node.id);
      if (m.marriageType === "polygamous") {
        if (m.husbandId === node.id) return true;
        if (m.wives?.some(w => w.wifeId === node.id)) return true;
      }
      return false;
    });
  });

  console.log("DBG:layoutVertical -> final filtered nodes count:", filteredNodes.length, "edges count:", edges?.length || 0);
  return { nodes: filteredNodes, edges };
}

