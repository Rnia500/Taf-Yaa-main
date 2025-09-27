import {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  increment
} from 'firebase/firestore';
import { db } from '../config/firebase';

export const peopleService = {
  // Add new person to tree
  async addPerson(personData, treeId) {
    try {
      const personId = `p_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const newPerson = {
        id: personId,
        treeId: treeId,
        name: personData.name,
        gender: personData.gender,
        dob: personData.dob || null,
        dod: personData.dod || null,
        photoUrl: personData.photoUrl || null,
        bio: personData.bio || '',
        language: personData.language || 'en',
        fatherId: personData.fatherId || null,
        motherId: personData.motherId || null,
        spouseIds: personData.spouseIds || [],
        childrenIds: [],
        linkedUserId: personData.linkedUserId || null,
        isDeceased: personData.isDeceased || false,
        publicConsent: personData.publicConsent || false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await setDoc(doc(db, 'people', personId), newPerson);
      
      // Update parent's children arrays
      if (personData.fatherId) {
        await updateDoc(doc(db, 'people', personData.fatherId), {
          childrenIds: arrayUnion(personId),
          updatedAt: serverTimestamp()
        });
      }
      
      if (personData.motherId) {
        await updateDoc(doc(db, 'people', personData.motherId), {
          childrenIds: arrayUnion(personId),
          updatedAt: serverTimestamp()
        });
      }
      
      // Update tree member count
      await updateDoc(doc(db, 'trees', treeId), {
        memberCount: increment(1)
      });

      return { ...newPerson, id: personId };
    } catch (error) {
      throw new Error(`Failed to add person: ${error.message}`);
    }
  },

  // Get person by ID
  async getPerson(personId) {
    try {
      const personDoc = await getDoc(doc(db, 'people', personId));
      if (!personDoc.exists()) {
        throw new Error('Person not found');
      }
      return { id: personDoc.id, ...personDoc.data() };
    } catch (error) {
      throw new Error(`Failed to get person: ${error.message}`);
    }
  },

  // Update person
  async updatePerson(personId, updates) {
    try {
      await updateDoc(doc(db, 'people', personId), {
        ...updates,
        updatedAt: serverTimestamp()
      });
      
      return await this.getPerson(personId);
    } catch (error) {
      throw new Error(`Failed to update person: ${error.message}`);
    }
  },

  // Delete person
  async deletePerson(personId, treeId) {
    try {
      // Get person data first
      const person = await this.getPerson(personId);
      
      // Remove from parents' children arrays
      if (person.fatherId) {
        await updateDoc(doc(db, 'people', person.fatherId), {
          childrenIds: arrayRemove(personId)
        });
      }
      
      if (person.motherId) {
        await updateDoc(doc(db, 'people', person.motherId), {
          childrenIds: arrayRemove(personId)
        });
      }
      
      // Delete the person
      await deleteDoc(doc(db, 'people', personId));
      
      // Update tree member count
      await updateDoc(doc(db, 'trees', treeId), {
        memberCount: increment(-1)
      });
      
      return true;
    } catch (error) {
      throw new Error(`Failed to delete person: ${error.message}`);
    }
  }
};

