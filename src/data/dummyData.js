// // src/data/dummyData.js

// export const people = [
//     // Generation 1 (Founder) - 3 people
//     { id: "p001", treeId: "tree001", name: "Patriarch Adam", gender: "male", dob: "1930-01-01", dod: "2010-01-01", photoUrl: "https://i.pravatar.cc/150?u=p001", isCollapsed: false },
//     { id: "p002", treeId: "tree001", name: "Eve Adam", gender: "female", dob: "1935-01-01", dod: "2015-01-01", photoUrl: "https://i.pravatar.cc/150?u=p002", isCollapsed: false },
//     { id: "p003", treeId: "tree001", name: "Hawa Adam", gender: "female", dob: "1938-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p003", isCollapsed: false },

//     // Generation 2 - 9 people
//     { id: "p010", treeId: "tree001", name: "Isaac Adam", gender: "male", dob: "1955-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p010", isCollapsed: false },
//     { id: "p011", treeId: "tree001", name: "Jacob Adam", gender: "male", dob: "1958-02-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p011", isCollapsed: false },
//     { id: "p012", treeId: "tree001", name: "Sarah Adam", gender: "female", dob: "1960-05-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p012", isCollapsed: false },
//     { id: "p014", treeId: "tree001", name: "Leah Adam", gender: "female", dob: "1965-07-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p014", isCollapsed: false },
//     { id: "p020", treeId: "tree001", name: "Miriam Isaac", gender: "female", dob: "1960-02-02", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p020", isCollapsed: false },
//     { id: "p021", treeId: "tree001", name: "Hannah Jacob", gender: "female", dob: "1963-03-03", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p021", isCollapsed: false },
//     { id: "p022", treeId: "tree001", name: "Rachel Jacob", gender: "female", dob: "1964-04-04", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p022", isCollapsed: false },
//     { id: "p023", treeId: "tree001", name: "Aaron Cohen", gender: "male", dob: "1959-05-05", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p023", isCollapsed: false },
//     { id: "p025", treeId: "tree001", name: "Abigail Leah", gender: "female", dob: "1968-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p025", isCollapsed: false },

//     // Generation 3 - 17 people
//     { id: "p030", treeId: "tree001", name: "David Isaac", gender: "male", dob: "1980-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p030", isCollapsed: false },
//     { id: "p031", treeId: "tree001", name: "Naomi Isaac", gender: "female", dob: "1982-02-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p031", isCollapsed: false },
//     { id: "p033", treeId: "tree001", name: "Samuel Jacob", gender: "male", dob: "1983-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p033", isCollapsed: false },
//     { id: "p035", treeId: "tree001", name: "Ezekiel Jacob", gender: "male", dob: "1986-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p035", isCollapsed: false },
//     { id: "p037", treeId: "tree001", name: "Isaiah Aaron", gender: "male", dob: "1982-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p037", isCollapsed: false },
//     { id: "p040", treeId: "tree001", name: "Miriam Leah", gender: "female", dob: "1988-08-08", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p040", isCollapsed: false },
//     { id: "p120", treeId: "tree001", name: "Esther Isaac", gender: "female", dob: "1984-03-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p120", isCollapsed: false },
//     { id: "p121", treeId: "tree001", name: "Martha Jacob", gender: "female", dob: "1985-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p121", isCollapsed: false },
//     { id: "p041", treeId: "tree001", name: "Bathsheba David", gender: "female", dob: "1981-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p041", isCollapsed: false },
//     { id: "p042", treeId: "tree001", name: "Jezebel Samuel", gender: "female", dob: "1984-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p042", isCollapsed: false },
//     { id: "p043", treeId: "tree001", name: "Delilah Samuel", gender: "female", dob: "1986-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p043", isCollapsed: false },
//     { id: "p044", treeId: "tree001", name: "Judith Ezekiel", gender: "female", dob: "1987-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p044", isCollapsed: false },
//     { id: "p045", treeId: "tree001", name: "Tamar Isaiah", gender: "female", dob: "1983-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p045", isCollapsed: false },
//     { id: "p046", treeId: "tree001", name: "Boaz Naomi", gender: "male", dob: "1981-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p046", isCollapsed: false },
//     { id: "p130", treeId: "tree001", name: "Mordecai Esther", gender: "male", dob: "1983-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p130", isCollapsed: false },
//     { id: "p131", treeId: "tree001", name: "Lazarus Martha", gender: "male", dob: "1984-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p131", isCollapsed: false },
//     { id: "p047", treeId: "tree001", name: "Joseph Miriam", gender: "male", dob: "1987-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p047", isCollapsed: false },

