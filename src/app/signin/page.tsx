// src/app/signin/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import Link from 'next/link';
import { colors } from '../../../styles/color';
import { auth } from '../../../lib/firebase'; // Import auth from your firebase.ts
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from 'firebase/auth'; // Import Firebase auth functions
import { useRouter } from 'next/navigation';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState<User | null>(null); // To store the authenticated user
  const [loading, setLoading] = useState(true); // Loading state for auth check
  const [error, setError] = useState<string | null>(null); // State for displaying errors
  const router = useRouter();

  useEffect(() => {
    // Listen for authentication state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      // If a user is logged in and tries to access /signin, redirect them to home
      if (currentUser) {
        router.push('/');
      }
    });
    return () => unsubscribe(); // Cleanup subscription
  }, [router]); // Add router to dependency array to avoid lint warnings

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // Clear previous errors
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // The onAuthStateChanged listener will handle the redirect to '/'
    } catch (firebaseError: any) {
      console.error('Error signing in:', firebaseError.message);
      let errorMessage = 'Sign In Failed. Please check your credentials.';
      // Provide more specific feedback for common errors
      if (firebaseError.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address format.';
      } else if (firebaseError.code === 'auth/user-not-found' || firebaseError.code === 'auth/wrong-password') {
        errorMessage = 'Invalid email or password.';
      } else if (firebaseError.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed login attempts. Please try again later.';
      }
      setError(errorMessage);
    }
  };

  const handleSignOut = async () => {
    setError(null); // Clear previous errors
    try {
      await signOut(auth);
      // The onAuthStateChanged listener will update the user state and implicitly show the sign-in form
    } catch (firebaseError: any) {
      console.error('Error signing out:', firebaseError.message);
      setError(`Sign Out Failed: ${firebaseError.message}`);
    }
  };

  if (loading) {
    return (
      <div
        className="max-w-md mx-auto p-6 text-center mt-10"
        style={{ color: colors.subheadingText }}
      >
        Loading authentication state...
      </div>
    );
  }

  // If user is logged in, we are redirecting in useEffect.
  // This component should primarily display the sign-in form.
  // We can show a simple message if somehow they stay on this page after login.
  if (user) {
    return null; // or a loading spinner, as the redirect should happen instantly
  }


  return (
    <div
      className="max-w-md mx-auto p-6 shadow-md rounded-lg mt-10"
      style={{ backgroundColor: colors.cardBackground }}
    >
      <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: colors.headingText }}>
        Sign In
      </h2>

      {error && (
        <p className="text-red-500 text-center mb-4">{error}</p>
      )}

      <form onSubmit={handleSignIn}>
        <Input
          id="email"
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mb-4"
          placeholder="your@email.com"
        />
        <Input
          id="password"
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="mb-6"
          placeholder="password"
        />
        <Button type="submit" className="w-full mt-4">Sign In</Button>
      </form>

      {/* This section will now only be reachable if the user is somehow on /signin AND logged in.
          The useEffect handles redirecting logged-in users, so this block might rarely be seen.
          However, keeping it consistent with the previous design for context.
       */}
      {/* {user && (
        <div className="mt-8 text-center">
          <p className="mb-4" style={{ color: colors.subheadingText }}>
            You are currently signed in as {user.email}.
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/" passHref>
              <Button variant="secondary">Go to Home</Button>
            </Link>
            <Button onClick={handleSignOut} variant="danger">Sign Out</Button>
          </div>
        </div>
      )} */}
    </div>
  );
}