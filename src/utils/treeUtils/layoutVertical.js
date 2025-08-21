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
   Universal Placeholder Creation (Same as horizontal, but with vertical node type)
----------------------------------------------------------- */
function createAndInjectPlaceholders(nodesMap, marriages) {
    const processedMarriages = JSON.parse(JSON.stringify(marriages));
    for (const marriage of processedMarriages) {
        if (marriage.marriageType === 'monogamous' && marriage.spouses.includes('')) {
            const knownSpouseId = marriage.spouses.find(id => id !== '');
            const knownSpouseNode = nodesMap.get(knownSpouseId);
            const knownSpouse = knownSpouseNode?.data;
            const placeholderId = `placeholder-spouse-${marriage.id}`;
            if (!nodesMap.has(placeholderId)) {
                nodesMap.set(placeholderId, {
                    id: placeholderId, type: 'person', // Use 'person' for vertical
                    data: { id: placeholderId, name: "Unknown Partner", gender: knownSpouse?.gender === 'male' ? 'female' : 'male', isPlaceholder: true, variant: 'placeholder' },
                    position: { x: 0, y: 0 }, isPositioned: false,
                });
            }
            const emptySpouseIndex = marriage.spouses.indexOf('');
            marriage.spouses[emptySpouseIndex] = placeholderId;
        } else if (marriage.marriageType === 'polygamous') {
            if (!marriage.husbandId) {
                const placeholderId = `placeholder-husband-${marriage.id}`;
                if (!nodesMap.has(placeholderId)) {
                    nodesMap.set(placeholderId, {
                        id: placeholderId, type: 'person',
                        data: { id: placeholderId, name: "Unknown Husband", gender: "male", isPlaceholder: true, variant: 'placeholder' },
                        position: { x: 0, y: 0 }, isPositioned: false,
                    });
                }
                marriage.husbandId = placeholderId;
            }
            if (marriage.wives?.length) {
                for (let i = 0; i < marriage.wives.length; i++) {
                    if (!marriage.wives[i].wifeId) {
                        const placeholderId = `placeholder-wife-${marriage.id}-${i}`;
                        if (!nodesMap.has(placeholderId)) {
                            nodesMap.set(placeholderId, {
                                id: placeholderId, type: 'person',
                                data: { id: placeholderId, name: "Unknown Wife", gender: "female", isPlaceholder: true, variant: 'placeholder' },
                                position: { x: 0, y: 0 }, isPositioned: false,
                            });
                        }
                        marriage.wives[i].wifeId = placeholderId;
                    }
                }
            }
        }
    }
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
    rfNode.position = { x: topLeftXFromCenterX(centerX), y: centerY };
    rfNode.isPositioned = true;
    rfNode.data = { ...(rfNode.data || {}), variant: rfNode.data?.variant || 'directline' };
  }
  const marriage = node.marriage;
  
  if (marriage?.marriageType === 'monogamous') {
    const blockW = parentBlockWidth(marriage);
    const leftC = centerX - blockW / 2 + NODE_WIDTH / 2;
    const rightC = leftC + NODE_WIDTH + GAP;
    const [s1, s2] = marriage.spouses;
    const spouseId = node.id === s1 ? s2 : s1;
    const spouseRF = nodesMap.get(spouseId);
    if (rfNode) rfNode.position.x = topLeftXFromCenterX(leftC);
    if (spouseRF) {
      spouseRF.position = { x: topLeftXFromCenterX(rightC), y: centerY };
      spouseRF.isPositioned = true;
      spouseRF.data = { ...(spouseRF.data || {}), variant: 'spouce' };
    }
  }

  if (marriage?.marriageType === 'polygamous') {
    const wives = marriage.wives || [];
    const blockW = parentBlockWidth(marriage);
    let slotC = centerX - blockW / 2 + NODE_WIDTH / 2;
    const leftCount = Math.floor(wives.length / 2);
    
    for (let i = leftCount - 1; i >= 0; i--) {
      const wRF = nodesMap.get(wives[i].wifeId);
      if (wRF) {
        wRF.position = { x: topLeftXFromCenterX(slotC), y: centerY };
        wRF.isPositioned = true;
        wRF.data = { ...(wRF.data || {}), variant: 'spouce' };
      }
      slotC += NODE_WIDTH + GAP;
    }
    if (rfNode) rfNode.position.x = topLeftXFromCenterX(slotC);
    slotC += NODE_WIDTH + GAP;
    for (let i = leftCount; i < wives.length; i++) {
      const wRF = nodesMap.get(wives[i].wifeId);
      if (wRF) {
        wRF.position = { x: topLeftXFromCenterX(slotC), y: centerY };
        wRF.isPositioned = true;
        wRF.data = { ...(wRF.data || {}), variant: 'spouce' };
      }
      slotC += NODE_WIDTH + GAP;
    }
  }

  if (node.children?.length) {
    const childY = centerY + NODE_HEIGHT + VERTICAL_SPACING;
    let total = node.children.reduce((sum, c, i) => sum + c.subtreeWidth + (i > 0 ? GAP : 0), 0);
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
        // ✨ THE FIX: Specify the correct handles for vertical polygamy ✨
        const e = createEdgeWithGuard(
            createPolygamousEdge,
            nodesMap,
            husbandId,
            w.wifeId,
            {
                orientation: 'vertical',
                sourceHandle: 'source-top', // Connect from the TOP of the husband
                targetHandle: 'target-top'  // Connect to the TOP of the wife
            }
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

      edges.push(createEdgeWithGuard(createMonogamousEdge, nodesMap, leftId, mId, marriage.id, { sourceHandle: 'source-right' }));
      edges.push(createEdgeWithGuard(createMonogamousEdge, nodesMap, rightId, mId, marriage.id, { sourceHandle: 'source-left' }));
      
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
  if (!nodesMap?.size || !marriages?.length) return { nodes: Array.from(nodesMap.values()), edges: initialEdges };

  const { processedMarriages, nodesMap: finalNodesMap } = createAndInjectPlaceholders(nodesMap, marriages);
  
  const { root } = buildTree(finalNodesMap, processedMarriages, NODE_WIDTH, NODE_HEIGHT);
  if (!root) return { nodes: Array.from(finalNodesMap.values()), edges: initialEdges };

  firstPass(root);
  secondPass(root, 0, parentBlockWidth(root.marriage) / 2, finalNodesMap);

  if (root.marriage?.marriageType === 'polygamous') {
    const husbandNode = finalNodesMap.get(root.marriage.husbandId);
    if (husbandNode) husbandNode.data.variant = 'root';
    for (const w of root.marriage.wives || []) {
      const wf = finalNodesMap.get(w.wifeId); if (wf) wf.data.variant = 'root';
    }
  } else if (root.marriage?.marriageType === 'monogamous') {
    for (const s of root.marriage.spouses || []) {
      const sn = finalNodesMap.get(s); if (sn) sn.data.variant = 'root';
    }
  } else {
    const r = finalNodesMap.get(root.id); if (r) r.data.variant = 'root';
  }

  const edges = createEdges(processedMarriages, finalNodesMap);
  return { nodes: Array.from(finalNodesMap.values()), edges };
}