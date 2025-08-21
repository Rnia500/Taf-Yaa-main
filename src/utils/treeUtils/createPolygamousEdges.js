// utils/createPolygamousEdges.js
export function createPolygamousEdges(husbandId, wifeIds, marriageIds, orientation = 'vertical') {
  const edges = [];

  wifeIds.forEach((wifeId, index) => {
    const marriageId = marriageIds[index];

    // alternate between top/bottom for wives, just like vertical
    const sourceHandle = index % 2 === 0 ? 'source-top' : 'source-bottom';

    edges.push({
      id: `edge-${husbandId}-marriage-${marriageId}`,
      source: husbandId,
      target: wifeId,
      sourceHandle,          // husband side
      targetHandle: 'target-parent',  // wife side
      type: 'polygamous',
      data: { orientation }  // tell edge renderer if it's horizontal
    });
  });

  return edges;
}
// This function creates edges for polygamous marriages, allowing for both vertical and horizontal orientations.
// It takes the husband's ID, an array of wife's IDs, and marriage IDs, and returns an array of edge objects.
// The edges alternate between top and bottom for wives in vertical orientation, and use a common hub in horizontal orientation.