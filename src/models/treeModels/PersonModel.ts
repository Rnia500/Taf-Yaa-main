// src/models/people.ts

export interface Person {
  id: string;
  treeId: string;
  name: string;
  gender: "male" | "female";
  dob?: string | null;          
  dod?: string | null;          
  photoUrl?: string | null;
  bio?: string;
  tribe?: string;
  language?: string;
  linkedUserId?: string | null; // If linked to a user account
  isDeceased: boolean;
  publicConsent: boolean;
  createdAt: string;            
  updatedAt: string;            
}

// --- Helpers ---

/** Returns the calculated age or null if dob is missing */
export const getAge = (person: Person): number | null => {
  if (!person.dob) return null;
  const dob = new Date(person.dob);
  const dod = person.dod ? new Date(person.dod) : new Date();
  let age = dod.getFullYear() - dob.getFullYear();

  const hasHadBirthday =
    dod.getMonth() > dob.getMonth() ||
    (dod.getMonth() === dob.getMonth() && dod.getDate() >= dob.getDate());

  if (!hasHadBirthday) age--;

  return age >= 0 ? age : null;
};

/** Quick check if person is alive */
export const isAlive = (person: Person): boolean =>
  !person.isDeceased && !person.dod;
