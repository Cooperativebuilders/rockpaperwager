
"use client";

import type { User as FirebaseUser } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, signOut as firebaseSignOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, updateDoc, Timestamp } from 'firebase/firestore';
import type { Dispatch, ReactNode, SetStateAction } from 'react';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
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
  createdAt: Timestamp | Date; // Stricter type
  lastLogin?: Timestamp | Date;
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

  const fetchUserProfileCallback = useCallback(async (uid: string): Promise<UserProfile | null> => {
    setError(null); // Clear previous errors
    try {
      const userDocRef = doc(db, 'users', uid);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        const profileData = userDocSnap.data() as UserProfile;
        setUserProfile(profileData);
        return profileData;
      } else {
        console.warn(`No user profile document found for UID: ${uid}`);
        setUserProfile(null);
        setError("User profile not found. Please complete sign up if this is a new account.");
        return null;
      }
    } catch (err: any) {
      console.error("Error fetching user profile: ", err);
      setError(`Failed to fetch profile: ${err.message || 'Unknown error'}`);
      setUserProfile(null);
      return null;
    }
  }, []); // Empty dependency array, this function itself doesn't depend on component state

  const updateFirestoreProfileCallback = useCallback(async (uid: string, data: Partial<UserProfile>) => {
    setError(null);
    try {
      const userDocRef = doc(db, 'users', uid);
      await updateDoc(userDocRef, {
        ...data,
        // Ensure serverTimestamp is used for any timestamp updates if needed, e.g. lastUpdated: serverTimestamp()
      });
      setUserProfile(prev => prev ? ({ ...prev, ...data }) : null);
      toast({ title: "Profile Updated", description: "Your profile has been successfully updated." });
    } catch (err: any) {
      console.error("Error updating profile: ", err);
      toast({ title: "Update Failed", description: err.message || "Could not save changes.", variant: "destructive" });
      setError(`Failed to update profile: ${err.message || 'Unknown error'}`);
      throw err;
    }
  }, [toast]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      setError(null);
      if (firebaseUser) {
        setUser(firebaseUser);
        await fetchUserProfileCallback(firebaseUser.uid);
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [fetchUserProfileCallback]);

  const signUp = async (username: string, email: string, pass: string) => {
    setLoading(true);
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      const newUser = userCredential.user;
      const userDocRef = doc(db, 'users', newUser.uid);
      const newProfile: UserProfile = {
        uid: newUser.uid,
        email: newUser.email,
        username: username,
        coins: 1000,
        createdAt: serverTimestamp() as Timestamp, // Use serverTimestamp for creation
        avatarUrl: `https://placehold.co/128x128.png?text=${username.charAt(0).toUpperCase()}`
      };
      await setDoc(userDocRef, newProfile);
      setUserProfile(newProfile);
      toast({ title: "Sign Up Successful", description: `Welcome, ${username}!` });
      router.push('/');
    } catch (err: any) {
      console.error("Sign up error:", err);
      const specificError = err.code ? `${err.code}: ${err.message}` : err.message;
      setError(specificError);
      toast({ title: "Sign Up Failed", description: specificError, variant: "destructive" });
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
      // Firestore profile will be fetched by onAuthStateChanged listener.
      // We can update lastLogin here.
      await updateDoc(doc(db, 'users', loggedInUser.uid), { lastLogin: serverTimestamp() });
      toast({ title: "Login Successful", description: "Welcome back!" });
      router.push('/');
    } catch (err: any)      {
      console.error("Sign in error:", err);
      const specificError = err.code ? `${err.code}: ${err.message}` : err.message;
      setError(specificError);
      toast({ title: "Login Failed", description: specificError, variant: "destructive" });
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
      const userDocRef = doc(db, 'users', googleUser.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        const newProfile: UserProfile = {
          uid: googleUser.uid,
          email: googleUser.email,
          username: googleUser.displayName || googleUser.email?.split('@')[0] || 'User',
          avatarUrl: googleUser.photoURL || `https://placehold.co/128x128.png?text=${(googleUser.displayName || 'U').charAt(0).toUpperCase()}`,
          coins: 1000,
          createdAt: serverTimestamp() as Timestamp,
          lastLogin: serverTimestamp() as Timestamp
        };
        await setDoc(userDocRef, newProfile);
        setUserProfile(newProfile); // Set profile in context after creation
      } else {
        // User exists, update last login and potentially avatar if changed
        await updateDoc(userDocRef, {
          lastLogin: serverTimestamp(),
          avatarUrl: googleUser.photoURL || userDocSnap.data()?.avatarUrl, // Prefer new photoURL
          // Optionally update email if it can change with Google sign-in and you want to sync it:
          // email: googleUser.email,
        });
        // Fetching in onAuthStateChanged will update the profile in context.
      }
      toast({ title: "Google Sign-In Successful", description: `Welcome, ${googleUser.displayName || googleUser.email}!` });
      router.push('/');
    } catch (err: any) {
      console.error("Google sign in error:", err);
      const specificError = err.code ? `${err.code}: ${err.message}` : err.message;
      setError(specificError);
      toast({ title: "Google Sign-In Failed", description: specificError, variant: "destructive" });
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
      router.push('/auth');
    } catch (err: any) {
      console.error("Sign out error:", err);
      const specificError = err.code ? `${err.code}: ${err.message}` : err.message;
      setError(specificError);
      toast({ title: "Logout Failed", description: specificError, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };
  
  const updateUserProfileInContext = (profileData: Partial<UserProfile>) => {
    setUserProfile(prev => prev ? ({ ...prev, ...profileData }) : null);
  };

  return (
    <AuthContext.Provider value={{ 
        user, 
        userProfile, 
        loading, 
        error, 
        signUp, 
        signIn, 
        signInWithGoogle, 
        signOut, 
        updateUserProfileInContext, 
        fetchUserProfile: fetchUserProfileCallback, // Use the memoized callback
        updateFirestoreProfile: updateFirestoreProfileCallback // Use the memoized callback
    }}>
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
