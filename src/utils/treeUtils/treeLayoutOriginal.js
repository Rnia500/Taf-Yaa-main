
const VERTICAL_NODE_WIDTH = 130;
const VERTICAL_NODE_HEIGHT = 80;
const HORIZONTAL_SPACING = 15;
const VERTICAL_SPACING = 120;
const MARRIAGE_NODE_WIDTH = 24;
const MARRIAGE_NODE_HEIGHT = 24;

const HORIZONTAL_COLUMN_GAP = 70;
const HORIZONTAL_NODE_WIDTH = 180;
const HORIZONTAL_NODE_HEIGHT = 60;

const MARRIAGE_ICON_Y_OFFSET = 28;
const MARRIAGE_ICON_X_OFFSET = -20;
const HORIZONTAL_MARRIAGE_ICON_Y_OFFSET = -6;
const HORIZONTAL_MARRIAGE_ICON_X_OFFSET = -17;
const MARRIAGE_ICON_Y_OFFSET_NO_STEM = 28;

/**
 * Takes a raw person object and transforms it into the data structure needed by my PersonCard component.
 * It also determines if the person has children to help with UI making.
 * @param {object} person - The person object from the main data source.
 * @param {Array} marriages - The full list of marriage objects.
 * @param {Function} handleToggleCollapse - The function to call to collapse/expand a branch.
 * @param {Function} handleOpenProfile - The function to call to open the profile sidebar.
 * @returns {object} The formatted data object for a React Flow node.
 */
function formatPersonData(person, marriages, handleToggleCollapse, handleOpenProfile) {
    if (!person) return {};
    // Check if this person is a parent in any marriage that has children.
    const hasChildren = marriages.some(m =>
        (m.marriageType === 'monogamous' && m.spouses.includes(person.id) && m.childrenIds.length > 0) ||
        (m.marriageType === 'polygamous' && ((m.husbandId === person.id && m.wives.some(w => w.childrenIds.length > 0)) || m.wives.some(w => w.wifeId === person.id && w.childrenIds.length > 0)))
    );
    return {
        id: person.id, name: person.name, profileImage: person.photoUrl,
        sex: person.gender === 'male' ? 'M' : 'F', birthDate: person.dob,
        deathDate: person.dod, role: person.role || 'viewer',
        isCollapsed: person.isCollapsed, hasChildren: hasChildren,
        onToggleCollapse: () => handleToggleCollapse(person.id),
        onOpenProfile: () => handleOpenProfile(person.id),
    };
}

/**
 * repeateadly finds all descendant IDs for a given person.
 * Used by the collapse feature to know which nodes to hide.
 * @param {string} personId - The ID of the person to start from.
 * @param {Array} marriages - The full list of marriage objects.
 * @returns {Array<string>} A flat array of all descendant IDs.
 */
