// utils/createPolygamousEdges.js
// Creates edges for polygamous marriages, handling vertical/horizontal orientation
// and ensures unique, clean edge IDs.

export function createPolygamousEdges(husbandId, wifeIds, marriageIds, orientation = "vertical") {
  const edges = [];

  wifeIds.forEach((wifeId, index) => {
    // normalize marriageId (remove duplicate "marriage-" prefixes if any)
    const cleanMarriageId = marriageIds[index]?.replace(/^marriage-/, "");

    // alternate between top/bottom for wives in vertical orientation
    const sourceHandle = index % 2 === 0 ? "source-top" : "source-bottom";

    edges.push({
      id: `edge-polygamous-${husbandId}-${wifeId}-marriage-${cleanMarriageId}`,
      source: husbandId,
      target: wifeId,
      sourceHandle,              // husband side
      targetHandle: "target-parent",  // wife side
      type: "polygamousEdge",
      data: { orientation }      // tells renderer if it's horizontal/vertical
    });
  });

  return edges;
}