//     // Generation 4 - 21 people
//     { id: "p050", treeId: "tree001", name: "Solomon David", gender: "male", dob: "2005-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p050", isCollapsed: false },
//     { id: "p051", treeId: "tree001", name: "Dinah David", gender: "female", dob: "2007-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p051", isCollapsed: false },
//     { id: "p052", treeId: "tree001", name: "Absalom Samuel", gender: "male", dob: "2006-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p052", isCollapsed: false },
//     { id: "p053", treeId: "tree001", name: "Gideon Samuel", gender: "male", dob: "2008-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p053", isCollapsed: false },
//     { id: "p054", treeId: "tree001", name: "Job Ezekiel", gender: "male", dob: "2010-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p054", isCollapsed: false },
//     { id: "p055", treeId: "tree001", name: "Hosea Isaiah", gender: "male", dob: "2009-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p055", isCollapsed: false },
//     { id: "p056", treeId: "tree001", name: "Amos Boaz", gender: "male", dob: "2010-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p056", isCollapsed: false },
//     { id: "p057", treeId: "tree001", name: "Micah Boaz", gender: "male", dob: "2012-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p057", isCollapsed: false },
//     { id: "p140", treeId: "tree001", name: "Hadassah Esther", gender: "female", dob: "2010-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p140", isCollapsed: false },
//     { id: "p141", treeId: "tree001", name: "Mary Martha", gender: "female", dob: "2011-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p141", isCollapsed: false },
//     { id: "p060", treeId: "tree001", name: "Queen Sheba", gender: "female", dob: "2006-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p060", isCollapsed: false },
//     { id: "p061", treeId: "tree001", name: "Zipporah Absalom", gender: "female", dob: "2007-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p061", isCollapsed: false },
//     { id: "p062", treeId: "tree001", name: "Gomer Hosea", gender: "female", dob: "2010-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p062", isCollapsed: false },
//     { id: "p063", treeId: "tree001", name: "Peninnah Micah", gender: "female", dob: "2013-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p063", isCollapsed: false },
//     { id: "p064", treeId: "tree001", name: "Keturah Micah", gender: "female", dob: "2015-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p064", isCollapsed: false },
//     { id: "p065", treeId: "tree001", name: "Orpah Gideon", gender: "female", dob: "2009-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p065", isCollapsed: false },
//     { id: "p066", treeId: "tree001", name: "Rizpah Gideon", gender: "female", dob: "2011-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p066", isCollapsed: false },
//     { id: "p067", treeId: "tree001", name: "Xerxes Dinah", gender: "male", dob: "2006-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p067", isCollapsed: false },
//     { id: "p068", treeId: "tree001", name: "Cyrus Hadassah", gender: "male", dob: "2009-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p068", isCollapsed: false },
//     { id: "p069", treeId: "tree001", name: "Darius Mary", gender: "male", dob: "2010-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p069", isCollapsed: false },
//     { id: "p058", treeId: "tree001", name: "Jonah Joseph", gender: "male", dob: "2012-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p058", isCollapsed: false },

