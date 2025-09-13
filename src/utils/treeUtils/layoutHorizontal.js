// src/utils/layoutHorizontal.js
import {
  HORIZONTAL_NODE_WIDTH,
  HORIZONTAL_NODE_HEIGHT,
  HORIZONTAL_COLUMN_GAP,
  VERTICAL_SPACING,
  HORIZONTAL_MARRIAGE_ICON_Y_OFFSET,
  HORIZONTAL_MARRIAGE_ICON_X_OFFSET,
} from './treeLayoutConstants.js';

import {
  createParentChildEdge,
  createMonogamousEdge,
  createPolygamousEdge,
  createEdgeWithGuard,
} from './edgeHelpers.js';

import { buildTree } from './layoutHelpers.js';

const NODE_WIDTH = HORIZONTAL_NODE_WIDTH;
const NODE_HEIGHT = HORIZONTAL_NODE_HEIGHT;
const GAP = HORIZONTAL_COLUMN_GAP;


function createAndInjectPlaceholders(nodesMap, marriages) {
  const processedMarriages = JSON.parse(JSON.stringify(marriages));

  for (const marriage of processedMarriages) {
    if (marriage.marriageType === 'monogamous' && marriage.spouses.includes('')) {
      const knownSpouseId = marriage.spouses.find(id => id !== '');
      const knownSpouseNode = nodesMap.get(knownSpouseId);
      const knownSpouse = knownSpouseNode?.data;
      const placeholderId = `placeholder-spouse-${marriage.id}`;

      if (!nodesMap.has(placeholderId)) {
        const derivedGender = knownSpouse?.gender ? (knownSpouse.gender === 'male' ? 'female' : 'male') : null;
        nodesMap.set(placeholderId, {
          id: placeholderId, type: 'personHorizontal',
          data: { id: placeholderId, name: "Unknown Partner", gender: derivedGender, isPlaceholder: true, variant: 'placeholder' },
          position: { x: 0, y: 0 }, isPositioned: false,
        });
      }
      const emptySpouseIndex = marriage.spouses.indexOf('');
      marriage.spouses[emptySpouseIndex] = placeholderId;

    } else if (marriage.marriageType === 'polygamous') {
      if (!marriage.husbandId) {
        const placeholderId = `placeholder-husband-${marriage.id}`;
        if (!nodesMap.has(placeholderId)) {
          // derive husband's gender from the first known wife if possible
          let derivedGender = 'male';
          if (marriage.wives && marriage.wives.length > 0) {
            const firstWife = nodesMap.get(marriage.wives[0].wifeId);
            const wifeGender = firstWife?.data?.gender;
            if (wifeGender) derivedGender = wifeGender === 'male' ? 'female' : 'male';
          }
          nodesMap.set(placeholderId, {
            id: placeholderId, type: 'personHorizontal',
            data: { id: placeholderId, name: "Unknown Husband", gender: derivedGender, isPlaceholder: true, variant: 'placeholder' },
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
              // derive wife's gender from known husband if possible
              let derivedGender = 'female';
              const husbandNode = nodesMap.get(marriage.husbandId);
              const husbandGender = husbandNode?.data?.gender;
              if (husbandGender) derivedGender = husbandGender === 'male' ? 'female' : 'male';
              nodesMap.set(placeholderId, {
                id: placeholderId, type: 'personHorizontal',
                data: { id: placeholderId, name: "Unknown Wife", gender: derivedGender, isPlaceholder: true, variant: 'placeholder' },
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

/* ------------ Helpers ------------ */
function topLeftYFromCenterY(centerY) { return centerY - NODE_HEIGHT / 2; }

function parentBlockHeight(marriage) {
  if (!marriage) return NODE_HEIGHT;
  if (marriage.marriageType === 'monogamous') return 2 * NODE_HEIGHT + GAP;
  if (marriage.marriageType === 'polygamous') {
    const n = (marriage.wives?.length || 0) + 1;
    return n * NODE_HEIGHT + (n - 1) * GAP;
  }
  return NODE_HEIGHT;
}

/* ------------ Phase 2: measure subtree heights ------------ */
function firstPass(node) {
  if (!node.children?.length) {
    node.subtreeHeight = parentBlockHeight(node.marriage);
    return node.subtreeHeight;
  }
  let total = 0;
  for (let i = 0; i < node.children.length; i++) {
    total += firstPass(node.children[i]);
    if (i > 0) total += GAP;
  }
  node.subtreeHeight = Math.max(parentBlockHeight(node.marriage), total);
  return node.subtreeHeight;
}

/* ------------ Phase 3: assign positions ------------ */
function secondPass(node, centerX, centerY, nodesMap) {
  const rfNode = nodesMap.get(node.id);
  if (rfNode) {
    const isDead = !!rfNode.data?.deathDate;
    rfNode.position = { x: centerX, y: topLeftYFromCenterY(centerY) };
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
  if (marriage?.marriageType === 'monogamous') {
    const blockH = parentBlockHeight(marriage);
    const topC = centerY - blockH / 2 + NODE_HEIGHT / 2;
    const botC = topC + NODE_HEIGHT + GAP;
    const [s1, s2] = marriage.spouses;
    const spouseId = node.id === s1 ? s2 : s1;
    const spouseRF = nodesMap.get(spouseId);
    if (rfNode) rfNode.position.y = topLeftYFromCenterY(topC);
    if (spouseRF) {
      const isDead = !!spouseRF.data?.deathDate;
      spouseRF.position = { x: centerX, y: topLeftYFromCenterY(botC) };
      spouseRF.isPositioned = true;
      spouseRF.data = {
        ...spouseRF.data,
        isDead,
        variant: isDead ? "dead" : "spouse",
      };
    }
  }
  if (marriage?.marriageType === 'polygamous') {
    const wives = marriage.wives || [];
    const blockH = parentBlockHeight(marriage);
    let slotC = centerY - blockH / 2 + NODE_HEIGHT / 2;
    const above = Math.floor(wives.length / 2);
    for (let i = above - 1; i >= 0; i--) {
      const wRF = nodesMap.get(wives[i].wifeId);
      if (wRF) {
        const isDead = !!wRF.data?.deathDate;
        wRF.position = { x: centerX, y: topLeftYFromCenterY(slotC) };
        wRF.isPositioned = true;
        wRF.data = {
          ...wRF.data,
          isDead,
          variant: isDead ? "dead" : "spouse",
        };
      }
      slotC += NODE_HEIGHT + GAP;
    }
    if (rfNode) rfNode.position.y = topLeftYFromCenterY(slotC);
    slotC += NODE_HEIGHT + GAP;
    for (let i = above; i < wives.length; i++) {
      const wRF = nodesMap.get(wives[i].wifeId);
      if (wRF) {
        const isDead = !!wRF.data?.deathDate;
        wRF.position = { x: centerX, y: topLeftYFromCenterY(slotC) };
        wRF.isPositioned = true;
        wRF.data = {
          ...wRF.data,
          isDead,
          variant: isDead ? "dead" : "spouse",
        };      }
      slotC += NODE_HEIGHT + GAP;
    }
  }
  if (node.children?.length) {
    const childX = centerX + NODE_WIDTH + VERTICAL_SPACING;
    let total = node.children.reduce((sum, c, i) => sum + c.subtreeHeight + (i > 0 ? GAP : 0), 0);
    let childC = centerY - total / 2;
    for (let i = 0; i < node.children.length; i++) {
      childC += node.children[i].subtreeHeight / 2;
      secondPass(node.children[i], childX, childC, nodesMap);
      childC += node.children[i].subtreeHeight / 2 + GAP;
    }
  }
}

/* ------------ Phase 4: edges ------------ */
function createEdges(marriages, nodesMap) {
  const edges = [];
  for (const marriage of marriages) {
    if (marriage.marriageType === 'polygamous') {
      const { husbandId, wives = [] } = marriage;
      for (const w of wives) {
        const e = createEdgeWithGuard(
          createPolygamousEdge,
          nodesMap,
          husbandId,
          w.wifeId,
          marriage.id,
          {
            orientation: "horizontal",
            sourceHandle: "source-left",
            targetHandle: "target-parent"
          }
        )
        console.log(e)
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
      const topId = n1.position.y < n2.position.y ? p1 : p2;
      const botId = topId === p1 ? p2 : p1;
      const mId = `marriage-${marriage.id}`;
      const mx = n1.position.x + NODE_WIDTH + HORIZONTAL_MARRIAGE_ICON_X_OFFSET;
      const my = (n1.position.y + n2.position.y) / 2 + (NODE_HEIGHT / 2) + HORIZONTAL_MARRIAGE_ICON_Y_OFFSET;
      nodesMap.set(mId, {
        id: mId, type: 'marriage', position: { x: mx, y: my },
        data: { hasChildren: (marriage.childrenIds || []).length > 0, orientation: 'horizontal' },
        isPositioned: true,
      });
      edges.push(createEdgeWithGuard(createMonogamousEdge, nodesMap, topId, mId, marriage.id, { sourceHandle: 'source-bottom' }));
      edges.push(createEdgeWithGuard(createMonogamousEdge, nodesMap, botId, mId, marriage.id, { sourceHandle: 'source-top' }));
      for (const cId of (marriage.childrenIds || [])) {
        const ec = createEdgeWithGuard(createParentChildEdge, nodesMap, mId, cId);
        if (ec) edges.push(ec);
      }
    }
  }
  return edges;
}

/* ------------ Main ------------ */
export function layoutHorizontal(nodesMap, marriages, initialEdges, rootId) {

  console.log("DATA RECEIVED BY LAYOUT:", JSON.parse(JSON.stringify(marriages)));


  if (!nodesMap?.size || !marriages?.length) return { nodes: Array.from(nodesMap.values()), edges: initialEdges };

  const { processedMarriages, nodesMap: finalNodesMap } = createAndInjectPlaceholders(nodesMap, marriages);

  const { root } = buildTree(finalNodesMap, processedMarriages, NODE_WIDTH, NODE_HEIGHT, rootId);
  if (!root) return { nodes: Array.from(finalNodesMap.values()), edges: initialEdges };

  firstPass(root);
  secondPass(root, 0, parentBlockHeight(root.marriage) / 2, finalNodesMap);

  if (root.marriage?.marriageType === 'polygamous') {
    const husbandNode = finalNodesMap.get(root.marriage.husbandId);
    if (husbandNode) husbandNode.data.variant = husbandNode.data.deathDate ? 'dead' : 'root'  ;
    for (const w of root.marriage.wives || []) {
      const wf = finalNodesMap.get(w.wifeId); if (wf) wf.data.variant = wf.data.deathDate ? 'dead' : 'root';
    }
  } else if (root.marriage?.marriageType === 'monogamous') {
    for (const s of root.marriage.spouses || []) {
      const sn = finalNodesMap.get(s); if (sn) sn.data.variant = sn.data.deathDate ? 'dead' : 'root';
    }
  } else {
    const r = finalNodesMap.get(root.id); if (r) r.data.variant = r.data.deathDate? 'dead' : 'root';
  }

  const edges = createEdges(processedMarriages, finalNodesMap);
  return { nodes: Array.from(finalNodesMap.values()), edges };
}