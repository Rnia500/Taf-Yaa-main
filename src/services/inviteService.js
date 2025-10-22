// src/services/inviteService.js
import QRCode from 'qrcode';
import { createInvite } from '../models/featuresModels/InviteModel';
import { createJoinRequest } from '../models/featuresModels/JoinRequestModel';
import { db } from '../config/firebase';
import {
  collection,
  doc,
  setDoc,
  query,
  where,
  limit,
  getDocs,
  runTransaction,
  updateDoc,
} from 'firebase/firestore';

// Helper to generate a random code of 8-12 characters
function generateInviteCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const length = Math.floor(Math.random() * 5) + 8; // 8 to 12
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Generate QR code data URL
async function generateQr(text) {
  const dataUrl = await QRCode.toDataURL(text, { errorCorrectionLevel: 'H', margin: 2, scale: 6 });
  return dataUrl;
}

// Create a new invite
export async function createInviteService({
  treeId,
  createdBy,
  type,
  role,
  fatherId = null,
  motherId = null,
  usesAllowed = 1,
  expiresAt,
  notes,
  appBaseUrl = 'http://localhost:8888', 
}) {
  const code = generateInviteCode();
  const joinUrl = `${appBaseUrl}/join?code=${encodeURIComponent(code)}`;
  const qrDataUrl = await generateQr(joinUrl);

  const invite = createInvite({
    code,
    treeId,
    createdBy,
    type,
    role,
    fatherId,
    motherId,
    usesAllowed,
    expiresAt,
    qrDataUrl,
    joinUrl,
    notes,
  });

  // Save to Firestore
  const inviteRef = doc(collection(db, 'invites'), invite.InviteId);
  await setDoc(inviteRef, invite);
  return { id: invite.InviteId, ...invite };
}

// Validate invite code and return invite data
export async function validateInviteCode(code) {
  const invitesRef = collection(db, 'invites');
  const q = query(invitesRef, where('code', '==', code), limit(1));
  const querySnapshot = await getDocs(q);
  if (querySnapshot.empty) {
    throw new Error('Invite not found');
  }
  const inviteDoc = querySnapshot.docs[0];
  const invite = inviteDoc.data();

  // Check status and expiration
  if (invite.status !== 'active') {
    throw new Error('Invite is not active');
  }
  if (invite.expiresAt && new Date(invite.expiresAt) < new Date()) {
    throw new Error('Invite has expired');
  }
  if (invite.usesCount >= invite.usesAllowed) {
    throw new Error('Invite usage limit reached');
  }

  return { invite, inviteId: inviteDoc.id };
}

// Submit a join request
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
    if (!inviteDoc.exists) {
      throw new Error('Invite not found');
    }
    const invite = inviteDoc.data();
    const newUsesCount = invite.usesCount + 1;
    transaction.update(inviteRef, { usesCount: newUsesCount });
    if (newUsesCount >= invite.usesAllowed) {
      transaction.update(inviteRef, { status: 'used' });
    }
  });

  return joinRequest;
}

// Approve or reject a join request
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

// Get join requests for a tree (for admin review)
export async function getJoinRequestsForTree(treeId) {
  const joinRequestsRef = collection(db, 'joinRequests');
  const q = query(joinRequestsRef, where('treeId', '==', treeId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Get invites for a tree (for admin management)
export async function getInvitesForTree(treeId) {
  const invitesRef = collection(db, 'invites');
  const q = query(invitesRef, where('treeId', '==', treeId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Revoke an invite
export async function revokeInvite(inviteId) {
  const inviteRef = doc(collection(db, 'invites'), inviteId);
  await updateDoc(inviteRef, { status: 'revoked', updatedAt: new Date().toISOString() });
}

// Get invites created by a specific user
export async function getInvitesForUser(createdBy) {
  const invitesRef = collection(db, 'invites');
  const q = query(invitesRef, where('createdBy', '==', createdBy));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