//     // Generation 5 - 28 people
//     { id: "p070", treeId: "tree001", name: "Rehoboam Solomon", gender: "male", dob: "2030-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p070", isCollapsed: false },
//     { id: "p071", treeId: "tree001", name: "Abijah Solomon", gender: "female", dob: "2032-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p071", isCollapsed: false },
//     { id: "p072", treeId: "tree001", name: "Jeroboam Absalom", gender: "male", dob: "2031-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p072", isCollapsed: false },
//     { id: "p073", treeId: "tree001", name: "Nahum Hosea", gender: "male", dob: "2033-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p073", isCollapsed: false },
//     { id: "p074", treeId: "tree001", name: "Zephaniah Micah", gender: "male", dob: "2035-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p074", isCollapsed: false },
//     { id: "p075", treeId: "tree001", name: "Haggai Micah", gender: "male", dob: "2037-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p075", isCollapsed: false },
//     { id: "p076", treeId: "tree001", name: "Malachi Micah", gender: "male", dob: "2040-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p076", isCollapsed: false },
//     { id: "p077", treeId: "tree001", name: "Cain Gideon", gender: "male", dob: "2032-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p077", isCollapsed: false },
//     { id: "p078", treeId: "tree001", name: "Abel Gideon", gender: "male", dob: "2034-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p078", isCollapsed: false },
//     { id: "p079", treeId: "tree001", name: "Seth Gideon", gender: "male", dob: "2036-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p079", isCollapsed: false },
//     { id: "p084", treeId: "tree001", name: "Zillah Dinah", gender: "female", dob: "2030-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p084", isCollapsed: false },
//     { id: "p080", treeId: "tree001", name: "Michaiah Rehoboam", gender: "female", dob: "2031-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p080", isCollapsed: false },
//     { id: "p081", treeId: "tree001", name: "Maacah Abijah", gender: "male", dob: "2032-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p081", isCollapsed: false },
//     { id: "p082", treeId: "tree001", name: "Jemima Nahum", gender: "female", dob: "2034-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p082", isCollapsed: false },
//     { id: "p083", treeId: "tree001", name: "Keziah Haggai", gender: "female", dob: "2038-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p083", isCollapsed: false },
//     { id: "p085", treeId: "tree001", name: "Adah Cain", gender: "female", dob: "2033-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p085", isCollapsed: false },
//     { id: "p086", treeId: "tree001", name: "Bilhah Abel", gender: "female", dob: "2035-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p086", isCollapsed: false },
//     { id: "p087", treeId: "tree001", name: "Zilpah Seth", gender: "female", dob: "2037-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p087", isCollapsed: false },
//     { id: "p088", treeId: "tree001", name: "Asenath Seth", gender: "female", dob: "2039-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p088", isCollapsed: false },
//     { id: "p089", treeId: "tree001", name: "Vashti Cyrus", gender: "female", dob: "2032-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p089", isCollapsed: false },

//     // Generation 6 - 27 people
//     { id: "p090", treeId: "tree001", name: "Asa Rehoboam", gender: "male", dob: "2055-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p090", isCollapsed: false },
//     { id: "p091", treeId: "tree001", name: "Jehoshaphat Abijah", gender: "male", dob: "2056-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p091", isCollapsed: false },
//     { id: "p092", treeId: "tree001", name: "Jehoram Abijah", gender: "male", dob: "2058-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p092", isCollapsed: false },
//     { id: "p093", treeId: "tree001", name: "Ahaziah Nahum", gender: "male", dob: "2057-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p093", isCollapsed: false },
//     { id: "p094", treeId: "tree001", name: "Joash Haggai", gender: "male", dob: "2060-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p094", isCollapsed: false },
//     { id: "p095", treeId: "tree001", name: "Enoch Cain", gender: "male", dob: "2055-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p095", isCollapsed: false },
//     { id: "p096", treeId: "tree001", name: "Irad Abel", gender: "male", dob: "2056-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p096", isCollapsed: false },
//     { id: "p097", treeId: "tree001", name: "Mehujael Seth", gender: "male", dob: "2058-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p097", isCollapsed: false },
//     { id: "p098", treeId: "tree001", name: "Methushael Seth", gender: "male", dob: "2060-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p098", isCollapsed: false },
//     { id: "p099", treeId: "tree001", name: "Lamech Seth", gender: "male", dob: "2062-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p099", isCollapsed: false },
//     { id: "p100", treeId: "tree001", name: "Azubah Asa", gender: "female", dob: "2056-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p100", isCollapsed: false },
//     { id: "p101", treeId: "tree001", name: "Athaliah Jehoram", gender: "female", dob: "2059-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p101", isCollapsed: false },
//     { id: "p102", treeId: "tree001", name: "Zibiah Joash", gender: "female", dob: "2061-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p102", isCollapsed: false },
//     { id: "p103", treeId: "tree001", name: "Jecoliah Joash", gender: "female", dob: "2063-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p103", isCollapsed: false },
//     { id: "p104", treeId: "tree001", name: "Naamah Enoch", gender: "female", dob: "2056-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p104", isCollapsed: false },
//     { id: "p105", treeId: "tree001", name: "Milcah Irad", gender: "female", dob: "2057-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p105", isCollapsed: false },

