async function addChildToPolygamousMarriageWithPlaceholder(treeId, marriageId, parentId, motherId, newChild, dataService) {
  const marriage = await dataService.getMarriage(marriageId);
  if (!marriage) throw new Error("Marriage not found.");

  const parentPerson = await dataService.getPerson(parentId);
  if (!parentPerson) throw new Error("Parent not found.");

  let wifeIdToUse = motherId;

  if (!motherId) {
    // Create placeholder spouse
    const placeholderSpouse = createPerson({
      treeId,
      name: "Partner",
      gender: parentPerson.gender === 'male' ? 'female' : 'male',
      isPlaceholder: true,
      isSpouse: true,
      allowGlobalMatching: false,
    });
    await dataService.addPerson(placeholderSpouse);

    // Add placeholder spouse as wife to the polygamous marriage
    await addWifeToMarriage(marriageId, placeholderSpouse.id);

    wifeIdToUse = placeholderSpouse.id;
  }

  // Add child to marriage with the correct wifeId
  await addChildToMarriage(marriageId, newChild.id, wifeIdToUse);

  return { child: newChild, marriageId };
}
