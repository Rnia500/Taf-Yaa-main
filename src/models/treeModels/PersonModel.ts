// src/models/people.ts

export interface Person {
  id: string;  
  treeId: string; 
  name: string;
  gender: "male" | "female";
  dob?: string | null;          
  dod?: string | null;
  nationality?: string | null; 
  countryOfResidence?: string | null;
  placeOfBirth?: string | null;
  placeOfDeath?: string | null;          
  photoUrl?: string | null;
  phoneNumber?:string | null;
  email?:string | null;
  bio?: string;
  tribe?: string;
  language?: string;
  linkedUserId?: string | null; 
  isDeceased: boolean;
  isSpouse: boolean;
  allowGlobalMatching?: boolean;
  privacyLevel: "public" | "membersOnly" | "authenticated" | "private";
  isPlaceholder?: boolean;      
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

/** Get the human-readable label for a privacy level */
export const getPrivacyLabel = (privacyLevel: string): string => {
  const privacyOptions = [
    { value: 'private', label: 'Only Me (Highest Privacy)' },
    { value: 'membersOnly', label: 'Family Members Only' },
    { value: 'authenticated', label: 'Registered Users' },
    { value: 'public', label: 'Public (Lowest Privacy)' }
  ];

  const option = privacyOptions.find(opt => opt.value === privacyLevel);
  return option ? option.label : 'Unknown';
};

/** Get the human-readable label for a country code */
import countryList from 'react-select-country-list';

export const getCountryLabel = (countryCode?: string | null): string => {
  if (!countryCode) return 'Unknown';

  try {
  const countries = countryList()?.getData() || [];
    const code = String(countryCode).trim();
    const country = countries.find(c => c.value === code || c.value.toLowerCase() === code.toLowerCase());
    return country ? country.label : code;
  } catch (error) {
    // If the package is not available or something else goes wrong, return the code as a fallback.
    return String(countryCode);
  }
};