//     // Generation 7 - 25 people
//     { id: "p110", treeId: "tree001", name: "Uzziah Asa", gender: "male", dob: "2078-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p110", isCollapsed: false },
//     { id: "p111", treeId: "tree001", name: "Jotham Jehoram", gender: "male", dob: "2080-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p111", isCollapsed: false },
//     { id: "p112", treeId: "tree001", name: "Ahaz Joash", gender: "male", dob: "2082-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p112", isCollapsed: false },
//     { id: "p113", treeId: "tree001", name: "Hezekiah Joash", gender: "male", dob: "2084-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p113", isCollapsed: false },
//     { id: "p114", treeId: "tree001", name: "Jabal Enoch", gender: "male", dob: "2077-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p114", isCollapsed: false },
//     { id: "p115", treeId: "tree001", name: "Jubal Enoch", gender: "male", dob: "2079-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p115", isCollapsed: false },
//     { id: "p116", treeId: "tree001", name: "Tubal-cain Irad", gender: "male", dob: "2081-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p116", isCollapsed: false },
//     { id: "p200", treeId: "tree001", name: "Jerusha Uzziah", gender: "female", dob: "2079-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p200", isCollapsed: false },
//     { id: "p201", treeId: "tree001", name: "Abi Ahaz", gender: "female", dob: "2083-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p201", isCollapsed: false },
//     { id: "p202", treeId: "tree001", name: "Hephzibah Hezekiah", gender: "female", dob: "2085-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p202", isCollapsed: false },
//     { id: "p203", treeId: "tree001", name: "Sarai Jotham", gender: "female", dob: "2081-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p203", isCollapsed: false },
//     { id: "p204", treeId: "tree001", name: "Hagar Jotham", gender: "female", dob: "2083-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p204", isCollapsed: false },

//     // Generation 8 - 14 people
//     { id: "p210", treeId: "tree001", name: "Manasseh Uzziah", gender: "male", dob: "2100-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p210", isCollapsed: false },
//     { id: "p211", treeId: "tree001", name: "Amon Ahaz", gender: "male", dob: "2102-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p211", isCollapsed: false },
//     { id: "p212", treeId: "tree001", name: "Josiah Hezekiah", gender: "male", dob: "2104-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p212", isCollapsed: false },
//     { id: "p213", treeId: "tree001", name: "Ishmael Jotham", gender: "male", dob: "2103-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p213", isCollapsed: false },
//     { id: "p214", treeId: "tree001", name: "Lot Jotham", gender: "male", dob: "2105-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p214", isCollapsed: false },
//     { id: "p220", treeId: "tree001", name: "Meshullemeth Manasseh", gender: "female", dob: "2101-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p220", isCollapsed: false },
//     { id: "p221", treeId: "tree001", name: "Jedidah Amon", gender: "female", dob: "2103-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p221", isCollapsed: false },
//     { id: "p222", treeId: "tree001", name: "Hamutal Josiah", gender: "female", dob: "2105-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p222", isCollapsed: false },
//     { id: "p223", treeId: "tree001", name: "Zebidah Josiah", gender: "female", dob: "2107-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p223", isCollapsed: false },
//     { id: "p224", treeId: "tree001", name: "Jehoahaz Josiah", gender: "male", dob: "2109-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p224", isCollapsed: false },
//     { id: "p225", treeId: "tree001", name: "Eliakim Josiah", gender: "male", dob: "2111-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p225", isCollapsed: false },
// ];

