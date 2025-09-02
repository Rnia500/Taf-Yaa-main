
// src/data/dummyData.js

export const people = [
  // Generation 1 (Founder) - 3 people
  { id: "p001", treeId: "tree001", name: "Founder F1", gender: "male", dob: "1940-01-01", dod: "2020-01-01", photoUrl: "https://i.pravatar.cc/150?u=p001", role:'admin', isCollapsed: false },
  { id: "p002", treeId: "tree001", name: "Wife W1", gender: "female", dob: "1942-01-01", dod: "2022-05-08", photoUrl: "https://i.pravatar.cc/150?u=p002", role:'moderator', isCollapsed: false },
  { id: "p003", treeId: "tree001", name: "Wife W2", gender: "female", dob: "1945-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p003", role:'null', isCollapsed: false },

  // Generation 2 - 6 people
  { id: "p010", treeId: "tree001", name: "Son S1", gender: "male", dob: "1965-01-01", dod: "2000-01-05", photoUrl: "https://i.pravatar.cc/150?u=p010", role:'viewer', isCollapsed: false },
  { id: "p011", treeId: "tree001", name: "Daughter D1", gender: "female", dob: "1967-01-01", dod: "2000-01-05", photoUrl: "https://i.pravatar.cc/150?u=p011", role:'null', isCollapsed: false },
  { id: "p012", treeId: "tree001", name: "Son S2", gender: "male", dob: "1968-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p012", role:'null', isCollapsed: false },
  { id: "p013", treeId: "tree001", name: "Daughter D2", gender: "female", dob: "1970-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p013", role:'null', isCollapsed: false },
  { id: "p014", treeId: "tree001", name: "Son S3", gender: "male", dob: "1972-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p014", role:'null', isCollapsed: false },
  { id: "p015", treeId: "tree001", name: "Daughter D3", gender: "female", dob: "1975-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p015", role:'null', isCollapsed: false },

//   // Gen 2 Spouses - 5 people
//   { id: "p020", treeId: "tree001", name: "Spouse for S1", gender: "female", dob: "1966-01-01", dod: "2010-05-08", photoUrl: "https://i.pravatar.cc/150?u=p020", role:'null', isCollapsed: false },
//   { id: "p021", treeId: "tree001", name: "Spouse for D1", gender: "male", dob: "1966-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p021", role:'null', isCollapsed: false },
//   { id: "p022", treeId: "tree001", name: "Wife 1 for S2", gender: "female", dob: "1969-01-01", dod: "2005-05-20", photoUrl: "https://i.pravatar.cc/150?u=p022", role:'null', isCollapsed: false },
//   { id: "p023", treeId: "tree001", name: "Wife 2 for S2", gender: "female", dob: "1971-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p023", role:'null', isCollapsed: false },
//   { id: "p024", treeId: "tree001", name: "Spouse for S3", gender: "female", dob: "1973-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p024", role:'null', isCollapsed: false },

//   // Generation 3 - 6 people
//   { id: "p030", treeId: "tree001", name: "GC from S1", gender: "male", dob: "1990-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p030", role:'null', isCollapsed: false },
//   { id: "p031", treeId: "tree001", name: "GC from D1", gender: "female", dob: "1992-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p031", role:'null', isCollapsed: false },
//   { id: "p032", treeId: "tree001", name: "GC1 from S2", gender: "male", dob: "1994-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p032", role:'null', isCollapsed: false },
//   { id: "p033", treeId: "tree001", name: "GC2 from S2", gender: "female", dob: "1996-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p033", role:'null', isCollapsed: false },
//   { id: "p034", treeId: "tree001", name: "GC3 from S2", gender: "male", dob: "1998-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p034", role:'null', isCollapsed: false },
//   { id: "p035", treeId: "tree001", name: "GC from D2", gender: "male", dob: "1995-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p035", role:'null', isCollapsed: false },

//   // Gen 3 Spouses - 3 people
//   { id: "p040", treeId: "tree001", name: "Spouse for GC-S1", gender: "female", dob: "1991-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p040", role:'null', isCollapsed: false },
//   { id: "p041", treeId: "tree001", name: "Spouse for GC-D1", gender: "male", dob: "1991-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p041", role:'null', isCollapsed: false },
//   { id: "p042", treeId: "tree001", name: "Spouse for GC1-S2", gender: "female", dob: "1995-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p042", role:'null', isCollapsed: false },
  
//   // Generation 4 - 5 people
//   { id: "p050", treeId: "tree001", name: "GGC from S1", gender: "male", dob: "2015-01-01", dod: "2020-05-04", photoUrl: "https://i.pravatar.cc/150?u=p050", role:'null', isCollapsed: false },
//   { id: "p051", treeId: "tree001", name: "GGC from D1", gender: "female", dob: "2016-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p051", role:'null', isCollapsed: false },
//   { id: "p052", treeId: "tree001", name: "GGC2 from D1", gender: "male", dob: "2018-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p052", role:'null', isCollapsed: false },
//   { id: "p053", treeId: "tree001", name: "GGC from S2", gender: "female", dob: "2017-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p053", role:'null', isCollapsed: false },
//   { id: "p054", treeId: "tree001", name: "GGC2 from S2", gender: "male", dob: "2019-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p054", role:'null', isCollapsed: false },

//   // Gen 4 Spouses - 3 people
//   { id: "p060", treeId: "tree001", name: "Spouse for GGC-S1", gender: "female", dob: "2016-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p060", role:'null', isCollapsed: false },
//   { id: "p061", treeId: "tree001", name: "Spouse for GGC-D1", gender: "male", dob: "2015-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p061", role:'null', isCollapsed: false },
//   { id: "p062", treeId: "tree001", name: "Spouse for GGC-S2", gender: "female", dob: "2018-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p062", role:'null', isCollapsed: false },

//   // Generation 5 - 4 people
//   { id: "p070", treeId: "tree001", name: "GGGC from S1", gender: "female", dob: "2040-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p070", role:'null', isCollapsed: false },
//   { id: "p071", treeId: "tree001", name: "GGGC from D1", gender: "male", dob: "2042-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p071", role:'null', isCollapsed: false },
//   { id: "p072", treeId: "tree001", name: "GGGC2 from D1", gender: "female", dob: "2044-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p072", role:'null', isCollapsed: false },
//   { id: "p073", treeId: "tree001", name: "GGGC from S2", gender: "male", dob: "2045-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p073", role:'null', isCollapsed: false },

//   // Gen 5 Spouses - 2 people
//   { id: "p080", treeId: "tree001", name: "Spouse for GGGC-S1", gender: "male", dob: "2040-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p080", role:'null', isCollapsed: false },
//   { id: "p081", treeId: "tree001", name: "Spouse for GGGC-D1", gender: "female", dob: "2041-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p081", role:'null', isCollapsed: false },

//   // Generation 6 - 2 people
//   { id: "p090", treeId: "tree001", name: "GGGGC from S1", gender: "male", dob: "2065-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p090", role:'null', isCollapsed: false },
//   { id: "p091", treeId: "tree001", name: "GGGGC from D1", gender: "female", dob: "2066-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p091", role:'null', isCollapsed: false },

//   // Generation 7 - 1 person
//   { id: "p100", treeId: "tree001", name: "Final Descendant", gender: "female", dob: "2090-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p100", role:'null', isCollapsed: false },

//   // People from the 60-node set
//   { id: "p130", treeId: "tree001", name: "Spouse for D3", gender: "male", dob: "1974-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p130", role:'null', isCollapsed: false },
//   { id: "p131", treeId: "tree001", name: "GC from D3", gender: "female", dob: "2000-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p131", role:'null', isCollapsed: false },
//   { id: "p132", treeId: "tree001", name: "GC2 from D3", gender: "male", dob: "2002-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p132", role:'null', isCollapsed: false },
//   { id: "p133", treeId: "tree001", name: "Wife 1 for GGC2-D1", gender: "female", dob: "2018-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p133", role:'null', isCollapsed: false },
//   { id: "p134", treeId: "tree001", name: "Wife 2 for GGC2-D1", gender: "female", dob: "2020-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p134", role:'null', isCollapsed: false },
//   { id: "p135", treeId: "tree001", name: "Child of GGC2-D1", gender: "male", dob: "2045-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p135", role:'null', isCollapsed: false },
//   { id: "p136", treeId: "tree001", name: "Child of GGGGC-D1", gender: "male", dob: "2092-01-01", dod: "3000-05-12", photoUrl: "https://i.pravatar.cc/150?u=p136", role:'null', isCollapsed: false },

//   // ✨ NEW SPOUSES TO REMOVE SINGLE PARENTHOOD - 4 people
//   { id: "p200", treeId: "tree001", name: "Wife 3 for S2", gender: "female", dob: "1973-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p200", role:'null', isCollapsed: false },
//   { id: "p201", treeId: "tree001", name: "Spouse for D2", gender: "male", dob: "1969-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p201", role:'null', isCollapsed: false },
//   { id: "p202", treeId: "tree001", name: "Spouse for GGGGC-D1", gender: "male", dob: "2065-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p202", role:'null', isCollapsed: false },
//   { id: "p203", treeId: "tree001", name: "Spouse for Final D", gender: "male", dob: "2089-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p203", role:'null', isCollapsed: false },
 ];

