// src/data/dummyData.js

export const people = [
  // Generation 1 (root + wives)
  { id: "p001", treeId: "tree001", name: "Chief Tanda", gender: "male", dob: "1935-06-20", dod: "2010-12-15", photoUrl: "https://i.pravatar.cc/150?u=p001", isCollapsed: false },
  { id: "p011", treeId: "tree001", name: "Amina Tanda", gender: "female", dob: "1942-01-10", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p011", isCollapsed: false },
  { id: "p012", treeId: "tree001", name: "Beatrice Tanda", gender: "female", dob: "1950-05-25", dod: "1999-02-20", photoUrl: "https://i.pravatar.cc/150?u=p012", isCollapsed: false },
  { id: "p013", treeId: "tree001", name: "Celina Tanda", gender: "female", dob: "1955-11-30", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p013", isCollapsed: false },

  // Generation 2 (children of root)
  { id: "p102", treeId: "tree001", name: "Musa Tanda", gender: "male", dob: "1972-03-18", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p102", isCollapsed: false },
  { id: "p103", treeId: "tree001", name: "Fatima Tanda", gender: "female", dob: "1974-07-22", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p103", isCollapsed: false },
  { id: "p104", treeId: "tree001", name: "David Tanda", gender: "male", dob: "1976-09-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p104", isCollapsed: false },
  { id: "p105", treeId: "tree001", name: "Issa Tanda", gender: "male", dob: "1978-02-12", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p105", isCollapsed: false },
  { id: "p106", treeId: "tree001", name: "Rahma Tanda", gender: "female", dob: "1979-08-09", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p106", isCollapsed: false },
  { id: "p107", treeId: "tree001", name: "Omar Tanda", gender: "male", dob: "1981-04-02", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p107", isCollapsed: false },
  { id: "p108", treeId: "tree001", name: "Nadia Tanda", gender: "female", dob: "1983-12-12", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p108", isCollapsed: false },
  { id: "p109", treeId: "tree001", name: "Hassan Tanda", gender: "male", dob: "1985-06-30", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p109", isCollapsed: false },

  // Generation 2 spouses (partners for some children)
  { id: "p201", treeId: "tree001", name: "Sarah Musa", gender: "female", dob: "1975-04-14", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p201", isCollapsed: false },
  { id: "p202", treeId: "tree001", name: "Zoe Ahmed", gender: "female", dob: "1976-11-20", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p202", isCollapsed: false },
  { id: "p203", treeId: "tree001", name: "Amir Ali", gender: "male", dob: "1977-03-05", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p203", isCollapsed: false },
  { id: "p204", treeId: "tree001", name: "Lina Omar", gender: "female", dob: "1980-09-09", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p204", isCollapsed: false },
  { id: "p205", treeId: "tree001", name: "Pauline Ky", gender: "female", dob: "1982-01-11", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p205", isCollapsed: false },
  { id: "p206", treeId: "tree001", name: "Mark Ndiaye", gender: "male", dob: "1979-07-07", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p206", isCollapsed: false },
  { id: "p207", treeId: "tree001", name: "Lea Conte", gender: "female", dob: "1984-05-21", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p207", isCollapsed: false },

  // Generation 3 (grandchildren)
  { id: "p301", treeId: "tree001", name: "Leo Musa", gender: "male", dob: "2005-10-10", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p301", isCollapsed: false },
  { id: "p302", treeId: "tree001", name: "Lila Musa", gender: "female", dob: "2007-05-15", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p302", isCollapsed: false },
  { id: "p303", treeId: "tree001", name: "Ben Tanda", gender: "male", dob: "2008-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p303", isCollapsed: false },
  { id: "p304", treeId: "tree001", name: "Mia Tanda", gender: "female", dob: "2010-02-14", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p304", isCollapsed: false },
  { id: "p305", treeId: "tree001", name: "Sam Tanda", gender: "male", dob: "2012-03-30", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p305", isCollapsed: false },
  { id: "p306", treeId: "tree001", name: "Ava Tanda", gender: "female", dob: "2013-08-20", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p306", isCollapsed: false },
];

export const marriages = [
  // Gen 1: polygamous (root husband with 3 wives)
  {
    id: "m001",
    treeId: "tree001",
    marriageType: "polygamous",
    husbandId: "p001",
    wives: [
      { wifeId: "p011", childrenIds: ["p102", "p103", "p104"] }, // Amina's kids
      { wifeId: "p012", childrenIds: ["p105", "p106"] },         // Beatrice's kids
      { wifeId: "p013", childrenIds: ["p107", "p108", "p109"] }  // Celina's kids
    ]
  },

  // Gen 2: monogamous marriages (children paired with spouses)
  {
    id: "m002",
    treeId: "tree001",
    marriageType: "monogamous",
    spouses: ["p102", "p201"],
    childrenIds: ["p301", "p302"]
  },
  {
    id: "m003",
    treeId: "tree001",
    marriageType: "monogamous",
    spouses: ["p103", "p202"],
    childrenIds: ["p303"]
  },
  {
    id: "m004",
    treeId: "tree001",
    marriageType: "monogamous",
    spouses: ["p105", "p203"],
    childrenIds: ["p304", "p305"]
  },
  {
    id: "m005",
    treeId: "tree001",
    marriageType: "monogamous",
    spouses: ["p107", "p204"],
    childrenIds: []
  },
  {
    id: "m006",
    treeId: "tree001",
    marriageType: "monogamous",
    spouses: ["p108", "p205"],
    childrenIds: ["p306"]
  },
  {
    id: "m007",
    treeId: "tree001",
    marriageType: "monogamous",
    spouses: ["p109", "p206"],
    childrenIds: []
  },
  {
    id: "m008",
    treeId: "tree001",
    marriageType: "monogamous",
    spouses: ["p104", "p207"],
    childrenIds: []
  }
];
