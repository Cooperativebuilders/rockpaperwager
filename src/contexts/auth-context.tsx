
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
  createdAt: Timestamp | Date;
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
    setLoading(true); 
    setError(null);
    console.log(`Fetching profile for UID: ${uid}`);
    try {
      const userDocRef = doc(db, 'users', uid);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        console.log(`Profile found for UID: ${uid}`, userDocSnap.data());
        const profileData = userDocSnap.data() as UserProfile;
        const processedProfileData = {
          ...profileData,
          createdAt: profileData.createdAt instanceof Timestamp ? profileData.createdAt.toDate() : profileData.createdAt,
          lastLogin: profileData.lastLogin && profileData.lastLogin instanceof Timestamp ? profileData.lastLogin.toDate() : profileData.lastLogin,
        };
        setUserProfile(processedProfileData);
        setLoading(false);
        return processedProfileData;
      } else {
        console.warn(`No user profile document found for UID: ${uid}`);
        setUserProfile(null);
        // It's important to set an error if profile doesn't exist for a supposedly logged-in user.
        setError("User profile not found. This could be due to incomplete sign-up or data issues.");
        setLoading(false);
        return null;
      }
    } catch (err: any) {
      console.error("Error fetching user profile: ", err);
      const errorMessage = `Failed to fetch profile: ${err.message || 'Unknown error'}. Code: ${err.code || 'N/A'}`;
      setError(errorMessage);
      setUserProfile(null);
      setLoading(false);
      return null; // Return null instead of throwing, let UI handle error state from context
    }
  }, []);

  const updateFirestoreProfileCallback = useCallback(async (uid: string, data: Partial<UserProfile>) => {
    setError(null);
    try {
      const userDocRef = doc(db, 'users', uid);
      await updateDoc(userDocRef, data);
      setUserProfile(prev => {
        if (!prev) return null;
        const updatedProfile = { ...prev, ...data };
        if (updatedProfile.createdAt && updatedProfile.createdAt instanceof Timestamp) {
            updatedProfile.createdAt = updatedProfile.createdAt.toDate();
        }
        if (updatedProfile.lastLogin && updatedProfile.lastLogin instanceof Timestamp) {
            updatedProfile.lastLogin = updatedProfile.lastLogin.toDate();
        }
        return updatedProfile;
      });
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
      setError(null); // Clear previous errors on new auth state
      if (firebaseUser) {
        console.log("Auth state changed: user logged in", firebaseUser.uid);
        setUser(firebaseUser);
        try {
          const fetchedProfile = await fetchUserProfileCallback(firebaseUser.uid);
          if (!fetchedProfile) {
            // If profile fetch returned null (which now happens on error or not found),
            // error state would have been set by fetchUserProfileCallback.
            // Consider if any additional action is needed here, e.g., logging out the user.
            console.warn(`Profile could not be loaded for user ${firebaseUser.uid}. Error state should be set.`);
          }
        } catch (profileError: any) { // This catch might be redundant if fetchUserProfileCallback doesn't throw
          console.error("Unexpected error during profile fetch in onAuthStateChanged:", profileError);
          setError(`Error loading profile: ${profileError.message || 'Unknown profile error'}`);
        }
        // setLoading(false) is managed within fetchUserProfileCallback
      } else {
        console.log("Auth state changed: user logged out");
        setUser(null);
        setUserProfile(null);
        setLoading(false);
      }
    }, (authError) => { // Error observer for onAuthStateChanged itself
      console.error("Firebase Auth state error (onAuthStateChanged):", authError);
      setError(`Authentication error: ${authError.message || 'Failed to initialize or monitor auth state'}`);
      setUser(null);
      setUserProfile(null);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [fetchUserProfileCallback]); // Added fetchUserProfileCallback to dependency array

  const signUp = async (username: string, email: string, pass: string) => {
    setLoading(true);
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      const newUser = userCredential.user;
      const userDocRef = doc(db, 'users', newUser.uid);
      const newProfileData: UserProfile = {
        uid: newUser.uid,
        email: newUser.email,
        username: username,
        coins: 1000,
        createdAt: serverTimestamp() as Timestamp, // Firestore will convert this
        avatarUrl: `https://placehold.co/128x128.png?text=${username.charAt(0).toUpperCase()}`
      };
      await setDoc(userDocRef, newProfileData);
      setUserProfile({ // Set local profile state, ensuring dates are JS Dates
          ...newProfileData,
          createdAt: new Date(), // Approximate with client date for immediate UI
      });
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
      // Profile fetching is handled by onAuthStateChanged, but we can update lastLogin here
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
        const newProfileData: UserProfile = {
          uid: googleUser.uid,
          email: googleUser.email,
          username: googleUser.displayName || googleUser.email?.split('@')[0] || 'User',
          avatarUrl: googleUser.photoURL || `https://placehold.co/128x128.png?text=${(googleUser.displayName || 'U').charAt(0).toUpperCase()}`,
          coins: 1000,
          createdAt: serverTimestamp() as Timestamp,
          lastLogin: serverTimestamp() as Timestamp
        };
        await setDoc(userDocRef, newProfileData);
        setUserProfile({ // Approximate with client dates for immediate UI
            ...newProfileData,
            createdAt: new Date(),
            lastLogin: new Date()
        });
      } else {
        await updateDoc(userDocRef, {
          lastLogin: serverTimestamp(),
          avatarUrl: googleUser.photoURL || userDocSnap.data()?.avatarUrl, // Keep existing avatar if Google doesn't provide one
        });
        // Existing profile will be fetched by onAuthStateChanged
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
      // setUser and setUserProfile to null is handled by onAuthStateChanged
      toast({ title: "Logged Out", description: "You have been successfully logged out." });
      router.push('/auth');
    } catch (err: any) {
      console.error("Sign out error:", err);
      const specificError = err.code ? `${err.code}: ${err.message}` : err.message;
      setError(specificError);
      toast({ title: "Logout Failed", description: specificError, variant: "destructive" });
    } finally {
      setLoading(false); // Ensure loading is set to false even if onAuthStateChanged is slow
    }
  };

  const updateUserProfileInContext = (profileData: Partial<UserProfile>) => {
    setUserProfile(prev => {
      if (!prev) return null;
      const updatedProfile = { ...prev, ...profileData };
      // Ensure date types are consistently JS Date objects after update
      if (updatedProfile.createdAt && updatedProfile.createdAt instanceof Timestamp) {
          updatedProfile.createdAt = updatedProfile.createdAt.toDate();
      }
      if (updatedProfile.lastLogin && updatedProfile.lastLogin instanceof Timestamp) {
          updatedProfile.lastLogin = updatedProfile.lastLogin.toDate();
      }
      return updatedProfile;
    });
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
        fetchUserProfile: fetchUserProfileCallback,
        updateFirestoreProfile: updateFirestoreProfileCallback
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


    