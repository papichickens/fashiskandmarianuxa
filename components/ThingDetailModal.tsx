// components/ThingDetailModal.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { getThingById, markThingAsDone, Thing } from '../lib/thingsService'; // Assuming you'll add markThingAsDone
import { useAuth } from '../src/app/context/AuthContext';
import { colors } from '../styles/color';
import Button from './Button'; // Assuming Button component is in 'components'

interface ThingDetailModalProps {
  thingId: string | null; // Null when no thing is selected
  isOpen: boolean;
  onClose: (refetch?: boolean) => void; // Callback to close, with optional refetch signal
}

const ThingDetailModal: React.FC<ThingDetailModalProps> = ({ thingId, isOpen, onClose }) => {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [thing, setThing] = useState<Thing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Fetch thing details when modal opens or thingId changes
  useEffect(() => {
    const fetchThingDetails = async () => {
      if (!isOpen || !thingId || authLoading || !user) {
        setThing(null); // Clear previous thing data when modal is closed or not ready
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const fetchedThing = await getThingById(thingId);
        if (!fetchedThing) {
          setError("Thing not found.");
          setThing(null);
          return;
        }
        setThing(fetchedThing);
      } catch (err) {
        console.error("Error fetching thing details:", err);
        setError("Failed to load thing details.");
        setThing(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchThingDetails();
  }, [thingId, isOpen, authLoading, user]);

  if (!isOpen) {
    return null; // Don't render anything if modal is not open
  }

  // Handle click outside modal content
  const handleClickOutside = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
      onClose();
    }
  };

  const handleMarkAsDone = async () => {
    if (!thing) return;

    // TODO: Implement actual image upload logic here later!
    // For now, let's just mark it done without a photo URL.
    try {
      // You could prompt for a photo URL here or navigate to a dedicated "mark done" page
      // For simplicity, we'll mark as done without photo for now.
      await markThingAsDone(thing.id); // Call the Firestore service function
      alert(`"${thing.title}" marked as done!`);
      onClose(true); // Close modal and signal to refetch data on parent page
    } catch (err) {
      console.error("Error marking thing as done:", err);
      alert("Failed to mark thing as done. Please try again.");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)' }} // Dark overlay background
      onClick={handleClickOutside}
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-lg p-6 rounded-lg shadow-xl transform transition-all duration-300 ease-out translate-y-0"
        style={{
          backgroundColor: colors.cardBackground,
        }}
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
      >
        {/* Close Button (X) */}
        <button
          onClick={() => onClose()}
          className="absolute top-4 right-4 text-2xl font-light leading-none"
          style={{ color: colors.subheadingText }}
          aria-label="Close"
        >
          &times;
        </button>

        {isLoading && (
          <div className="text-center py-10" style={{ color: colors.subheadingText }}>
            Loading details...
          </div>
        )}

        {error && (
          <div className="text-center py-10 text-red-500">
            {error}
            <Button onClick={() => onClose()} variant="secondary" className="mt-4">Close</Button>
          </div>
        )}

        {thing && !isLoading && !error && (
          <>
            <h2 className="text-3xl font-bold mb-4" style={{ color: colors.headingText }}>
              {thing.title}
            </h2>

            {thing.photoUrl && ( // Display photo if available
              <div className="relative w-full h-48 mb-6 bg-gray-100 rounded-md overflow-hidden">
                <Image
                  src={thing.photoUrl}
                  alt={thing.title}
                  fill
                  style={{ objectFit: 'cover' }}
                  sizes="100vw"
                />
              </div>
            )}


            {thing.notes && (
              <p className="mb-6 whitespace-pre-wrap" style={{ color: colors.subheadingText }}>{thing.notes}</p>
            )}

            <p className="text-sm mb-2" style={{ color: colors.subheadingText }}>
              Added on: {new Date(thing.createdAt).toLocaleDateString()}
            </p>
            {thing.doneAt && (
              <p className="text-sm mb-6" style={{ color: colors.subheadingText }}>
                Done on: {new Date(thing.doneAt).toLocaleDateString()}
              </p>
            )}
            {thing.addedBy && (
              <p className="text-sm mb-6" style={{ color: colors.subheadingText }}>
                Added by: {thing.addedBy}
              </p>
            )}

            <div className="mt-6">
              <Button onClick={handleMarkAsDone} className="w-full bg-[#7B2C2D] text-white" variant="modal">
                Add Photo!
              </Button>
            </div>

            <div className="mt-4 flex justify-end gap-4">
              <Button variant="ghost" onClick={() => onClose()}>
                Close
              </Button>
              <Button onClick={handleMarkAsDone} className="bg-[#7B2C2D]" variant="primary">
                Done
              </Button>
            </div>
            
          </>
        )}
      </div>
    </div>
  );
};

export default ThingDetailModal;
