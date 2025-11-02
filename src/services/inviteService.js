// src/services/inviteService.js
import QRCode from 'qrcode';
import { createInvite } from '../models/featuresModels/InviteModel';
import { db, auth } from '../config/firebase';
import {
  collection,
  doc,
  setDoc,
  query,
  where,
  getDocs,
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
  personId = null,
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
    personId,
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

// Validate invite code and return invite data with tree info
export async function validateInviteCode(code) {
  try {
    const response = await fetch('/.netlify/functions/validate-invite', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to validate invite');
    }

    return {
      invite: data.invite,
      inviteId: data.invite.id,
      tree: data.tree,
    };
  } catch (error) {
    throw new Error(`Failed to validate invite: ${error.message}`);
  }
}



// Get invites for a tree (for admin management) - now uses server function
export async function getInvitesForTree(treeId) {
  try {
    const idToken = await auth.currentUser?.getIdToken();
    if (!idToken) {
      throw new Error('User not authenticated');
    }

    const response = await fetch('/.netlify/functions/manage-invites', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${idToken}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch invites');
    }

    // Filter by treeId since the function returns all user's invites
    return data.data.filter(invite => invite.treeId === treeId);
  } catch (error) {
    throw new Error(`Failed to get invites: ${error.message}`);
  }
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