function getDescendantIds(personId, marriages) {
    const descendants = new Set();
    const visitedMarriages = new Set();
    // Inner recursive function to traverse the tree downwards.
    function findDescendants(currentPersonId) {
        for (const marriage of marriages) {
            let isParentInMarriage = false;
            let childrenInMarriage = [];
            if (marriage.marriageType === 'monogamous' && marriage.spouses.includes(currentPersonId)) {
                isParentInMarriage = true;
                childrenInMarriage = marriage.childrenIds;
            } else if (marriage.marriageType === 'polygamous') {
                if (marriage.husbandId === currentPersonId) {
                    isParentInMarriage = true;
                    childrenInMarriage = marriage.wives.flatMap(w => w.childrenIds);
                } else {
                    const wifeData = marriage.wives.find(w => w.wifeId === currentPersonId);
                    if (wifeData) { isParentInMarriage = true; childrenInMarriage = wifeData.childrenIds; }
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

/**
 * Finds all direct ancestors of a given person and the edges connecting them.
 * Used by the "Trace Lineage" feature.
 * @param {string} personId - The ID of the person to start from.
 * @param {Array} people - The full list of people objects.
 * @param {Array} marriages - The full list of marriage objects.
 * @returns {{nodes: Array<string>, edges: Array<string>}} An object containing the IDs of nodes and edges in the lineage.
 */
export function traceLineage(personId, people, marriages) {
    const highlightedNodes = [personId]; // start with the person
    const highlightedEdges = [];

    function findAncestors(currentPersonId) {
        const parentMarriage = marriages.find(m =>
            (m.marriageType === 'monogamous' && m.childrenIds.includes(currentPersonId)) ||
            (m.marriageType === 'polygamous' && m.wives.some(w => w.childrenIds.includes(currentPersonId)))
        );
        if (!parentMarriage) return;

        if (parentMarriage.marriageType === 'monogamous') {
            const [p1, p2] = parentMarriage.spouses;
            const marriageNodeId = `marriage-${parentMarriage.id}`;
            highlightedNodes.push(p1, p2, marriageNodeId);
            highlightedEdges.push(
                `edge-${p1}-${marriageNodeId}`,
                `edge-${p2}-${marriageNodeId}`,
                `edge-${marriageNodeId}-${currentPersonId}`
            );
            findAncestors(p1);
            findAncestors(p2);
        } else {
            const husbandId = parentMarriage.husbandId;
            const wifeData = parentMarriage.wives.find(w => w.childrenIds.includes(currentPersonId));
            if (wifeData) {
                const wifeId = wifeData.wifeId;
                highlightedNodes.push(husbandId, wifeId);
                highlightedEdges.push(
                    `edge-${husbandId}-${wifeId}`,
                    `edge-${wifeId}-${currentPersonId}`
                );
                findAncestors(husbandId);
                findAncestors(wifeId);
            }
        }
    }

    findAncestors(personId);
    return { nodes: highlightedNodes, edges: highlightedEdges }; // keep order
}

/**
 * Filters the full family data to only include a specific person and their descendants.
 * Used by the "Set as Root" feature.
 * @param {string} rootId - The ID of the person to become the new root.
 * @param {Array} allPeople - The complete, unfiltered list of people.
 * @param {Array} allMarriages - The complete, unfiltered list of marriages.
 * @returns {{people: Array, marriages: Array}} The filtered data.
 */
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
            const children = marriage.marriageType === 'monogamous'
                ? marriage.childrenIds
                : marriage.wives.flatMap(w => w.childrenIds);
            children.forEach(childId => queue.push(childId));
        }
    }
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

/**
 * The main "brain" of the tree. Takes in family data and calculates the positions, nodes, and edges
 * for React Flow to render.
 * @param {string} rootId - The ID of the person to be displayed at the top. (Currently unused in this version).
 * @param {Array} people - The array of people to be rendered.
 * @param {Array} marriages - The array of marriages for the people to be rendered.
 * @param {Function} handleToggleCollapse - The callback function for collapsing.
 * @param {Function} handleOpenProfile - The callback function for opening the profile.
 * @returns {{nodes: Array, edges: Array}} The final nodes and edges for React Flow.
 */
export function calculateLayout(rootId, people, marriages, handleToggleCollapse, handleOpenProfile, orientation = 'vertical') {

    const isVertical = orientation === 'vertical';
    const NODE_WIDTH = isVertical ? VERTICAL_NODE_WIDTH : HORIZONTAL_NODE_WIDTH;
    const NODE_HEIGHT = isVertical ? VERTICAL_NODE_HEIGHT : HORIZONTAL_NODE_HEIGHT;

    const edges = [];
    const peopleMap = new Map(people.map(p => [p.id, p]));
    const nodesMap = new Map();

    const collapsedDescendantIds = new Set();
    people.forEach(person => {
        if (person.isCollapsed) {
            getDescendantIds(person.id, marriages).forEach(id => collapsedDescendantIds.add(id));
        }
    });
    marriages.forEach(marriage => {
        if (marriage.marriageType === 'monogamous') {
            const [p1, p2] = marriage.spouses;
            if (collapsedDescendantIds.has(p1)) collapsedDescendantIds.add(p2);
            if (collapsedDescendantIds.has(p2)) collapsedDescendantIds.add(p1);
        }
    });

    const personNodeType = isVertical ? 'person' : 'personHorizontal';

    people.forEach(person => {
        if (!collapsedDescendantIds.has(person.id)) {
            nodesMap.set(person.id, {
                id: person.id, type: personNodeType,
                data: formatPersonData(person, marriages, handleToggleCollapse, handleOpenProfile),
                position: { x: 0, y: 0 }, isPositioned: false,
            });
        }
    });

    if (orientation === 'vertical') {
        let currentY = 0;
        // Iterate through marriages to position nodes generation by generation.
        for (const marriage of marriages) {
            let lowestYInMarriage = currentY;
            if (marriage.marriageType === 'polygamous') {
                const { husbandId, wives } = marriage;
                const husbandNode = nodesMap.get(husbandId);
                if (!husbandNode) continue;
                const husbandY = husbandNode.isPositioned ? husbandNode.position.y : currentY;
                const husbandX = husbandNode.isPositioned ? husbandNode.position.x : 0;
                const numWives = wives.length;
                const numLeftWives = Math.floor(numWives / 2);
                const leftWives = wives.slice(0, numLeftWives);
                const rightWives = wives.slice(numLeftWives);
                husbandNode.position = { x: husbandX, y: husbandY };
                husbandNode.isPositioned = true;
                husbandNode.data.variant = 'root';
                let currentX = husbandX + NODE_WIDTH + HORIZONTAL_SPACING;
                for (const wife of rightWives) {
                    const wifeNode = nodesMap.get(wife.wifeId);
                    if (wifeNode) {
                        wifeNode.position = { x: currentX, y: husbandY };
                        wifeNode.isPositioned = true;
                        wifeNode.data.variant = 'spouce';
                    }
                    edges.push({ id: `edge-${husbandId}-${wife.wifeId}`, source: husbandId, target: wife.wifeId, type: 'polygamousEdge', sourceHandle: 'source-polygamous', targetHandle: 'target-parent', markerStart: 'circle', markerEnd: 'arrow-custom' });
                    currentX += NODE_WIDTH + HORIZONTAL_SPACING;
                }
                currentX = husbandX - NODE_WIDTH - HORIZONTAL_SPACING;
                for (const wife of leftWives.slice().reverse()) {
                    const wifeNode = nodesMap.get(wife.wifeId);
                    if (wifeNode) {
                        wifeNode.position = { x: currentX, y: husbandY };
                        wifeNode.isPositioned = true;
                        wifeNode.data.variant = 'spouce';
                    }
                    edges.push({ id: `edge-${husbandId}-${wife.wifeId}`, source: husbandId, target: wife.wifeId, type: 'polygamousEdge', sourceHandle: 'source-polygamous', targetHandle: 'target-parent', markerStart: 'circle', markerEnd: 'arrow-custom' });
                    currentX -= (NODE_WIDTH + HORIZONTAL_SPACING);
                }
                const childrenY = husbandY + NODE_HEIGHT + VERTICAL_SPACING;
                const allChildren = wives.flatMap(w => w.childrenIds);
                if (allChildren.length > 0) lowestYInMarriage = Math.max(lowestYInMarriage, childrenY + NODE_HEIGHT);
                const totalChildrenWidth = (allChildren.length * NODE_WIDTH) + ((allChildren.length - 1) * HORIZONTAL_SPACING);
                let childXOffset = husbandX - (totalChildrenWidth / 2);
                for (const wife of wives) {
                    for (const childId of wife.childrenIds) {
                        const childNode = nodesMap.get(childId);
                        if (childNode) {
                            childNode.position = { x: childXOffset, y: childrenY };
                            childNode.isPositioned = true;
                            childNode.data.variant = 'directline';
                        }
                        edges.push({ id: `edge-${wife.wifeId}-${childId}`, source: wife.wifeId, target: childId, sourceHandle: 'source-child', targetHandle: 'target-parent', type: 'parentChild', markerStart: 'circle', markerEnd: 'arrow-custom' });
                        childXOffset += NODE_WIDTH + HORIZONTAL_SPACING;
                    }
                }
            }

            if (marriage.marriageType === 'monogamous') {
                const [spouse1Id, spouse2Id] = marriage.spouses;
                const spouse1Node = nodesMap.get(spouse1Id);
                const spouse2Node = nodesMap.get(spouse2Id);
                if (!spouse1Node || !spouse2Node) continue;
                const isSpouse1Positioned = spouse1Node.isPositioned;
                const spouse1Y = isSpouse1Positioned ? spouse1Node.position.y : currentY;
                const spouse1X = isSpouse1Positioned ? spouse1Node.position.x : 0;
                if (!isSpouse1Positioned) {
                    spouse1Node.position = { x: spouse1X, y: spouse1Y };
                    spouse1Node.isPositioned = true;
                    spouse1Node.data.variant = 'directline';
                }
                const spouse2X = spouse1X + NODE_WIDTH + HORIZONTAL_SPACING;
                const siblingsToShift = [];
                nodesMap.forEach(node => {
                    if (node.isPositioned && node.id !== spouse1Id && node.position.y === spouse1Y && node.position.x > spouse1X) {
                        siblingsToShift.push(node);
                    }
                });
                siblingsToShift.sort((a, b) => a.position.x - b.position.x);
                spouse2Node.position = { x: spouse2X, y: spouse1Y };
                spouse2Node.isPositioned = true;
                spouse2Node.data.variant = 'spouce';
                let nextX = spouse2X + NODE_WIDTH + HORIZONTAL_SPACING;
                for (const sibling of siblingsToShift) {
                    sibling.position.x = nextX;
                    nextX += NODE_WIDTH + HORIZONTAL_SPACING;
                }
                lowestYInMarriage = spouse1Y + NODE_HEIGHT;
                const marriageNodeId = `marriage-${marriage.id}`;
                const horizontalCenter = spouse1X + NODE_WIDTH + (HORIZONTAL_SPACING / 2);
                const verticalCenter = spouse1Y + (NODE_HEIGHT / 2);
                const hasChildren = marriage.childrenIds.length > 0;
                const marriageNodeX = horizontalCenter - (MARRIAGE_NODE_WIDTH / 2) + MARRIAGE_ICON_X_OFFSET;
                const marriageNodeY = verticalCenter - (MARRIAGE_NODE_HEIGHT / 2) + (hasChildren ? MARRIAGE_ICON_Y_OFFSET : MARRIAGE_ICON_Y_OFFSET_NO_STEM);
                nodesMap.set(marriageNodeId, { id: marriageNodeId, type: 'marriage', position: { x: marriageNodeX, y: marriageNodeY }, data: { hasChildren }, isPositioned: true });
                edges.push({ id: `edge-${spouse1Id}-${marriageNodeId}`, source: spouse1Id, target: marriageNodeId, sourceHandle: 'source-right', targetHandle: 'target-left', type: 'monogamousEdge' });
                edges.push({ id: `edge-${spouse2Id}-${marriageNodeId}`, source: spouse2Id, target: marriageNodeId, sourceHandle: 'source-left', targetHandle: 'target-right', type: 'monogamousEdge' });
                const childrenY = spouse1Y + NODE_HEIGHT + VERTICAL_SPACING;
                if (hasChildren) lowestYInMarriage = Math.max(lowestYInMarriage, childrenY + NODE_HEIGHT);
                const totalChildrenWidth = (marriage.childrenIds.length * NODE_WIDTH) + ((marriage.childrenIds.length - 1) * HORIZONTAL_SPACING);
                let childXOffset = horizontalCenter - (totalChildrenWidth / 2);
                for (const childId of marriage.childrenIds) {
                    const childNode = nodesMap.get(childId);
                    if (childNode) {
                        childNode.position = { x: childXOffset, y: childrenY };
                        childNode.isPositioned = true;
                        childNode.data.variant = 'directline';
                    }
                    edges.push({ id: `edge-${marriageNodeId}-${childId}`, source: marriageNodeId, target: childId, sourceHandle: 'source-bottom', targetHandle: 'target-parent', type: 'parentChild', markerStart: 'circle', markerEnd: 'arrow-custom' });
                    childXOffset += NODE_WIDTH + HORIZONTAL_SPACING;
                }
            }

            currentY = lowestYInMarriage + VERTICAL_SPACING;
        }

        // Position any remaining, unpositioned nodes (e.g., single individuals).
        let unpositionedX = 0;
        nodesMap.forEach(node => {
            if (!node.isPositioned) {
                node.position = { x: unpositionedX, y: currentY };
                node.data.variant = 'directline';
                unpositionedX += NODE_WIDTH + HORIZONTAL_SPACING;
            }
        });

        const nodes = Array.from(nodesMap.values());
        return { nodes, edges };

    } else { // if (orientation === 'horizontal')
        let currentX = 0;
        for (const marriage of marriages) {
            let rightmostXInMarriage = currentX;

            if (marriage.marriageType === 'polygamous') {
                const { husbandId, wives } = marriage;
                const husbandNode = nodesMap.get(husbandId);
                if (!husbandNode) continue;

                // Husband positioning
                const husbandX = husbandNode.isPositioned ? husbandNode.position.x : currentX;
                const husbandY = husbandNode.isPositioned ? husbandNode.position.y : 0;
                husbandNode.position = { x: husbandX, y: husbandY };
                husbandNode.isPositioned = true;
                husbandNode.data.variant = 'root';

                // Split wives into above / below groups
                const numWives = wives.length;
                const numTopWives = Math.floor(numWives / 2);
                const topWives = wives.slice(0, numTopWives);
                const bottomWives = wives.slice(numTopWives);

                // Shared vertical hub line (just conceptual – edges will bend to it)
                const hubX = husbandX + NODE_WIDTH + VERTICAL_SPACING;

                // Position wives below husband
                let wifeYOffset = husbandY + NODE_HEIGHT + HORIZONTAL_COLUMN_GAP;
                for (const wife of bottomWives) {
                    const wifeNode = nodesMap.get(wife.wifeId);
                    if (wifeNode) {
                        wifeNode.position = { x: husbandX, y: wifeYOffset };
                        wifeNode.isPositioned = true;
                        wifeNode.data.variant = 'spouce';
                    }
                    edges.push({
                        id: `edge-${husbandId}-${wife.wifeId}`,
                        source: husbandId,
                        target: wife.wifeId,
                        type: 'polygamousEdge',
                        sourceHandle: 'source-left',  
                        targetHandle: 'target-parent', 
                        markerStart: 'circle',
                        data: { orientation }
                    });
                    wifeYOffset += NODE_HEIGHT + HORIZONTAL_COLUMN_GAP;
                }

                // Position wives above husband
                wifeYOffset = husbandY - NODE_HEIGHT - HORIZONTAL_COLUMN_GAP;
                for (const wife of topWives.slice().reverse()) {
                    const wifeNode = nodesMap.get(wife.wifeId);
                    if (wifeNode) {
                        wifeNode.position = { x: husbandX, y: wifeYOffset };
                        wifeNode.isPositioned = true;
                        wifeNode.data.variant = 'spouce';
                    }
                    edges.push({
                        id: `edge-${husbandId}-${wife.wifeId}`,
                        source: husbandId,
                        target: wife.wifeId,
                        type: 'polygamousEdge',
                        sourceHandle: 'source-left',
                        targetHandle: 'target-parent',
                        markerStart: 'circle',
                        data: { orientation }
                    });
                    wifeYOffset -= (NODE_HEIGHT + HORIZONTAL_COLUMN_GAP);
                }

                // --- Children ---
                const childrenX = hubX + NODE_WIDTH;
                const allChildren = wives.flatMap(w => w.childrenIds);
                if (allChildren.length > 0) rightmostXInMarriage = Math.max(rightmostXInMarriage, childrenX + NODE_WIDTH);

                const totalChildrenHeight = (allChildren.length * NODE_HEIGHT) + ((allChildren.length - 1) * HORIZONTAL_COLUMN_GAP);
                let childYOffset = husbandY - (totalChildrenHeight / 2) + (NODE_HEIGHT / 2);

                for (const wife of wives) {
                    for (const childId of wife.childrenIds) {
                        const childNode = nodesMap.get(childId);
                        if (childNode) {
                            childNode.position = { x: childrenX, y: childYOffset };
                            childNode.isPositioned = true;
                            childNode.data.variant = 'directline';
                        }
                        edges.push({
                            id: `edge-${wife.wifeId}-${childId}`,
                            source: wife.wifeId,
                            target: childId,
                            type: 'parentChild',
                            sourceHandle: 'source-child',
                            targetHandle: 'target-parent',
                            markerStart: 'circle',
                            markerEnd: 'arrow-custom'
                        });
                        childYOffset += NODE_HEIGHT + HORIZONTAL_COLUMN_GAP;
                    }
                }
            }

            if (marriage.marriageType === 'monogamous') {
                const [spouse1Id, spouse2Id] = marriage.spouses;
                const spouse1Node = nodesMap.get(spouse1Id);
                const spouse2Node = nodesMap.get(spouse2Id);
                if (!spouse1Node || !spouse2Node) continue;

                const isSpouse1Positioned = spouse1Node.isPositioned;
                const spouse1X = isSpouse1Positioned ? spouse1Node.position.x : currentX;
                const spouse1Y = isSpouse1Positioned ? spouse1Node.position.y : 0;

                if (!isSpouse1Positioned) {
                    spouse1Node.position = { x: spouse1X, y: spouse1Y };
                    spouse1Node.isPositioned = true;
                    spouse1Node.data.variant = 'directline';
                }

                const spouse2Y = spouse1Y + NODE_HEIGHT + HORIZONTAL_COLUMN_GAP;
                const spaceNeeded = NODE_HEIGHT + HORIZONTAL_COLUMN_GAP;
                nodesMap.forEach(node => {
                    if (node.isPositioned && node.id !== spouse1Id && node.position.x === spouse1X && node.position.y > spouse1Y) {
                        node.position.y += spaceNeeded;
                    }
                });

                spouse2Node.position = { x: spouse1X, y: spouse2Y };
                spouse2Node.isPositioned = true;
                // ✨ FIX: Set variant for the second spouse
                spouse2Node.data.variant = 'spouce';

                const marriageNodeId = `marriage-${marriage.id}`;
                const marriageNodeX = spouse1X + (NODE_WIDTH / 2) + HORIZONTAL_MARRIAGE_ICON_X_OFFSET;
                const marriageNodeY = spouse1Y + NODE_HEIGHT + (HORIZONTAL_COLUMN_GAP / 2) + HORIZONTAL_MARRIAGE_ICON_Y_OFFSET;
                nodesMap.set(marriageNodeId, { id: marriageNodeId, type: 'marriage', position: { x: marriageNodeX, y: marriageNodeY }, data: { hasChildren: marriage.childrenIds.length > 0, orientation: 'horizontal' }, isPositioned: true });

                edges.push({ id: `edge-${spouse1Id}-${marriageNodeId}`, source: spouse1Id, target: marriageNodeId, sourceHandle: 'source-bottom', targetHandle: 'target-top', type: 'monogamousEdge' });
                edges.push({ id: `edge-${spouse2Id}-${marriageNodeId}`, source: spouse2Id, target: marriageNodeId, sourceHandle: 'source-top', targetHandle: 'target-bottom', type: 'monogamousEdge' });

                const childrenX = spouse1X + NODE_WIDTH + VERTICAL_SPACING;
                const hasChildren = marriage.childrenIds.length > 0;
                if (hasChildren) rightmostXInMarriage = Math.max(rightmostXInMarriage, childrenX + NODE_WIDTH);

                const totalChildrenHeight = (marriage.childrenIds.length * NODE_HEIGHT) + ((marriage.childrenIds.length - 1) * HORIZONTAL_COLUMN_GAP);
                const verticalCenter = (spouse1Y + spouse2Y + NODE_HEIGHT) / 2;
                let childYOffset = verticalCenter - (totalChildrenHeight / 2) + (NODE_HEIGHT / 2);

                for (const childId of marriage.childrenIds) {
                    const childNode = nodesMap.get(childId);
                    if (childNode) {
                        childNode.position = { x: childrenX, y: childYOffset };
                        childNode.isPositioned = true;

                        childNode.data.variant = 'directline';
                    }
                    edges.push({ id: `edge-${marriageNodeId}-${childId}`, source: marriageNodeId, target: childId, sourceHandle: 'source-right', targetHandle: 'target-parent', type: 'parentChild', markerStart: 'circle', markerEnd: 'arrow-custom' });
                    childYOffset += NODE_HEIGHT + HORIZONTAL_COLUMN_GAP;
                }
            }
            currentX = rightmostXInMarriage + VERTICAL_SPACING;
        }
    }

    const nodes = Array.from(nodesMap.values());
    return { nodes, edges };
}