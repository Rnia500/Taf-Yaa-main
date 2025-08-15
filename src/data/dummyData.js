// src/data/dummyData.js

export const people = [
  // Generation 1: The Root
  { id: "p001", treeId: "tree001", name: "Chief Tanda", gender: "male", dob: "1935-06-20", dod: "2010-12-15", photoUrl: "https://i.pravatar.cc/150?u=p001", isCollapsed: false },
  { id: "p011", treeId: "tree001", name: "Amina Tanda", gender: "female", dob: "1942-01-10", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p011", isCollapsed: true },
  { id: "p012", treeId: "tree001", name: "Beatrice Tanda", gender: "female", dob: "1950-05-25", dod: "1999-02-20", photoUrl: "https://i.pravatar.cc/150?u=p012", isCollapsed: false },
  { id: "p013", treeId: "tree001", name: "Celina Tanda", gender: "female", dob: "1955-11-30", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p013", isCollapsed: false },
  
  // Generation 2: Children
  { id: "p102", treeId: "tree001", name: "Musa Tanda", gender: "male", dob: "1972-03-18", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p102", isCollapsed: false },
  { id: "p103", treeId: "tree001", name: "Fatima Tanda", gender: "female", dob: "1974-07-22", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p103", isCollapsed: false },
  { id: "p104", treeId: "tree001", name: "David Tanda", gender: "male", dob: "1980-09-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p104", isCollapsed: false },
  { id: "p105", treeId: "tree001", name: "dev Tanda", gender: "male", dob: "1980-09-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p105", isCollapsed: false },
  { id: "p106", treeId: "tree001", name: "mac Tanda", gender: "male", dob: "1980-09-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p106", isCollapsed: true },

  // Spouses for Gen 2
  { id: "p201", treeId: "tree001", name: "Sarah Tanda", gender: "female", dob: "1975-04-14", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p201", isCollapsed: false },
  { id: "p202", treeId: "tree001", name: "Zoe Tanda", gender: "female", dob: "1982-11-20", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p202", isCollapsed: false },

  // Generation 3: Grandchildren
  { id: "p301", treeId: "tree001", name: "Leo Tanda", gender: "male", dob: "2005-10-10", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p301", isCollapsed: false },  
  { id: "p302", treeId: "tree001", name: "Lila Tanda", gender: "female", dob: "2007-05-15", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p302", isCollapsed: false },
  { id: "p303", treeId: "tree001", name: "Ben Tanda", gender: "male", dob: "2008-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p303", isCollapsed: false },
  { id: "p304", treeId: "tree001", name: "Mia Tanda", gender: "female", dob: "2010-02-14", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p304", isCollapsed: false },
  { id: "p305", treeId: "tree001", name: "Sam Tanda", gender: "male", dob: "2012-03-30", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p305", isCollapsed: false },

  // Spouse for Gen 3 (Ben Tanda's spouse)
  { id: "p306", treeId: "tree001", name: "Chloe Tanda", gender: "female", dob: "2008-06-08", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p306", isCollapsed: false },
];

export const marriages = [
  // Gen 1 Marriage
  {
    id: "m001",
    treeId: "tree001",
    marriageType: "polygamous",
    husbandId: "p001",
    wives: [
      { wifeId: "p011", childrenIds: ["p102", "p103", "p106"] },
      { wifeId: "p012", childrenIds: ["p104"] },
      { wifeId: "p013", childrenIds: ["p105"] }
    ]
  },
  // Gen 2 Marriages
  {
    id: "m002",
    treeId: "tree001",
    marriageType: "monogamous",
    spouses: ["p102", "p201"],
    childrenIds: ["p301", "p302"],
  },
  {
    id: "m003",
    treeId: "tree001",
    marriageType: "monogamous",
    spouses: ["p106", "p202"], // Mac & Zoe
    childrenIds: ["p303", "p304", "p305"],
  },
  // Gen 3 Marriage
  {
    id: "m004",
    treeId: "tree001",
    marriageType: "monogamous",
    spouses: ["p303", "p306"], // Ben & Chloe
    childrenIds: [], // No children yet
  },
];