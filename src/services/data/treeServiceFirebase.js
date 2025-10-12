// src/services/data/treeServiceFirebase.js

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
  orderBy,
  serverTimestamp,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { db } from '../../config/firebase.js';
import { generateId } from '../../utils/personUtils/idGenerator.js';

// Helper function to get current timestamp
const getCurrentTimestamp = () => serverTimestamp();

async function addTree(tree) {
  try {
    // Check if tree with same ID already exists
    const existingTree = await getTree(tree.id);
    if (existingTree) {
      console.warn("treeServiceFirebase.addTree -> duplicate tree id detected:", tree.id);
      tree = { ...tree, id: generateId("tree") };
    }

    const treeRef = doc(db, 'trees', tree.id || generateId("tree"));
    const treeData = {
      ...tree,
      id: tree.id || generateId("tree"),
      members: tree.members || [],
      invitesEnabled: tree.invitesEnabled ?? true,
      mergeOptIn: tree.mergeOptIn ?? false,
      currentRootId: tree.currentRootId || null,
      active: true, // Add active field for better querying
      createdAt: getCurrentTimestamp(),
      updatedAt: getCurrentTimestamp()
    };

    await setDoc(treeRef, treeData);
    return treeData;
  } catch (error) {
    throw new Error(`Failed to add tree: ${error.message}`);
  }
}

async function getTree(treeId) {
  try {
    const treeRef = doc(db, 'trees', treeId);
    const treeSnap = await getDoc(treeRef);
    
    if (treeSnap.exists()) {
      return { id: treeSnap.id, ...treeSnap.data() };
    } else {
      return null;
    }
  } catch (error) {
    throw new Error(`Failed to get tree: ${error.message}`);
  }
}

async function getTreesByUserId(userId, includeDeleted = false) {
  try {
    const treesRef = collection(db, 'trees');
    const q = query(treesRef, where('active', '==', true));
    const querySnapshot = await getDocs(q);
    
    const trees = [];
    querySnapshot.forEach((doc) => {
      const tree = { id: doc.id, ...doc.data() };
      // Check if user is a member of this tree
      if (tree.members?.some(m => m.userId === userId)) {
        if (includeDeleted || !tree.deletedAt) {
          trees.push(tree);
        }
      }
    });
    
    return trees;
  } catch (error) {
    throw new Error(`Failed to get trees by user ID: ${error.message}`);
  }
}

async function getAllTrees() {
  try {
    const treesRef = collection(db, 'trees');
    const q = query(treesRef, where('active', '==', true));
    const querySnapshot = await getDocs(q);
    
    const trees = [];
    querySnapshot.forEach((doc) => {
      trees.push({ id: doc.id, ...doc.data() });
    });
    
    return trees;
  } catch (error) {
    throw new Error(`Failed to get all trees: ${error.message}`);
  }
}

async function updateTree(treeId, updates) {
  try {
    const treeRef = doc(db, 'trees', treeId);
    const updateData = {
      ...updates,
      updatedAt: getCurrentTimestamp()
    };

    await updateDoc(treeRef, updateData);
    
    // Return updated tree
    return await getTree(treeId);
  } catch (error) {
    throw new Error(`Failed to update tree: ${error.message}`);
  }
}

async function addMember(treeId, member) {
  try {
    const tree = await getTree(treeId);
    if (!tree) {
      throw new Error("Tree not found");
    }

    const members = tree.members || [];
    
    // Check if member already exists
    const existingMemberIndex = members.findIndex(m => m.userId === member.userId);
    if (existingMemberIndex !== -1) {
      throw new Error("Member already exists in this tree");
    }

    const newMember = {
      ...member,
      joinedAt: new Date().toISOString()
    };

    members.push(newMember);
    
    await updateTree(treeId, { members });
    return newMember;
  } catch (error) {
    throw new Error(`Failed to add member: ${error.message}`);
  }
}

async function removeMember(treeId, userId) {
  try {
    const tree = await getTree(treeId);
    if (!tree) {
      throw new Error("Tree not found");
    }

    const members = tree.members || [];
    const memberIndex = members.findIndex(m => m.userId === userId);
    
    if (memberIndex === -1) {
      throw new Error("Member not found in this tree");
    }

    const removedMember = members.splice(memberIndex, 1)[0];
    
    await updateTree(treeId, { members });
    return removedMember;
  } catch (error) {
    throw new Error(`Failed to remove member: ${error.message}`);
  }
}

async function changeMemberRole(treeId, userId, newRole) {
  try {
    const tree = await getTree(treeId);
    if (!tree) {
      throw new Error("Tree not found");
    }

    const members = tree.members || [];
    const memberIndex = members.findIndex(m => m.userId === userId);
    
    if (memberIndex === -1) {
      throw new Error("Member not found in this tree");
    }

    members[memberIndex].role = newRole;
    members[memberIndex].updatedAt = new Date().toISOString();
    
    await updateTree(treeId, { members });
    return members[memberIndex];
  } catch (error) {
    throw new Error(`Failed to change member role: ${error.message}`);
  }
}

async function setRootPerson(treeId, personId) {
  try {
    await updateTree(treeId, { currentRootId: personId });
    return await getTree(treeId);
  } catch (error) {
    throw new Error(`Failed to set root person: ${error.message}`);
  }
}

async function toggleInvites(treeId, enabled) {
  try {
    await updateTree(treeId, { invitesEnabled: enabled });
    return await getTree(treeId);
  } catch (error) {
    throw new Error(`Failed to toggle invites: ${error.message}`);
  }
}

async function setMergeOptIn(treeId, optIn) {
  try {
    await updateTree(treeId, { mergeOptIn: optIn });
    return await getTree(treeId);
  } catch (error) {
    throw new Error(`Failed to set merge opt-in: ${error.message}`);
  }
}

async function getUserLatestTree(userId) {
  try {
    const trees = await getTreesByUserId(userId);
    
    if (trees.length === 0) {
      return null;
    }

    // Sort by updatedAt (most recent first), then by createdAt
    const sortedTrees = trees.sort((a, b) => {
      const dateA = new Date(a.updatedAt || a.createdAt);
      const dateB = new Date(b.updatedAt || b.createdAt);
      return dateB - dateA;
    });

    return sortedTrees[0];
  } catch (error) {
    throw new Error(`Failed to get user latest tree: ${error.message}`);
  }
}

async function deleteTree(treeId) {
  try {
    const treeRef = doc(db, 'trees', treeId);
    await deleteDoc(treeRef);
  } catch (error) {
    throw new Error(`Failed to delete tree: ${error.message}`);
  }
}

async function softDeleteTree(treeId) {
  try {
    await updateTree(treeId, { deletedAt: getCurrentTimestamp() });
    return await getTree(treeId);
  } catch (error) {
    throw new Error(`Failed to soft delete tree: ${error.message}`);
  }
}

async function restoreTree(treeId) {
  try {
    await updateTree(treeId, { deletedAt: null });
    return await getTree(treeId);
  } catch (error) {
    throw new Error(`Failed to restore tree: ${error.message}`);
  }
}

async function purgeTree(treeId) {
  try {
    await deleteTree(treeId);
  } catch (error) {
    throw new Error(`Failed to purge tree: ${error.message}`);
  }
}

// Export all the functions in a single service object.
export const treeServiceFirebase = {
  addTree,
  getTree,
  getTreesByUserId,
  getAllTrees,
  updateTree,
  addMember,
  removeMember,
  changeMemberRole,
  setRootPerson,
  toggleInvites,
  setMergeOptIn,
  getUserLatestTree,
  deleteTree,
  softDeleteTree,
  restoreTree,
  purgeTree,
};
