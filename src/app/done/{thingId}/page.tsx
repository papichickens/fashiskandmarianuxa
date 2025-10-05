// src/app/done/[thingId]/page.tsx
'use client'; // This component needs to be client-side to use useRouter and state

import { getThingById, Thing } from '../../../../lib/thingsService'; // Import from thingsService (Firestore)
import { notFound, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Button from '../../../../components/Button';
import { colors } from '../../../../styles/color';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

interface DoneDetailsPageProps {
  params: { thingId: string };
}

export default function DoneDetailsPage({ params }: DoneDetailsPageProps) {
  const { thingId } = params;
  const router = useRouter();
  const { user, loading: authLoading } = useAuth(); // Get user and auth loading state
  const [thing, setThing] = useState<Thing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchThing = async () => {
      if (!authLoading && user) { // Only fetch if authenticated
        setIsLoading(true);
        setError(null);
        try {
          const fetchedThing = await getThingById(thingId);
          if (!fetchedThing || fetchedThing.status === 'planned') {
            notFound(); // Use Next.js notFound if not found or status is wrong
          }
          setThing(fetchedThing);
        } catch (err) {
          console.error("Error fetching thing:", err);
          setError("Failed to load memory details.");
        } finally {
          setIsLoading(false);
        }
      } else if (!authLoading && !user) {
        // If not logged in, redirect or show error
        notFound(); // Or router.push('/signin')
      }
    };

    fetchThing();
  }, [thingId, authLoading, user, router]); // Add dependencies

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: colors.background, color: colors.subheadingText }}>
        Loading memory details...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8" style={{ color: colors.subheadingText }}>
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => router.back()} className="mt-4">Go Back</Button>
      </div>
    );
  }

  // If thing is null after loading and no error, it means notFound was called,
  // or it failed to fetch. The notFound() call will stop rendering.
  if (!thing) {
    return null; // Should not be reached if notFound() works, but as a safeguard
  }

  return (
    <div 
      className="max-w-2xl mx-auto p-6 shadow-md rounded-lg"
      style={{ backgroundColor: colors.cardBackground }} // Card background
    >
      <h2 className="text-3xl font-bold mb-4" style={{ color: colors.headingText }}>{thing.title}</h2>

      <div className="relative w-full h-80 mb-6 bg-gray-100 rounded-md overflow-hidden">
        <Image
          src={thing.photoUrl || 'https://via.placeholder.com/800x600/CCCCCC/FFFFFF?text=No+Photo'}
          alt={thing.title}
          fill
          style={{ objectFit: 'cover' }}
          sizes="100vw"
          priority
        />
      </div>

      {thing.notes && (
        <p className="mb-4 whitespace-pre-wrap" style={{ color: colors.subheadingText }}>{thing.notes}</p>
      )}

      <p className="text-sm mb-2" style={{ color: colors.subheadingText }}>
        Added on: {new Date(thing.createdAt).toLocaleDateString()}
      </p>
      <p className="text-sm mb-6" style={{ color: colors.subheadingText }}>
        Done on: {thing.doneAt ? new Date(thing.doneAt).toLocaleDateString() : 'N/A'}
      </p>

      <Link href="/done" passHref>
        <Button variant="ghost" className="w-full">
          Back to Memories
        </Button>
      </Link>
    </div>
  );
}