// export const marriages = [
//   // Gen 1
//   {
//     id: "m001",
//     treeId: "tree001",
//     marriageType: "polygamous",
//     husbandId: "p001",
//     wives: [
//       { wifeId: "p002", childrenIds: ["p010", "p012"] },
//       { wifeId: "p003", childrenIds: ["p011", "p014"] }
//     ]
//   },
//   // Gen 2
//   { id: "m002", treeId: "tree001", marriageType: "monogamous", spouses: ["p010", "p020"], childrenIds: ["p030", "p031", "p120"] },
//   { id: "m003", treeId: "tree001", marriageType: "polygamous", husbandId: "p011", wives: [ { wifeId: "p021", childrenIds: ["p033", "p121"] }, { wifeId: "p022", childrenIds: ["p035"] } ] },
//   { id: "m004", treeId: "tree001", marriageType: "monogamous", spouses: ["p012", "p023"], childrenIds: ["p037"] },
//   { id: "m005", treeId: "tree001", marriageType: "monogamous", spouses: ["p014", "p025"], childrenIds: ["p040"] },
//   // Gen 3
//   { id: "m006", treeId: "tree001", marriageType: "monogamous", spouses: ["p030", "p041"], childrenIds: ["p050", "p051"] },
//   { id: "m007", treeId: "tree001", marriageType: "polygamous", husbandId: "p033", wives: [ { wifeId: "p042", childrenIds: ["p052"] }, { wifeId: "p043", childrenIds: ["p053"] } ] },
//   { id: "m008", treeId: "tree001", marriageType: "monogamous", spouses: ["p035", "p044"], childrenIds: [] },
//   { id: "m009", treeId: "tree001", marriageType: "monogamous", spouses: ["p037", "p045"], childrenIds: ["p055"] },
//   { id: "m010", treeId: "tree001", marriageType: "monogamous", spouses: ["p031", "p046"], childrenIds: ["p056", "p057"] },
//   { id: "m011", treeId: "tree001", marriageType: "monogamous", spouses: ["p120", "p130"], childrenIds: ["p140"] },
//   { id: "m012", treeId: "tree001", marriageType: "monogamous", spouses: ["p121", "p131"], childrenIds: ["p141"] },
//   { id: "m012b", treeId: "tree001", marriageType: "monogamous", spouses: ["p040", "p047"], childrenIds: ["p058"]},
//   // Gen 4
//   { id: "m013", treeId: "tree001", marriageType: "monogamous", spouses: ["p050", "p060"], childrenIds: ["p070", "p071"] },
//   { id: "m014", treeId: "tree001", marriageType: "monogamous", spouses: ["p052", "p061"], childrenIds: [] },
//   { id: "m015", treeId: "tree001", marriageType: "monogamous", spouses: ["p055", "p062"], childrenIds: ["p073"] },
//   { id: "m016", treeId: "tree001", marriageType: "polygamous", husbandId: "p057", wives: [ { wifeId: "p063", childrenIds: ["p074", "p075"] }, { wifeId: "p064", childrenIds: ["p076"] } ] },
//   { id: "m017", treeId: "tree001", marriageType: "polygamous", husbandId: "p053", wives: [ { wifeId: "p065", childrenIds: ["p077", "p078"] }, { wifeId: "p066", childrenIds: ["p079"] } ] },
//   { id: "m018", treeId: "tree001", marriageType: "monogamous", spouses: ["p051", "p067"], childrenIds: ["p084"] },
//   { id: "m018b", treeId: "tree001", marriageType: "monogamous", spouses: ["p140", "p068"], childrenIds: [] },
//   { id: "m018c", treeId: "tree001", marriageType: "monogamous", spouses: ["p141", "p069"], childrenIds: [] },
//   // Gen 5
//   { id: "m019", treeId: "tree001", marriageType: "monogamous", spouses: ["p070", "p080"], childrenIds: ["p090"] },
//   { id: "m020", treeId: "tree001", marriageType: "monogamous", spouses: ["p071", "p081"], childrenIds: ["p091", "p092"] },
//   { id: "m021", treeId: "tree001", marriageType: "monogamous", spouses: ["p073", "p082"], childrenIds: ["p093"] },
//   { id: "m022", treeId: "tree001", marriageType: "monogamous", spouses: ["p075", "p083"], childrenIds: [] },
//   { id: "m023", treeId: "tree001", marriageType: "monogamous", spouses: ["p077", "p085"], childrenIds: ["p095"] },
//   { id: "m024", treeId: "tree001", marriageType: "monogamous", spouses: ["p078", "p086"], childrenIds: ["p096"] },
//   { id: "m025", treeId: "tree001", marriageType: "polygamous", husbandId: "p079", wives: [ { wifeId: "p087", childrenIds: ["p097", "p098"] }, { wifeId: "p088", childrenIds: ["p099"] } ] },
//   { id: "m025b", treeId: "tree001", marriageType: "monogamous", spouses: ["p084", "p089"], childrenIds: [] },
//   // Gen 6
//   { id: "m026", treeId: "tree001", marriageType: "monogamous", spouses: ["p090", "p100"], childrenIds: ["p110"] },
//   { id: "m027", treeId: "tree001", marriageType: "monogamous", spouses: ["p092", "p101"], childrenIds: ["p111"] },
//   { id: "m028", treeId: "tree001", marriageType: "polygamous", husbandId: "p094", wives: [ { wifeId: "p102", childrenIds: ["p112"] }, { wifeId: "p103", childrenIds: ["p113"] } ] },
//   { id: "m029", treeId: "tree001", marriageType: "monogamous", spouses: ["p095", "p104"], childrenIds: ["p114", "p115"] },
//   { id: "m030", treeId: "tree001", marriageType: "monogamous", spouses: ["p096", "p105"], childrenIds: ["p116"] },
//   // Gen 7
//   { id: "m031", treeId: "tree001", marriageType: "monogamous", spouses: ["p110", "p200"], childrenIds: ["p210"] },
//   { id: "m032", treeId: "tree001", marriageType: "monogamous", spouses: ["p112", "p201"], childrenIds: ["p211"] },
//   { id: "m033", treeId: "tree001", marriageType: "monogamous", spouses: ["p113", "p202"], childrenIds: ["p212"] },
//   { id: "m034", treeId: "tree001", marriageType: "polygamous", husbandId: "p111", wives: [ { wifeId: "p203", childrenIds: ["p213"] }, { wifeId: "p204", childrenIds: ["p214"] } ] },
//   // Gen 8
//   { id: "m035", treeId: "tree001", marriageType: "monogamous", spouses: ["p210", "p220"], childrenIds: [] },
//   { id: "m036", treeId: "tree001", marriageType: "monogamous", spouses: ["p211", "p221"], childrenIds: [] },
//   { id: "m037", treeId: "tree001", marriageType: "polygamous", husbandId: "p212", wives: [ { wifeId: "p222", childrenIds: ["p224"] }, { wifeId: "p223", childrenIds: ["p225"] } ] }
// ];




