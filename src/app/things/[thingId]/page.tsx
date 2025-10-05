// src/app/things/[thingId]/page.tsx
'use client'; 

import React from 'react';
import { getThingById, Thing } from '../../../../lib/mockData';
import { notFound, useRouter } from 'next/navigation';
import Button from '../../../../components/Button';
import { colors } from '../../../../styles/color';

interface ThingDetailsPageProps {
  params: { thingId: string };
}

export default function ThingDetailsPage({ params }: ThingDetailsPageProps) {
  const { thingId } = params;
  const thing: Thing | undefined = getThingById(thingId);
  const router = useRouter();

  if (!thing || thing.status === 'done') {
    notFound();
  }

  const handleMarkAsDone = () => {
    console.log(`Marking "${thing.title}" as done.`);
    alert(`"${thing.title}" marked as done! (Mock action)`);
    router.push('/done');
  };

  return (
    <div 
      className="max-w-xl mx-auto p-6 shadow-md rounded-lg"
      style={{ backgroundColor: colors.cardBackground }} // Card background
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

      <Button variant="ghost" onClick={() => router.back()} className="w-full mt-4"> {/* Changed to ghost */}
        Back to Planned
      </Button>
    </div>
  );
}