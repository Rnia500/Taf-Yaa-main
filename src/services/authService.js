import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

export const authService = {
  // Register new user
  async register(email, password, displayName) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update profile
      await updateProfile(user, { displayName });
      
      // Create user document in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: displayName,
        profilePhoto: null,
        linkedPersonId: null,
        joinedTrees: [],
        roles: {},
        preferences: {
          language: 'en',
          darkMode: false,
          treeDefaultView: 'radial'
        },
        invitedBy: null,
        lastLogin: new Date().toISOString(),
        createdAt: new Date().toISOString()
      });
      
      return user;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  // Login user
  async login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Update last login
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        lastLogin: new Date().toISOString()
      }, { merge: true });
      
      return userCredential.user;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  // Logout user
  async logout() {
    try {
      await signOut(auth);
    } catch (error) {
      throw new Error(error.message);
    }
  },

  // Get current user data from Firestore
  async getCurrentUserData() {
    if (!auth.currentUser) return null;
    
    try {
      const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
      return userDoc.exists() ? userDoc.data() : null;
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  },

  // Listen to auth state changes
  onAuthStateChange(callback) {
    return onAuthStateChanged(auth, callback);
  }
};


