// src/services/data/marriageServiceFirebase.js

import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  arrayUnion,
  serverTimestamp,
  deleteField
} from 'firebase/firestore';
import { db } from '../../config/firebase.js';
import { generateId } from '../../utils/personUtils/idGenerator.js';

// Helper function to get current timestamp
const getCurrentTimestamp = () => serverTimestamp();

async function addMarriage(marriage) {
  try {
    // Check if marriage with same ID already exists
    const existingMarriage = await getMarriage(marriage.id);
    if (existingMarriage) {
      console.warn("marriageServiceFirebase.addMarriage -> duplicate marriage id detected:", marriage.id);
      marriage = { ...marriage, id: generateId("marriage") };
    }

    const marriageRef = doc(db, 'marriages', marriage.id);
    const marriageData = {
      ...marriage,
      active: true, // Add active field for better querying
      createdAt: getCurrentTimestamp(),
      updatedAt: getCurrentTimestamp()
    };

    await setDoc(marriageRef, marriageData);
    return marriage;
  } catch (error) {
    throw new Error(`Failed to add marriage: ${error.message}`);
  }
}

async function getMarriage(id) {
  try {
    const marriageRef = doc(db, 'marriages', id);
    const marriageSnap = await getDoc(marriageRef);
    
    if (marriageSnap.exists()) {
      return { id: marriageSnap.id, ...marriageSnap.data() };
    } else {
      return null;
    }
  } catch (error) {
    throw new Error(`Failed to get marriage: ${error.message}`);
  }
}

async function updateMarriage(marriageId, updatedMarriageData) {
  try {
    const marriageRef = doc(db, 'marriages', marriageId);
    const updateData = {
      ...updatedMarriageData,
      updatedAt: getCurrentTimestamp()
    };

    await updateDoc(marriageRef, updateData);
    
    // Return updated marriage
    return await getMarriage(marriageId);
  } catch (error) {
    throw new Error(`Failed to update marriage: ${error.message}`);
  }
}

async function deleteMarriage(marriageId) {
  try {
    const marriage = await getMarriage(marriageId);
    if (!marriage) {
      throw new Error("Marriage not found");
    }

    // Permanently delete the marriage
    await deleteDoc(doc(db, 'marriages', marriageId));
    
    console.log(`DBG:marriageServiceFirebase.deleteMarriage -> permanently removed ${marriageId}`);
    return marriage;
  } catch (error) {
    throw new Error(`Failed to delete marriage: ${error.message}`);
  }
}

async function getAllMarriages() {
  try {
    const marriagesRef = collection(db, 'marriages');
    const q = query(marriagesRef, where('active', '==', true));
    const querySnapshot = await getDocs(q);
    
    const marriages = [];
    querySnapshot.forEach((doc) => {
      marriages.push({ id: doc.id, ...doc.data() });
    });
    
    return marriages;
  } catch (error) {
    throw new Error(`Failed to get all marriages: ${error.message}`);
  }
}

async function getMarriagesByPersonId(personId) {
  try {
    const marriagesRef = collection(db, 'marriages');
    const q = query(marriagesRef, where('active', '==', true));
    const querySnapshot = await getDocs(q);
    
    const marriages = [];
    querySnapshot.forEach((doc) => {
      const marriage = { id: doc.id, ...doc.data() };
      
      // Check if person is involved in this marriage
      if (marriage.marriageType === 'monogamous') {
        if (marriage.spouses?.includes(personId)) {
          marriages.push(marriage);
        }
      } else if (marriage.marriageType === 'polygamous') {
        if (marriage.husbandId === personId || 
            marriage.wives?.some(w => w.wifeId === personId)) {
          marriages.push(marriage);
        }
      }
    });
    
    return marriages;
  } catch (error) {
    throw new Error(`Failed to get marriages by person ID: ${error.message}`);
  }
}

async function getMarriagesByChildId(childId) {
  try {
    const marriagesRef = collection(db, 'marriages');
    const q = query(marriagesRef, where('active', '==', true));
    const querySnapshot = await getDocs(q);
    
    const marriages = [];
    querySnapshot.forEach((doc) => {
      const marriage = { id: doc.id, ...doc.data() };
      
      // Check if child is in this marriage
      if (marriage.childrenIds?.includes(childId)) {
        marriages.push(marriage);
      } else if (marriage.marriageType === 'polygamous' && marriage.wives) {
        for (const wife of marriage.wives) {
          if (wife.childrenIds?.includes(childId)) {
            marriages.push(marriage);
            break;
          }
        }
      }
    });
    
    return marriages;
  } catch (error) {
    throw new Error(`Failed to get marriages by child ID: ${error.message}`);
  }
}

async function addChildToMarriage(marriageId, childId, motherId = null) {
  try {
    const marriage = await getMarriage(marriageId);
    if (!marriage) {
      throw new Error("Marriage not found");
    }

    console.log("DBG:addChildToMarriage -> marriage:", marriageId, "child:", childId, "mother:", motherId);

    if (marriage.marriageType === 'monogamous') {
      // Add to main children array
      const childrenIds = marriage.childrenIds || [];
      if (!childrenIds.includes(childId)) {
        childrenIds.push(childId);
        await updateMarriage(marriageId, { childrenIds });
      } else {
        console.warn(`DBG: child ${childId} already in monogamous marriage ${marriageId}`);
      }
    } else if (marriage.marriageType === 'polygamous') {
      if (!motherId) {
        throw new Error("Mother ID is required for polygamous marriages.");
      }
      
      const wives = marriage.wives || [];
      const wifeIndex = wives.findIndex(w => w.wifeId === motherId);
      
      if (wifeIndex === -1) {
        throw new Error(`Mother with ID ${motherId} not found in marriage ${marriageId}.`);
      }
      
      const wife = wives[wifeIndex];
      const childrenIds = wife.childrenIds || [];
      
      if (!childrenIds.includes(childId)) {
        childrenIds.push(childId);
        wives[wifeIndex] = { ...wife, childrenIds };
        
        // Remove child from other wives if present
        for (let i = 0; i < wives.length; i++) {
          if (i !== wifeIndex && wives[i].childrenIds?.includes(childId)) {
            console.warn(`DBG: Removing duplicate child ${childId} from wife ${wives[i].wifeId}`);
            wives[i].childrenIds = wives[i].childrenIds.filter(c => c !== childId);
          }
        }
        
        await updateMarriage(marriageId, { wives });
      } else {
        console.warn(`DBG: child ${childId} already assigned to wife ${motherId} in marriage ${marriageId}`);
      }
    }

    return await getMarriage(marriageId);
  } catch (error) {
    throw new Error(`Failed to add child to marriage: ${error.message}`);
  }
}

// Export all the functions in a single service object.
export const marriageServiceFirebase = {
  addMarriage,
  getMarriage,
  updateMarriage,
  deleteMarriage,
  getAllMarriages,
  getMarriagesByPersonId,
  getMarriagesByChildId,
  addChildToMarriage,
};