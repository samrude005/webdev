import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
} from 'firebase/firestore';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Helper to build our app-specific user object
const buildUserObject = (firebaseUser, profileData = {}) => {
  if (!firebaseUser) return null;

  return {
    id: firebaseUser.uid,
    name: profileData.name || firebaseUser.displayName || '',
    email: firebaseUser.email,
    userType: profileData.userType || 'donor',
    avatar:
      profileData.avatar ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(
        profileData.name || firebaseUser.email || 'User'
      )}&background=0ea5e9&color=fff`,
    verified: Boolean(profileData.verified),
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Subscribe to Firebase auth state
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        // Load additional profile data from Firestore if available
        const userRef = doc(db, 'users', firebaseUser.uid);
        const snap = await getDoc(userRef);
        const profileData = snap.exists() ? snap.data() : {};
        const appUser = buildUserObject(firebaseUser, profileData);

        setUser(appUser);
      } catch (err) {
        console.error('Error loading user profile:', err);
        setUser(buildUserObject(firebaseUser));
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = credential.user;

      const userRef = doc(db, 'users', firebaseUser.uid);
      const snap = await getDoc(userRef);
      const profileData = snap.exists() ? snap.data() : {};

      const appUser = buildUserObject(firebaseUser, profileData);
      setUser(appUser);

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      let message = 'Login failed. Please check your credentials and try again.';

      if (error.code === 'auth/user-not-found') {
        message = 'No account found with this email.';
      } else if (error.code === 'auth/wrong-password') {
        message = 'Incorrect password.';
      } else if (error.code === 'auth/too-many-requests') {
        message = 'Too many failed attempts. Please try again later.';
      }

      return { success: false, error: message };
    }
  };

  const register = async (name, email, password, userType) => {
    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = credential.user;

      const profileData = {
        name,
        email,
        userType: userType || 'donor',
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
          name || email
        )}&background=0ea5e9&color=fff`,
        verified: false,
        createdAt: new Date().toISOString(),
      };

      // Save profile in Firestore
      await setDoc(doc(db, 'users', firebaseUser.uid), profileData);

      const appUser = buildUserObject(firebaseUser, profileData);
      setUser(appUser);
      setLoading(false);

      return { success: true, user: appUser };
    } catch (error) {
      console.error('Register error:', error);
      let message = 'Registration failed. Please try again.';

      if (error.code === 'auth/email-already-in-use') {
        message = 'An account already exists with this email.';
      } else if (error.code === 'auth/weak-password') {
        message = 'Password is too weak. Please use at least 6 characters.';
      }

      return { success: false, error: message };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const value = {
    user,
    token: null, // kept for compatibility with existing components, but unused now
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
