// src/data/dummyData.js

// This data is structured EXACTLY like our final Firestore collections.

export const people = [
  // Generation 1: The Root
  {
    id: "p001",
    treeId: "tree001",
    name: "Chief Tanda",
    gender: "male",
    dob: "1935-06-20",
    dod: "2010-12-15",
    photoUrl: "https://i.pravatar.cc/150?u=p001",
    bio: "The respected elder and founder of the Tanda Dynasty."
  },
  // Wives of Chief Tanda
  {
    id: "p011",
    treeId: "tree001",
    name: "Amina Tanda",
    gender: "female",
    dob: "1942-01-10",
    dod: null,
    photoUrl: "https://i.pravatar.cc/150?u=p011",
    bio: "The first wife, known for her wisdom."
  },
  {
    id: "p012",
    treeId: "tree001",
    name: "Beatrice Tanda",
    gender: "female",
    dob: "1950-05-25",
    dod: "1999-02-20",
    photoUrl: "https://i.pravatar.cc/150?u=p012",
    bio: "The second wife, a talented artist."
  },
  {
    id: "p013",
    treeId: "tree001",
    name: "Celina Tanda",
    gender: "female",
    dob: "1955-11-30",
    dod: null,
    photoUrl: "https://i.pravatar.cc/150?u=p013",
    bio: "The third wife, who joined the family later in life."
  },
  
  // Generation 2: Children
  {
    id: "p102",
    treeId: "tree001",
    name: "Musa Tanda",
    gender: "male",
    dob: "1972-03-18",
    dod: null,
    photoUrl: "https://i.pravatar.cc/150?u=p102",
    bio: "Son of Amina, an administrator."
  },
  {
    id: "p103",
    treeId: "tree001",
    name: "Fatima Tanda",
    gender: "female",
    dob: "1974-07-22",
    dod: null,
    photoUrl: "https://i.pravatar.cc/150?u=p103",
    bio: "Daughter of Amina, a teacher."
  },
  {
    id: "p104",
    treeId: "tree001",
    name: "David Tanda",
    gender: "male",
    dob: "1980-09-01",
    dod: null,
    photoUrl: "https://i.pravatar.cc/150?u=p104",
    bio: "Son of Beatrice, a musician."
  },

  // Person for Monogamous Marriage (Musa's wife)
  {
    id: "p201",
    treeId: "tree001",
    name: "Sarah Tanda",
    gender: "female",
    dob: "1975-04-14",
    dod: null,
    photoUrl: "https://i.pravatar.cc/150?u=p201",
    bio: "Wife of Musa."
  },

  // Generation 3: Grandchildren
  {
    id: "p301",
    treeId: "tree001",
    name: "Leo Tanda",
    gender: "male",
    dob: "2005-10-10",
    dod: null,
    photoUrl: "https://i.pravatar.cc/150?u=p301",
    bio: "Son of Musa and Sarah."
  }
];

export const marriages = [
  // The polygamous marriage of Chief Tanda
  {
    id: "m001",
    treeId: "tree001",
    marriageType: "polygamous",
    husbandId: "p001",
    wives: [
      {
        wifeId: "p011",
        order: 1,
        startDate: "1970-09-20",
        endDate: null,
        childrenIds: ["p102", "p103"]
      },
      {
        wifeId: "p012",
        order: 2,
        startDate: "1978-03-10",
        endDate: "1995-06-01",
        childrenIds: ["p104"]
      },
      {
        wifeId: "p013",
        order: 3,
        startDate: "1998-11-05",
        endDate: null,
        childrenIds: []
      }
    ]
  },
  // The monogamous marriage of Musa and Sarah
  {
    id: "m002",
    treeId: "tree001",
    marriageType: "monogamous",
    spouses: ["p102", "p201"],
    childrenIds: ["p301"],
    startDate: "2002-06-20",
    endDate: null
  }
];