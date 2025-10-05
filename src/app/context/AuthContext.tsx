// src/app/context/AuthContext.tsx
'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode
} from 'react';
import {
  auth
} from '../../../lib/firebase';
import {
  User,
  onAuthStateChanged
} from 'firebase/auth';
import { getUserProfile, UserProfile } from '../../../lib/thingsService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  userProfile: UserProfile | null; // Added userProfile to the context type
  partnerName: string; // Added for easy access in UI
}

// Default partner name if userProfile isn't loaded yet, or for general display
const DEFAULT_PARTNER_NAME = "Partner";

const AuthContext = createContext < AuthContextType | undefined > (undefined);

export function AuthProvider({
  children
}: {
  children: ReactNode
}) {
  const [user, setUser] = useState < User | null > (null);
  const [userProfile, setUserProfile] = useState < UserProfile | null > (null); // New state for user profile
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // If a user is logged in, fetch their profile
        try {
          const profile = await getUserProfile(currentUser.uid);
          setUserProfile(profile || null); // Set profile, or null if not found
          // TODO: Implement logic to create user profile if not found,
          // OR ensure profiles are manually pre-created in Firebase Console.
          // For now, if profile is null, displayName/partnerName will be empty/default.
        } catch (error) {
          console.error("Error fetching user profile:", error);
          setUserProfile(null);
        }
      } else {
        // If no user, clear the profile
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Determine partnerName based on loaded userProfile
  const currentPartnerName = userProfile?.partnerName || DEFAULT_PARTNER_NAME;


  return (
    <AuthContext.Provider value={{ user, loading, userProfile, partnerName: currentPartnerName }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}