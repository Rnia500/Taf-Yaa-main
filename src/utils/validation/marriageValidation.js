import dataService from "../../services/dataService";


export async function validateMarriageData(marriageData, existingSpouse, newSpouse) {
  // Same-sex marriage check
  if (existingSpouse.gender === newSpouse.gender) {
    throw new Error("Same-sex marriages are not allowed.");
  }

  // Polyandry check: Women cannot have more than one husband
  if (newSpouse.gender === 'female' && existingSpouse.gender === 'male') {
   
    const existingMarriages = await dataService.getMarriagesByPersonId(newSpouse.id);
    const husbandCount = existingMarriages.reduce((count, marriage) => {
      if (marriage.marriageType === 'monogamous') {
        const spouses = marriage.spouses || [];
        const husbands = spouses.filter(spouseId => {
          const spouse = dataService.getPerson(spouseId);
          return spouse && spouse.gender === 'male';
        });
        return count + husbands.length;
      } else if (marriage.marriageType === 'polygamous') {
      
        if (marriage.wives && marriage.wives.some(w => w.wifeId === newSpouse.id)) {
          return count + 1; 
        }
      }
      return count;
    }, 0);

    if (husbandCount > 0) {
      throw new Error("Polyandry is not allowed. A woman cannot have more than one husband.");
    }
  }

  /* Add more marriage validations later (considering age difference) */
}
