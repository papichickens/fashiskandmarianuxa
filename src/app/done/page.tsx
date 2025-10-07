// src/app/done/page.tsx
'use client'; 

import Link from 'next/link';
import Image from 'next/image';
import { colors } from '../../../styles/color';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getDoneThings, Thing } from '../../../lib/thingsService';

export default function DonePage() {
  const { user, loading: authLoading } = useAuth();
  const [doneThings, setDoneThings] = useState<Thing[]>([]);
  const [isLoadingThings, setIsLoadingThings] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchDoneThings = async () => {
      if (!authLoading && user) {
        setIsLoadingThings(true);
        setError(null);
        try {
          const fetchedDoneThings = await getDoneThings();
          // Sort fetched things by doneAt in descending order
          const sortedDoneThings = fetchedDoneThings.sort((a, b) => 
            (b.doneAt?.getTime() || 0) - (a.doneAt?.getTime() || 0)
          );
          setDoneThings(sortedDoneThings);
        } catch (err: any) {
          console.error("Error fetching done things:", err);
          setError("Failed to load memories. Please try again.");
        } finally {
          setIsLoadingThings(false);
        }
      } else if (!authLoading && !user) {
        // If not logged in, clear things
        setDoneThings([]);
        setIsLoadingThings(false);
      }
    };

    fetchDoneThings();
  }, [authLoading, user]); // Depend on auth state

  if (authLoading || isLoadingThings) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: colors.background, color: colors.subheadingText }}>
        Loading your memories...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8" style={{ color: colors.subheadingText }}>
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
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
      {/* Custom Header - Replicated from HomePage */}
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
              style={{ backgroundColor: 'transparent', color: colors.subheadingText }}
            >
              to-do
            </span>
          </Link>
          <Link href="/done" passHref>
            <span 
              className="px-4 py-1 rounded-md text-sm font-semibold cursor-pointer" 
              style={{ backgroundColor: colors.cardBackground, color: colors.headingText }}
            >
              done
            </span>
          </Link>
        </div>

        <Link href="/add-thing" passHref>
          <span 
            className="text-2xl font-semibold cursor-pointer" 
            style={{ color: colors.primaryAccent }}
          >
            +
          </span>
        </Link>
      </header>

      <div className="max-w-4xl mx-auto px-4 mt-8">
        <h2 className="text-3xl font-bold mb-6 text-center" style={{ color: colors.headingText }}>
          Our Memories
        </h2>

        {doneThings.length === 0 ? (
          <div className="text-center py-8" style={{ color: colors.subheadingText }}>
            <p>No memories yet! Go mark some things as done.</p>
            <button 
              onClick={() => router.push('/')}
              className="mt-4 px-6 py-3 rounded-full text-lg font-semibold"
              style={{ 
                backgroundColor: '#EB5B46',
                color: 'white', 
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
              }}
            >
              Back to Planned Things
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {doneThings.map((thing) => (
              <Link href={`/done/${thing.id}`} key={thing.id} passHref>
                <div 
                  className="block cursor-pointer rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200"
                  style={{ backgroundColor: colors.buttonRed }}
                >
                  <div className="w-full h-48 relative">
                    <Image
                      src={thing.photoUrl || 'https://via.placeholder.com/400x300/CCCCCC/FFFFFF?text=No+Photo'}
                      alt={thing.title}
                      fill
                      style={{ objectFit: 'cover' }}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-xl font-semibold" style={{ color: colors.headingText }}>{thing.title}</h3>
                    <p className="text-sm mt-2" style={{ color: colors.subheadingText }}>
                      Done on: {thing.doneAt ? new Date(thing.doneAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}