// src/utils/treeLayout.js

const NODE_WIDTH = 130;
const NODE_HEIGHT = 80;
const HORIZONTAL_SPACING = 15;
const VERTICAL_SPACING = 120;
const MARRIAGE_NODE_WIDTH = 24;
const MARRIAGE_NODE_HEIGHT = 24;

//This constant is used to adjust the vertical position of the marriage icon
const MARRIAGE_ICON_Y_OFFSET = -28; 
const MARRIAGE_ICON_X_OFFSET = -53;

function formatPersonData(person) {
    if (!person) return {};
    return {
        id: person.id,
        name: person.name,
        profileImage: person.photoUrl,
        sex: person.gender === 'male' ? 'M' : 'F',
        birthDate: person.dob,
        deathDate: person.dod,
        role: person.role || 'viewer',
    };
}

export function calculateLayout(people, marriages) {
    const edges = [];
    const peopleMap = new Map(people.map(p => [p.id, p]));
    const nodesMap = new Map();

    people.forEach(person => {
        nodesMap.set(person.id, {
            id: person.id,
            type: 'person',
            data: formatPersonData(person),
            position: { x: 0, y: 0 },
            isPositioned: false,
        });
    });

    let currentY = 0;

    for (const marriage of marriages) {
        if (marriage.marriageType === 'polygamous') {
            const { husbandId, wives } = marriage;
            const husbandNode = nodesMap.get(husbandId);
            const husbandX = husbandNode.isPositioned ? husbandNode.position.x : 0;
            const husbandY = husbandNode.isPositioned ? husbandNode.position.y : currentY;
            if (husbandNode && !husbandNode.isPositioned) {
                husbandNode.position = { x: husbandX, y: husbandY };
                husbandNode.isPositioned = true;
                husbandNode.data.variant = 'root'; 
            }
            let wifeXOffset = husbandX + NODE_WIDTH + HORIZONTAL_SPACING;
            for (const wife of wives) {
                const wifeNode = nodesMap.get(wife.wifeId);
                if (wifeNode) {
                    wifeNode.position = { x: wifeXOffset, y: husbandY };
                    wifeNode.isPositioned = true;
                    wifeNode.data.variant = 'spouce';
                }
                edges.push({ id: `edge-${husbandId}-${wife.wifeId}`, source: husbandId, target: wife.wifeId, type: 'polygamousEdge', sourceHandle: 'source-polygamous', targetHandle: 'target-parent' });
                let childXOffset = wifeXOffset;
                for (const childId of wife.childrenIds) {
                    const childNode = nodesMap.get(childId);
                    if (childNode) {
                        childNode.position = { x: childXOffset, y: husbandY + NODE_HEIGHT + VERTICAL_SPACING };
                        childNode.isPositioned = true;
                        childNode.data.variant = 'directline';
                    }
                    edges.push({ id: `edge-${wife.wifeId}-${childId}`, source: wife.wifeId, target: childId, sourceHandle: 'source-child', targetHandle: 'target-parent' });
                    childXOffset += NODE_WIDTH + HORIZONTAL_SPACING;
                }
                wifeXOffset += NODE_WIDTH + HORIZONTAL_SPACING;
            }
            currentY = husbandY + (NODE_HEIGHT + VERTICAL_SPACING) * 2;
        }
        
        if (marriage.marriageType === 'monogamous') {
            const [spouse1Id, spouse2Id] = marriage.spouses;
            const spouse1Node = nodesMap.get(spouse1Id);
            const spouse2Node = nodesMap.get(spouse2Id);

            if (!spouse1Node || !spouse2Node) continue;
            
            const spouse1X = spouse1Node.isPositioned ? spouse1Node.position.x : 0;
            const spouse1Y = spouse1Node.isPositioned ? spouse1Node.position.y : currentY;

            if (!spouse1Node.isPositioned) {
                spouse1Node.position = { x: spouse1X, y: spouse1Y };
                spouse1Node.isPositioned = true;
                spouse1Node.data.variant = 'directline';
            }
            
            const spouse2X = spouse1X + NODE_WIDTH + HORIZONTAL_SPACING;
            spouse2Node.position = { x: spouse2X, y: spouse1Y };
            spouse2Node.isPositioned = true;
            spouse2Node.data.variant = 'spouce';

            const marriageNodeId = `marriage-${marriage.id}`;
            
            const horizontalCenter = spouse1X + NODE_WIDTH + (HORIZONTAL_SPACING / 2);
            const verticalCenter = spouse1Y + (NODE_HEIGHT / 2);

            const marriageNodeX = horizontalCenter - (MARRIAGE_NODE_WIDTH / 2) + MARRIAGE_ICON_X_OFFSET;
            const marriageNodeY = verticalCenter - (MARRIAGE_NODE_HEIGHT / 2) + MARRIAGE_ICON_Y_OFFSET;

            nodesMap.set(marriageNodeId, {
                id: marriageNodeId,
                type: 'marriage',
                position: { x: marriageNodeX, y: marriageNodeY },
                data: {},
                isPositioned: true,
            });

            edges.push({ id: `edge-${spouse1Id}-${marriageNodeId}`, source: spouse1Id, target: marriageNodeId, sourceHandle: 'source-right', targetHandle: 'target-left' });
            edges.push({ id: `edge-${spouse2Id}-${marriageNodeId}`, source: spouse2Id, target: marriageNodeId, sourceHandle: 'source-left', targetHandle: 'target-right' });
            
            const childrenY = spouse1Y + NODE_HEIGHT + VERTICAL_SPACING;
            const totalChildrenWidth = (marriage.childrenIds.length * NODE_WIDTH) + ((marriage.childrenIds.length - 1) * HORIZONTAL_SPACING);
            let childXOffset = horizontalCenter - (totalChildrenWidth / 2);

            for (const childId of marriage.childrenIds) {
                const childNode = nodesMap.get(childId);
                if (childNode) {
                    childNode.position = { x: childXOffset, y: childrenY };
                    childNode.isPositioned = true;
                    childNode.data.variant = 'directline';
                }
                edges.push({ id: `edge-${marriageNodeId}-${childId}`, source: marriageNodeId, target: childId, sourceHandle: 'source-bottom', targetHandle: 'target-parent' });
                childXOffset += NODE_WIDTH + HORIZONTAL_SPACING;
            }
            currentY = childrenY + NODE_HEIGHT + VERTICAL_SPACING;
        }
    }

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
}