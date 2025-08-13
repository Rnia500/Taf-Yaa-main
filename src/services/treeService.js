import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  updateDoc,
  deleteDoc,
  arrayUnion,
  arrayRemove,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { generateInviteCode } from '../utils/helpers';

export const treeService = {
  // Create new family tree
  async createTree(treeData, userId) {
    try {
      const treeId = `tree_${Date.now()}_${userId.slice(-6)}`;
      
      const newTree = {
        id: treeId,
        familyName: treeData.familyName,
        createdBy: userId,
        createdAt: serverTimestamp(),
        language: treeData.language || 'en',
        isPublic: treeData.isPublic || false,
        memberCount: 0,
        currentRootId: null,
        invitesEnabled: true,
        mergeOptIn: treeData.mergeOptIn || false
      };

      await setDoc(doc(db, 'trees', treeId), newTree);
      
      // Update user's joined trees
      await updateDoc(doc(db, 'users', userId), {
        joinedTrees: arrayUnion(treeId),
        [`roles.${treeId}`]: 'admin'
      });

      return { ...newTree, id: treeId };
    } catch (error) {
      throw new Error(`Failed to create tree: ${error.message}`);
    }
  },

  // Get tree by ID
  async getTree(treeId) {
    try {
      const treeDoc = await getDoc(doc(db, 'trees', treeId));
      if (!treeDoc.exists()) {
        throw new Error('Tree not found');
      }
      return { id: treeDoc.id, ...treeDoc.data() };
    } catch (error) {
      throw new Error(`Failed to get tree: ${error.message}`);
    }
  },

  // Get trees for user
  async getUserTrees(userId) {
    try {
      const userData = await getDoc(doc(db, 'users', userId));
      if (!userData.exists()) return [];
      
      const joinedTrees = userData.data().joinedTrees || [];
      const trees = [];
      
      for (const treeId of joinedTrees) {
        const tree = await this.getTree(treeId);
        trees.push(tree);
      }
      
      return trees;
    } catch (error) {
      throw new Error(`Failed to get user trees: ${error.message}`);
    }
  },

  // Get tree members
  async getTreeMembers(treeId) {
    try {
      const membersQuery = query(
        collection(db, 'people'),
        where('treeId', '==', treeId),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(membersQuery);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      throw new Error(`Failed to get tree members: ${error.message}`);
    }
  }
};

