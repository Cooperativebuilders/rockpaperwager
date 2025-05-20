
"use client";

import type { User as FirebaseUser } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, signOut as firebaseSignOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import type { Dispatch, ReactNode, SetStateAction } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';

export interface UserProfile {
  uid: string;
  email: string | null;
  username: string;
  fullName?: string;
  address?: string;
  iban?: string;
  bic?: string;
  avatarUrl?: string;
  coins: number;
  createdAt: any; // Firestore timestamp or Date
  lastLogin?: any;
}

interface AuthContextType {
  user: FirebaseUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  error: string | null;
  signUp: (username: string, email: string, pass: string) => Promise<void>;
  signIn: (email: string, pass: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updateUserProfileInContext: (profileData: Partial<UserProfile>) => void;
  fetchUserProfile: (uid: string) => Promise<UserProfile | null>;
  updateFirestoreProfile: (uid: string, data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  const fetchUserProfile = async (uid: string): Promise<UserProfile | null> => {
    try {
      const userDocRef = doc(db, 'users', uid);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        const profileData = userDocSnap.data() as UserProfile;
        setUserProfile(profileData);
        return profileData;
      } else {
        console.warn('No such user profile document!');
        setUserProfile(null);
        return null;
      }
    } catch (err: any) {
      console.error("Error fetching user profile: ", err);
      setError(err.message);
      setUserProfile(null);
      return null;
    }
  };

  const updateFirestoreProfile = async (uid: string, data: Partial<UserProfile>) => {
    try {
      const userDocRef = doc(db, 'users', uid);
      await updateDoc(userDocRef, data);
      // Optimistically update local profile or re-fetch
      if (userProfile && userProfile.uid === uid) {
        setUserProfile(prev => prev ? ({ ...prev, ...data }) : null);
      }
      toast({ title: "Profile Updated", description: "Your profile has been successfully updated." });
    } catch (err: any) {
      console.error("Error updating profile: ", err);
      toast({ title: "Update Failed", description: err.message, variant: "destructive" });
      throw err; // Re-throw to handle in component if needed
    }
  };


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      setError(null);
      if (firebaseUser) {
        setUser(firebaseUser);
        await fetchUserProfile(firebaseUser.uid);
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signUp = async (username: string, email: string, pass: string) => {
    setLoading(true);
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      const newUser = userCredential.user;
      // Create user profile in Firestore
      const userDocRef = doc(db, 'users', newUser.uid);
      const newProfile: UserProfile = {
        uid: newUser.uid,
        email: newUser.email,
        username: username,
        coins: 1000, // Initial coins
        createdAt: serverTimestamp(),
        avatarUrl: `https://placehold.co/128x128.png?text=${username.charAt(0).toUpperCase()}`
      };
      await setDoc(userDocRef, newProfile);
      setUserProfile(newProfile); // Set profile immediately
      toast({ title: "Sign Up Successful", description: `Welcome, ${username}!` });
      router.push('/'); // Redirect to home page
    } catch (err: any) {
      console.error("Sign up error:", err);
      setError(err.message);
      toast({ title: "Sign Up Failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, pass: string) => {
    setLoading(true);
    setError(null);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      const loggedInUser = userCredential.user;
      // Firestore profile should be fetched by onAuthStateChanged listener
      // Record last login
      await updateDoc(doc(db, 'users', loggedInUser.uid), { lastLogin: serverTimestamp() });
      toast({ title: "Login Successful", description: "Welcome back!" });
      router.push('/'); // Redirect to home page
    } catch (err: any) {
      console.error("Sign in error:", err);
      setError(err.message);
      toast({ title: "Login Failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    setError(null);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const googleUser = result.user;
      // Check if user exists in Firestore, if not, create profile
      const userDocRef = doc(db, 'users', googleUser.uid);
      const userDocSnap = await getDoc(userDocRef);
      if (!userDocSnap.exists()) {
        const newProfile: UserProfile = {
          uid: googleUser.uid,
          email: googleUser.email,
          username: googleUser.displayName || googleUser.email?.split('@')[0] || 'User',
          avatarUrl: googleUser.photoURL || `https://placehold.co/128x128.png?text=${(googleUser.displayName || 'U').charAt(0).toUpperCase()}`,
          coins: 1000,
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp()
        };
        await setDoc(userDocRef, newProfile);
        setUserProfile(newProfile);
      } else {
         await updateDoc(userDocRef, { lastLogin: serverTimestamp(), avatarUrl: googleUser.photoURL || userDocSnap.data()?.avatarUrl });
      }
      toast({ title: "Google Sign-In Successful", description: `Welcome, ${googleUser.displayName || googleUser.email}!` });
      router.push('/'); // Redirect to home page
    } catch (err: any) {
      console.error("Google sign in error:", err);
      setError(err.message);
      toast({ title: "Google Sign-In Failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    setError(null);
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setUserProfile(null);
      toast({ title: "Logged Out", description: "You have been successfully logged out." });
      router.push('/auth'); // Redirect to auth page
    } catch (err: any) {
      console.error("Sign out error:", err);
      setError(err.message);
      toast({ title: "Logout Failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };
  
  const updateUserProfileInContext = (profileData: Partial<UserProfile>) => {
    setUserProfile(prev => prev ? ({ ...prev, ...profileData }) : null);
  };

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, error, signUp, signIn, signInWithGoogle, signOut, updateUserProfileInContext, fetchUserProfile, updateFirestoreProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
