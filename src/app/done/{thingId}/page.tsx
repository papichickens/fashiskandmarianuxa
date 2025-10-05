// src/app/things/[thingId]/page.tsx
'use client'; // This directive means React.use() might not be strictly necessary for params in *this* component
              // but if the warning persists, it indicates params is still a promise from a server boundary.

import React, { useState, useEffect } from 'react';
import { getThingById, Thing } from '../../../../lib/thingsService';
import { notFound, useRouter } from 'next/navigation';
import Button from '../../../../components/Button';
import { colors } from '../../../../styles/color';
import { useAuth } from '../../context/AuthContext';

interface ThingDetailsPageProps {
  // params here is explicitly { thingId: string } for type safety,
  // but if it's a Promise in practice, React.use() handles it.
  params: { thingId: string }; 
}

export default function ThingDetailsPage({ params: rawParams }: ThingDetailsPageProps) {
  // Use React.use() if `rawParams` is indeed a Promise.
  // This line would effectively become `const params = await rawParams;` if it were an async component.
  // For client components, if the warning persists, it means the *prop itself* is a Promise.
  // You might need to cast or use a direct `await` inside a server component or a library that handles this.
  // However, the warning implies React.use() is the intended path for this specific scenario.
  const params = React.use(Promise.resolve(rawParams)); // Wrap in Promise.resolve for type safety and consistency
                                                        // if `rawParams` is already an object, this is benign.
                                                        // If `rawParams` *is* a Promise, this unwraps it.

  const { thingId } = params; // Access after unwrapping

  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [thing, setThing] = useState<Thing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchThing = async () => {
      if (!authLoading && user) {
        setIsLoading(true);
        setError(null);
        try {
          const fetchedThing = await getThingById(thingId);
          if (!fetchedThing || fetchedThing.status === 'done') {
            notFound();
            return;
          }
          setThing(fetchedThing);
        } catch (err) {
          console.error("Error fetching thing:", err);
          setError("Failed to load thing details.");
        } finally {
          setIsLoading(false);
        }
      } else if (!authLoading && !user) {
        router.push('/signin');
      }
    };

    fetchThing();
  }, [thingId, authLoading, user, router]);

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: colors.background, color: colors.subheadingText }}>
        Loading thing details...
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

  if (!thing) {
    return null;
  }

  const handleMarkAsDone = () => {
    console.log(`Marking "${thing.title}" as done.`);
    alert(`"${thing.title}" marked as done! (Mock action)`);
    router.push('/done');
  };

  return (
    <div 
      className="max-w-xl mx-auto p-6 shadow-md rounded-lg"
      style={{ backgroundColor: colors.cardBackground }}
    >
      <h2 className="text-3xl font-bold mb-4" style={{ color: colors.headingText }}>{thing.title}</h2>
      {thing.notes && (
        <p className="mb-6 whitespace-pre-wrap" style={{ color: colors.subheadingText }}>{thing.notes}</p>
      )}
      <p className="text-sm mb-6" style={{ color: colors.subheadingText }}>
        Added on: {new Date(thing.createdAt).toLocaleDateString()}
      </p>

      <Button onClick={handleMarkAsDone} className="w-full">
        Mark as Done & Add Photo (Later)
      </Button>

      <Button variant="ghost" onClick={() => router.back()} className="w-full mt-4">
        Back to Planned
      </Button>
    </div>
  );
}