// // src/data/dummyData.js

// src/data/dummyData.js

export const people = [
  // Generation 1 (Founder) - 3 people
  { id: "p001", treeId: "tree001", name: "Founder F1", gender: "male", dob: "1940-01-01", dod: "2020-01-01", photoUrl: "https://i.pravatar.cc/150?u=p001", isCollapsed: false },
  { id: "p002", treeId: "tree001", name: "Wife W1", gender: "female", dob: "1942-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p002", isCollapsed: false },
  { id: "p003", treeId: "tree001", name: "Wife W2", gender: "female", dob: "1945-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p003", isCollapsed: false },

  // Generation 2 - 6 people
  { id: "p010", treeId: "tree001", name: "Son S1", gender: "male", dob: "1965-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p010", isCollapsed: false },
  { id: "p011", treeId: "tree001", name: "Daughter D1", gender: "female", dob: "1967-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p011", isCollapsed: false },
  { id: "p012", treeId: "tree001", name: "Son S2", gender: "male", dob: "1968-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p012", isCollapsed: false },
  { id: "p013", treeId: "tree001", name: "Daughter D2", gender: "female", dob: "1970-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p013", isCollapsed: false },
  { id: "p014", treeId: "tree001", name: "Son S3", gender: "male", dob: "1972-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p014", isCollapsed: false },
  { id: "p015", treeId: "tree001", name: "Daughter D3", gender: "female", dob: "1975-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p015", isCollapsed: false },

  // Gen 2 Spouses - 5 people
  { id: "p020", treeId: "tree001", name: "Spouse for S1", gender: "female", dob: "1966-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p020", isCollapsed: false },
  { id: "p021", treeId: "tree001", name: "Spouse for D1", gender: "male", dob: "1966-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p021", isCollapsed: false },
  { id: "p022", treeId: "tree001", name: "Wife 1 for S2", gender: "female", dob: "1969-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p022", isCollapsed: false },
  { id: "p023", treeId: "tree001", name: "Wife 2 for S2", gender: "female", dob: "1971-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p023", isCollapsed: false },
  { id: "p024", treeId: "tree001", name: "Spouse for S3", gender: "female", dob: "1973-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p024", isCollapsed: false },

  // Generation 3 - 6 people
  { id: "p030", treeId: "tree001", name: "GC from S1", gender: "male", dob: "1990-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p030", isCollapsed: false },
  { id: "p031", treeId: "tree001", name: "GC from D1", gender: "female", dob: "1992-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p031", isCollapsed: false },
  { id: "p032", treeId: "tree001", name: "GC1 from S2", gender: "male", dob: "1994-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p032", isCollapsed: false },
  { id: "p033", treeId: "tree001", name: "GC2 from S2", gender: "female", dob: "1996-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p033", isCollapsed: false },
  { id: "p034", treeId: "tree001", name: "GC3 from S2", gender: "male", dob: "1998-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p034", isCollapsed: false },
  { id: "p035", treeId: "tree001", name: "GC from D2", gender: "male", dob: "1995-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p035", isCollapsed: false },

  // Gen 3 Spouses - 3 people
  { id: "p040", treeId: "tree001", name: "Spouse for GC-S1", gender: "female", dob: "1991-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p040", isCollapsed: false },
  { id: "p041", treeId: "tree001", name: "Spouse for GC-D1", gender: "male", dob: "1991-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p041", isCollapsed: false },
  { id: "p042", treeId: "tree001", name: "Spouse for GC1-S2", gender: "female", dob: "1995-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p042", isCollapsed: false },
  
  // Generation 4 - 5 people
  { id: "p050", treeId: "tree001", name: "GGC from S1", gender: "male", dob: "2015-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p050", isCollapsed: false },
  { id: "p051", treeId: "tree001", name: "GGC from D1", gender: "female", dob: "2016-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p051", isCollapsed: false },
  { id: "p052", treeId: "tree001", name: "GGC2 from D1", gender: "male", dob: "2018-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p052", isCollapsed: false },
  { id: "p053", treeId: "tree001", name: "GGC from S2", gender: "female", dob: "2017-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p053", isCollapsed: false },
  { id: "p054", treeId: "tree001", name: "GGC2 from S2", gender: "male", dob: "2019-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p054", isCollapsed: false },
  
  // Gen 4 Spouses - 3 people
  { id: "p060", treeId: "tree001", name: "Spouse for GGC-S1", gender: "female", dob: "2016-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p060", isCollapsed: false },
  { id: "p061", treeId: "tree001", name: "Spouse for GGC-D1", gender: "male", dob: "2015-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p061", isCollapsed: false },
  { id: "p062", treeId: "tree001", name: "Spouse for GGC-S2", gender: "female", dob: "2018-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p062", isCollapsed: false },

  // Generation 5 - 4 people
  { id: "p070", treeId: "tree001", name: "GGGC from S1", gender: "female", dob: "2040-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p070", isCollapsed: false },
  { id: "p071", treeId: "tree001", name: "GGGC from D1", gender: "male", dob: "2042-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p071", isCollapsed: false },
  { id: "p072", treeId: "tree001", name: "GGGC2 from D1", gender: "female", dob: "2044-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p072", isCollapsed: false },
  { id: "p073", treeId: "tree001", name: "GGGC from S2", gender: "male", dob: "2045-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p073", isCollapsed: false },

  // Gen 5 Spouses - 2 people
  { id: "p080", treeId: "tree001", name: "Spouse for GGGC-S1", gender: "male", dob: "2040-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p080", isCollapsed: false },
  { id: "p081", treeId: "tree001", name: "Spouse for GGGC-D1", gender: "female", dob: "2041-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p081", isCollapsed: false },

  // Generation 6 - 2 people
  { id: "p090", treeId: "tree001", name: "GGGGC from S1", gender: "male", dob: "2065-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p090", isCollapsed: false },
  { id: "p091", treeId: "tree001", name: "GGGGC from D1", gender: "female", dob: "2066-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p091", isCollapsed: false },

  // Generation 7 - 1 person
  { id: "p100", treeId: "tree001", name: "Final Descendant", gender: "female", dob: "2090-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p100", isCollapsed: false },
  
  // People from the 60-node set
  { id: "p130", treeId: "tree001", name: "Spouse for D3", gender: "male", dob: "1974-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p130", isCollapsed: false },
  { id: "p131", treeId: "tree001", name: "GC from D3", gender: "female", dob: "2000-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p131", isCollapsed: false },
  { id: "p132", treeId: "tree001", name: "GC2 from D3", gender: "male", dob: "2002-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p132", isCollapsed: false },
  { id: "p133", treeId: "tree001", name: "Wife 1 for GGC2-D1", gender: "female", dob: "2018-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p133", isCollapsed: false },
  { id: "p134", treeId: "tree001", name: "Wife 2 for GGC2-D1", gender: "female", dob: "2020-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p134", isCollapsed: false },
  { id: "p135", treeId: "tree001", name: "Child of GGC2-D1", gender: "male", dob: "2045-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p135", isCollapsed: false },
  { id: "p136", treeId: "tree001", name: "Child of GGGGC-D1", gender: "male", dob: "2092-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p136", isCollapsed: false },
  // { id: "p137", treeId: "tree001", name: "Spouse for GGGC-S2", gender: "female", dob: "2046-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p137", isCollapsed: false },
  // { id: "p138", treeId: "tree001", name: "Deepest Child", gender: "female", dob: "2120-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p138", isCollapsed: false },
  // { id: "p139", treeId: "tree001", name: "Spouse for Deepest", gender: "male", dob: "2119-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p139", isCollapsed: false },

  // ✨ NEW SPOUSES TO REMOVE SINGLE PARENTHOOD - 4 people
  { id: "p200", treeId: "tree001", name: "Wife 3 for S2", gender: "female", dob: "1973-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p200", isCollapsed: false },
  { id: "p201", treeId: "tree001", name: "Spouse for D2", gender: "male", dob: "1969-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p201", isCollapsed: false },
  { id: "p202", treeId: "tree001", name: "Spouse for GGGGC-D1", gender: "male", dob: "2065-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p202", isCollapsed: false },
  { id: "p203", treeId: "tree001", name: "Spouse for Final D", gender: "male", dob: "2089-01-01", dod: null, photoUrl: "https://i.pravatar.cc/150?u=p203", isCollapsed: false },
];