export const marriages = [
  // Gen 1
  { id: "m001", treeId: "tree001", marriageType: "polygamous", husbandId: "p001", wives: [ { wifeId: "p002", childrenIds: ["p010", "p011"] }, { wifeId: "p003", childrenIds: ["p012", "p013", "p014", "p015"] } ] },
  // Gen 2
  // { id: "m002", treeId: "tree001", marriageType: "monogamous", spouses: ["p010", "p020"], childrenIds: ["p030"] },
  // { id: "m003", treeId: "tree001", marriageType: "monogamous", spouses: ["p011", "p021"], childrenIds: ["p031"] },
  // // // ✨ MODIFIED: Unknown wife replaced with a known person
  // { id: "m004", treeId: "tree001", marriageType: "polygamous", husbandId: "p012", wives: [ { wifeId: "p022", childrenIds: ["p032", "p033"] }, { wifeId: "p023", childrenIds: ["p034"] }, { wifeId: "p200", childrenIds: [] } ] },
  // { id: "m005", treeId: "tree001", marriageType: "monogamous", spouses: ["p014", "p024"], childrenIds: [] },
  // // ✨ MODIFIED: Unknown spouse replaced with a known person
  // { id: "m006", treeId: "tree001", marriageType: "monogamous", spouses: ["p013", "p201"], childrenIds: ["p035"] },
  // // Gen 3
  // { id: "m007", treeId: "tree001", marriageType: "monogamous", spouses: ["p030", "p040"], childrenIds: ["p050"] },
  // { id: "m008", treeId: "tree001", marriageType: "monogamous", spouses: ["p031", "p041"], childrenIds: ["p051", "p052"] },
  // { id: "m009", treeId: "tree001", marriageType: "monogamous", spouses: ["p032", "p042"], childrenIds: ["p053", "p054"] },
  // // Gen 4
  // { id: "m010", treeId: "tree001", marriageType: "monogamous", spouses: ["p050", "p060"], childrenIds: ["p070"] },
  // { id: "m011", treeId: "tree001", marriageType: "monogamous", spouses: ["p051", "p061"], childrenIds: ["p071", "p072"] },
  // { id: "m012", treeId: "tree001", marriageType: "monogamous", spouses: ["p053", "p062"], childrenIds: ["p073"] },
  // // Gen 5
  // { id: "m013", treeId: "tree001", marriageType: "monogamous", spouses: ["p070", "p080"], childrenIds: ["p090"] },
  // { id: "m014", treeId: "tree001", marriageType: "monogamous", spouses: ["p071", "p081"], childrenIds: ["p091"] },
  // // Gen 6
  // // ✨ MODIFIED: Unknown spouse replaced with a known person
  // { id: "m015", treeId: "tree001", marriageType: "monogamous", spouses: ["p091", "p202"], childrenIds: ["p100"] },
  
  // // Marriages from the 60-node set
  // { id: "m016", treeId: "tree001", marriageType: "monogamous", spouses: ["p015", "p130"], childrenIds: ["p131", "p132"] },
  // { id: "m017", treeId: "tree001", marriageType: "polygamous", husbandId: "p052", wives: [ { wifeId: "p133", childrenIds: ["p135"] }, { wifeId: "p134", childrenIds: [] } ] },
  // // ✨ MODIFIED: Unknown spouse replaced with a known person
  // { id: "m018", treeId: "tree001", marriageType: "monogamous", spouses: ["p100", "p203"], childrenIds: ["p136"] },
  // { id: "m019", treeId: "tree001", marriageType: "monogamous", spouses: ["p073", "p137"], childrenIds: [] },
  // { id: "m022", treeId: "tree001", marriageType: "monogamous", spouses: ["p090", ""], childrenIds: [] }, // Kept one single parent for testing the placeholder
];