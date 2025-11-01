// src/services/joinRequestService.js
import { createJoinRequest } from '../models/featuresModels/JoinRequestModel';
import { db } from '../config/firebase';
import {
  collection,
  doc,
  setDoc,
  query,
  where,
  getDocs,
  runTransaction,
  updateDoc,
  getDoc,
} from 'firebase/firestore';


// SUBMIT JOIN REQUEST

export async function submitJoinRequest({
  treeId,
  inviteCode,
  inviteId,
  submittedBy = null,
  claimedFatherId = null,
  claimedMotherId = null,
  name,
  gender,
  birthDate = null,
  notes = null,
  proofFiles = [],
}) {
  const joinRequest = createJoinRequest({
    treeId,
    inviteCode,
    inviteId,
    submittedBy,
    claimedFatherId,
    claimedMotherId,
    name,
    gender,
    birthDate,
    notes,
    proofFiles,
  });

  // Save to Firestore
  const joinRequestRef = doc(collection(db, 'joinRequests'), joinRequest.JoinRequestId);
  await setDoc(joinRequestRef, joinRequest);

  // Increment usesCount on invite
  const inviteRef = doc(collection(db, 'invites'), inviteId);
  await runTransaction(db, async (transaction) => {
    const inviteDoc = await transaction.get(inviteRef);
    if (!inviteDoc.exists) throw new Error('Invite not found');

    const invite = inviteDoc.data();
    const newUsesCount = (invite.usesCount || 0) + 1;
    transaction.update(inviteRef, { usesCount: newUsesCount });

    if (newUsesCount >= invite.usesAllowed) {
      transaction.update(inviteRef, { status: 'used' });
    }
  });

  return joinRequest;
}


// REVIEW JOIN REQUEST
export async function reviewJoinRequest(joinRequestId, status, reviewedBy, approvedPersonId = null) {
  const joinRequestRef = doc(collection(db, 'joinRequests'), joinRequestId);
  const updateData = {
    status,
    reviewedAt: new Date().toISOString(),
    reviewedBy,
    approvedPersonId,
  };
  await updateDoc(joinRequestRef, updateData);
  return updateData;
}


// ACCEPT JOIN REQUEST (UNIFIED LOGIC)

export async function acceptJoinRequest(joinRequestId, reviewedBy) {
  // Load join request
  const joinRequestSnap = await getDocs(
    query(collection(db, 'joinRequests'), where('JoinRequestId', '==', joinRequestId))
  );
  if (joinRequestSnap.empty) throw new Error('Join request not found');

  const joinRequest = joinRequestSnap.docs[0].data();
  if (joinRequest.status !== 'pending') throw new Error('Join request is not pending');

  //Load invite for role assignment
  const inviteRef = doc(collection(db, 'invites'), joinRequest.inviteId);
  const inviteDoc = await getDoc(inviteRef);
  if (!inviteDoc.exists) throw new Error('Invite not found');
  const invite = inviteDoc.data();

  // Lazy imports for heavy modules
  const dataService = (await import('../services/dataService')).default;
  const { treeServiceFirebase } = await import('../services/data/treeServiceFirebase');
  const { addChild } = await import('../controllers/tree/addChild');

  //Validate parent info
  const parentId = joinRequest.claimedFatherId || joinRequest.claimedMotherId;
  if (!parentId) throw new Error('Join request must specify at least one parent');

  //Prepare child data
  const childData = {
    fullName: joinRequest.name,
    gender: joinRequest.gender,
    dateOfBirth: joinRequest.birthDate,
    privacyLevel: 'membersOnly',
    allowGlobalMatching: false,
    linkedUserId: joinRequest.submittedBy
  };

  //Delegate person creation + attachment to addChild()
  const result = await addChild(joinRequest.treeId, {
    parentId,
    childData,
    createdBy: reviewedBy,
  });

  const newPerson = result.child;

  //If submitted by a user, add as member
  if (joinRequest.submittedBy) {
    await dataService.addMember(joinRequest.treeId, {
      userId: joinRequest.submittedBy,
      role: invite.role,
      joinedAt: new Date().toISOString(),
    });
  }

  //Trigger UI refresh
  window.dispatchEvent(new Event('familyDataChanged'));

  //Update join request record
  const joinRequestRef = doc(collection(db, 'joinRequests'), joinRequestId);
  const updateData = {
    status: 'approved',
    reviewedAt: new Date().toISOString(),
    reviewedBy,
    approvedPersonId: newPerson?.id || null,
  };

  await updateDoc(joinRequestRef, updateData);

  return { newPerson, updateData };
}


// GET ALL JOIN REQUESTS FOR A TREE

export async function getJoinRequestsForTree(treeId) {
  const joinRequestsRef = collection(db, 'joinRequests');
  const q = query(joinRequestsRef, where('treeId', '==', treeId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