export const marriages = [
  // Gen 1
  { id: "m001", treeId: "tree001", marriageType: "polygamous", husbandId: "p001", wives: [ { wifeId: "p002", childrenIds: ["p010", "p011"] }, { wifeId: "p003", childrenIds: ["p012", "p013", "p014", "p015"] } ] },
  // Gen 2
  { id: "m002", treeId: "tree001", marriageType: "monogamous", spouses: ["p010", "p020"], childrenIds: ["p030"] },
  { id: "m003", treeId: "tree001", marriageType: "monogamous", spouses: ["p011", "p021"], childrenIds: ["p031"] },
  // ✨ MODIFIED: Unknown wife replaced with a known person
  { id: "m004", treeId: "tree001", marriageType: "polygamous", husbandId: "p012", wives: [ { wifeId: "p022", childrenIds: ["p032", "p033"] }, { wifeId: "p023", childrenIds: ["p034"] }, { wifeId: "p200", childrenIds: [] } ] },
  { id: "m005", treeId: "tree001", marriageType: "monogamous", spouses: ["p014", "p024"], childrenIds: [] },
  // ✨ MODIFIED: Unknown spouse replaced with a known person
  { id: "m006", treeId: "tree001", marriageType: "monogamous", spouses: ["p013", "p201"], childrenIds: ["p035"] },
  // Gen 3
  { id: "m007", treeId: "tree001", marriageType: "monogamous", spouses: ["p030", "p040"], childrenIds: ["p050"] },
  { id: "m008", treeId: "tree001", marriageType: "monogamous", spouses: ["p031", "p041"], childrenIds: ["p051", "p052"] },
  { id: "m009", treeId: "tree001", marriageType: "monogamous", spouses: ["p032", "p042"], childrenIds: ["p053", "p054"] },
  // Gen 4
  { id: "m010", treeId: "tree001", marriageType: "monogamous", spouses: ["p050", "p060"], childrenIds: ["p070"] },
  { id: "m011", treeId: "tree001", marriageType: "monogamous", spouses: ["p051", "p061"], childrenIds: ["p071", "p072"] },
  { id: "m012", treeId: "tree001", marriageType: "monogamous", spouses: ["p053", "p062"], childrenIds: ["p073"] },
  // Gen 5
  { id: "m013", treeId: "tree001", marriageType: "monogamous", spouses: ["p070", "p080"], childrenIds: ["p090"] },
  { id: "m014", treeId: "tree001", marriageType: "monogamous", spouses: ["p071", "p081"], childrenIds: ["p091"] },
  // Gen 6
  // ✨ MODIFIED: Unknown spouse replaced with a known person
  { id: "m015", treeId: "tree001", marriageType: "monogamous", spouses: ["p091", "p202"], childrenIds: ["p100"] },
  
  // Marriages from the 60-node set
  { id: "m016", treeId: "tree001", marriageType: "monogamous", spouses: ["p015", "p130"], childrenIds: ["p131", "p132"] },
  { id: "m017", treeId: "tree001", marriageType: "polygamous", husbandId: "p052", wives: [ { wifeId: "p133", childrenIds: ["p135"] }, { wifeId: "p134", childrenIds: [] } ] },
  // ✨ MODIFIED: Unknown spouse replaced with a known person
  { id: "m018", treeId: "tree001", marriageType: "monogamous", spouses: ["p100", "p203"], childrenIds: ["p136"] },
  { id: "m019", treeId: "tree001", marriageType: "monogamous", spouses: ["p073", "p137"], childrenIds: [] },
  // { id: "m021", treeId: "tree001", marriageType: "monogamous", spouses: ["p138", "p139"], childrenIds: [] },
  { id: "m022", treeId: "tree001", marriageType: "monogamous", spouses: ["p090", ""], childrenIds: [] }, // Kept one single parent for testing the placeholder
];