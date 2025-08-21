// src/utils/layoutHelpers.js

function getRowKey(y) {
  return Math.round(y);
}

function ensureRow(occupancy, rowKey) {
  if (!occupancy.has(rowKey)) occupancy.set(rowKey, []);
  return occupancy.get(rowKey);
}

function canPlaceAt(occupancy, y, height, x, width) {
  const startRow = getRowKey(y);
  const endRow = getRowKey(y + height - 1);
  for (let row = startRow; row <= endRow; row++) {
    const intervals = occupancy.get(row);
    if (!intervals) continue;
    for (const it of intervals) {
      if (!(x + width <= it.startX || x >= it.endX)) {
        return false; // overlap
      }
    }
  }
  return true;
}

function reserveInterval(occupancy, y, height, x, width) {
  const startRow = getRowKey(y);
  const endRow = getRowKey(y + height - 1);
  for (let row = startRow; row <= endRow; row++) {
    const intervals = ensureRow(occupancy, row);
    intervals.push({ startX: x, endX: x + width });
    intervals.sort((a, b) => a.startX - b.startX);
  }
}

export function insertIntoOccupancy(occupancy, y, startX, width, height, preferredDirection = 'right') {
  let finalX = startX;
  let guard = 0;
  const spacing = 40; // could use HORIZONTAL_SPACING

  while (guard < 128) {
    guard++;
    if (canPlaceAt(occupancy, y, height, finalX, width)) {
      reserveInterval(occupancy, y, height, finalX, width);
      return finalX;
    }
    finalX = preferredDirection === 'left'
      ? finalX - (width + spacing)
      : finalX + (width + spacing);
  }

  // fallback (should never hit unless spacing is too small)
  reserveInterval(occupancy, y, height, finalX, width);
  return finalX;
}


function createTreeNode(id, marriage, NODE_WIDTH, NODE_HEIGHT, isSpouse = false) {
  return {
    id: id,
    children: [],
    marriage: marriage,
    isSpouse: isSpouse,
    
    // R-T algorithm properties
    x: 0,
    y: 0,
    width: NODE_WIDTH,
    height: NODE_HEIGHT,
    modifier: 0, 
  };
}

/**
 * Converts a flat list of people and marriages into a hierarchical tree.
 * This is a common pre-processing step for tidy-tree layout algorithms.
 * @param {Map} nodesMap - The React Flow nodesMap.
 * @param {Array} marriages - The generation-sorted list of marriages.
 * @param {number} NODE_WIDTH - The width of a single node.
 * @param {number} NODE_HEIGHT - The height of a single node.
 * @returns {Object} - An object containing the root of the tree and a map of all created tree nodes.
 */
export function buildTree(nodesMap, marriages, NODE_WIDTH, NODE_HEIGHT) {
  const treeNodes = new Map();
  let root = null;

  // First, create a tree node for every person
  for (const id of nodesMap.keys()) {
    treeNodes.set(id, createTreeNode(id, null, NODE_WIDTH, NODE_HEIGHT));
  }

  // Link children to parents based on marriages
  for (const marriage of marriages) {
    let parents = [];
    let childrenIds = [];

    if (marriage.marriageType === 'polygamous') {
      parents = [treeNodes.get(marriage.husbandId)];
      childrenIds = marriage.wives.flatMap(w => w.childrenIds);
    } else { // Monogamous
      const [p1, p2] = marriage.spouses;
      const parent1 = treeNodes.get(p1);
      const parent2 = treeNodes.get(p2);
      
      if (parent1 && !parent1.isSpouse) parents.push(parent1);
      if (parent2 && !parent2.isSpouse) parents.push(parent2);
      if (parents.length === 0 && parent1) parents.push(parent1);

      childrenIds = marriage.childrenIds;
    }
    
    const primaryParent = parents[0];
    if (!primaryParent) continue;

    primaryParent.marriage = marriage;

    for (const childId of childrenIds) {
      const childNode = treeNodes.get(childId);
      if (childNode) {
        // Mark the other spouse in a monogamous marriage as a "spouse" node
        if (marriage.marriageType === 'monogamous') {
          const [p1, p2] = marriage.spouses;
          const spouseId = primaryParent.id === p1 ? p2 : p1;
          const spouseNode = treeNodes.get(spouseId);
          if(spouseNode) spouseNode.isSpouse = true;
        }
        primaryParent.children.push(childNode);
      }
    }
  }

  // Find the ultimate root of the tree
  const allChildrenIds = new Set(
    Array.from(treeNodes.values()).flatMap(n => n.children.map(c => c.id))
  );

  for (const node of treeNodes.values()) {
    if (!allChildrenIds.has(node.id)) {
      root = node;
      break;
    }
  }

  // Fallback if no clear root is found (e.g., a circular reference or small isolated tree)
  if (!root && treeNodes.size > 0) {
    root = treeNodes.values().next().value;
  }
  
  return { root, treeNodes };
}