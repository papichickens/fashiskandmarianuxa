// src/app/page.tsx
'use client';

import Link from 'next/link';
import { colors } from '../../styles/color';
import React, { useState, useEffect, useCallback } from 'react'; // Added useCallback
import { useAuth } from '../app/context/AuthContext';
import { auth } from '../../lib/firebase';
import { signOut } from 'firebase/auth';
import { getPlannedThings, getDoneThings, Thing } from '../../lib/thingsService';
import ThingDetailModal from '../../components/ThingDetailModal'; // Import the new modal component

export default function HomePage() {
  const { user, loading: authLoading, partnerName } = useAuth(); // Renamed loading to authLoading
  const [plannedThings, setPlannedThings] = useState<Thing[]>([]);
  const [doneThingsCount, setDoneThingsCount] = useState(0);
  const [isLoadingThings, setIsLoadingThings] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedThingId, setSelectedThingId] = useState<string | null>(null);

  // Memoized function to fetch data
  const fetchThings = useCallback(async () => {
    if (!authLoading && user) {
      setIsLoadingThings(true);
      setError(null);
      try {
        const fetchedPlannedThings = await getPlannedThings();
        setPlannedThings(fetchedPlannedThings);

        const fetchedDoneThings = await getDoneThings();
        setDoneThingsCount(fetchedDoneThings.length);
      } catch (err: any) {
        console.error("Error fetching things:", err);
        setError("Failed to load things. Please try again.");
      } finally {
        setIsLoadingThings(false);
      }
    } else if (!authLoading && !user) {
      // If not loading and no user, clear things (redirect will handle auth)
      setPlannedThings([]);
      setDoneThingsCount(0);
      setIsLoadingThings(false);
    }
  }, [authLoading, user]); // Dependencies for useCallback

  // Fetch things from Firestore when component mounts or user/loading changes
  useEffect(() => {
    fetchThings();
  }, [fetchThings]); // Depend on memoized fetchThings

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (firebaseError: any) {
      console.error('Error signing out:', firebaseError.message);
      alert(`Sign Out Failed: ${firebaseError.message}`);
    }
  };

  const openModal = (thingId: string) => {
    setSelectedThingId(thingId);
    setIsModalOpen(true);
  };

  const closeModal = (refetch: boolean = false) => {
    setIsModalOpen(false);
    setSelectedThingId(null);
    if (refetch) {
      fetchThings(); // Refetch all data if the modal signaled a change
    }
  };

  // Display loading state
  if (isLoadingThings || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: colors.background, color: colors.subheadingText }}>
        Loading your shared things...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8" style={{ color: colors.subheadingText }}>
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()} // Simple reload to retry
          className="mt-4 px-6 py-3 rounded-full text-lg font-semibold"
          style={{
            backgroundColor: colors.primaryAccent,
            color: 'white',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}
        >
          Reload Page
        </button>
      </div>
    );
  }

  return (
    <div className="relative pb-20">
      {/* Custom Header */}
      <header
        className="flex justify-between items-center px-6 pt-6 pb-4"
        style={{ backgroundColor: colors.background }}
      >
        <div
          className="flex rounded-md p-1"
          style={{ backgroundColor: colors.borderGray }}
        >
          <Link href="/" passHref>
            <span
              className="px-4 py-1 rounded-md text-sm font-semibold cursor-pointer"
              style={{ backgroundColor: colors.cardBackground, color: colors.headingText }}
            >
              to-do
            </span>
          </Link>
          <Link href="/done" passHref>
            <span
              className="px-4 py-1 rounded-md text-sm font-semibold cursor-pointer"
              style={{ backgroundColor: 'transparent', color: colors.subheadingText }}
            >
              done
            </span>
          </Link>
        </div>

        {/* Right side of header: Add button and new Sign Out button */}
        <div className="flex items-center space-x-4">
          <Link href="/add-thing" passHref>
            <span
              className="text-2xl font-semibold cursor-pointer"
              style={{ color: colors.primaryAccent }}
            >
              +
            </span>
          </Link>
          {user && (
            <button
              onClick={handleSignOut}
              className="px-3 py-1 text-sm rounded-md font-semibold"
              style={{ backgroundColor: colors.primaryAccent, color: colors.cardBackground }}
            >
              Sign Out
            </button>
          )}
        </div>
      </header>

      <div className="max-w-xl mx-auto px-4 mt-8">
        <div
          className="p-6 rounded-2xl shadow-md mb-8"
          style={{ backgroundColor: colors.cardBackground }}
        >
          <h2 className="text-4xl font-bold mb-2" style={{ color: colors.headingText }}>
            Things with {partnerName}
          </h2>
          <div className="flex items-center text-lg" style={{ color: colors.subheadingText }}>
            <span className="mr-2">{doneThingsCount} things done</span>
            <span style={{ color: colors.heartIcon }}>❤️</span>
          </div>
        </div>

        <h3 className="text-xl font-semibold mb-4" style={{ color: colors.headingText }}>Things</h3>

        {plannedThings.length === 0 ? (
          <div className="text-center py-8" style={{ color: colors.subheadingText }}>
            <p>No planned items yet! Time to dream up some adventures.</p>
            <Link href="/add-thing" passHref>
              <button
                className="mt-4 px-6 py-3 rounded-full text-lg font-semibold"
                style={{
                  backgroundColor: '#EB5B46',
                  color: 'white',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}
              >
                Add Your First Thing
              </button>
            </Link>
          </div>
        ) : (
          <ul className="space-y-4">
            {plannedThings.map((thing, index) => (
              <li key={thing.id} className="relative z-[1]" style={{
                marginTop: index > 0 ? '-1rem' : '0', color: colors.background
              }}>
                {/* Change Link to div with onClick */}
                <div
                  onClick={() => openModal(thing.id)} // Open modal on click
                  className="block cursor-pointer p-6 rounded-xl shadow-md"
                  style={{
                    backgroundColor: colors.primaryAccent,
                    color: colors.cardBackground,
                    transform: `rotate(${index % 2 === 0 ? -1.5 : 1.5}deg)`,
                    transition: 'transform 0.2s ease-in-out',
                    zIndex: plannedThings.length - index
                  }}
                >
                  <h3 className="text-3xl font-bold">{thing.title}</h3>
                  {thing.addedBy && (
                    <p className="text-sm opacity-80 mt-2">Added by {thing.addedBy}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Render the Modal */}
      {isModalOpen && (
        <ThingDetailModal
          thingId={selectedThingId}
          isOpen={isModalOpen}
          onClose={closeModal}
        />
      )}
    </div>
  );
}