// src/app/add-thing/page.tsx
'use client';

import React, { useState } from 'react';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import { useRouter } from 'next/navigation';
import { colors } from '../../../styles/color';
import { addThing } from '../../../lib/thingsService';
import { useAuth } from '../context/AuthContext'; // Import useAuth to get the current user

export default function AddThingPage() {
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { user, loading, userProfile, partnerName } = useAuth(); // Get user, loading, userProfile, and partnerName from AuthContext

  const currentPartnerName = partnerName; // Use the partnerName from AuthContext

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('You need to type something!');
      return;
    }
    if (loading || !user || !userProfile) { // Also check for userProfile now
      alert('You must be logged in and your profile loaded to add a thing.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Pass userProfile.displayName for the addedBy field
      const newThingId = await addThing(title.trim(), userProfile.displayName, notes.trim() || undefined);
      console.log('Adding new thing:', { title, notes, newThingId });
      alert('Thing Added!');
      router.push('/'); // Navigate back to planned list
    } catch (error) {
      console.error('Error adding thing:', error);
      alert('Failed to add thing. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
    >
      <div
        className="relative w-full max-w-lg p-6 pb-8 rounded-t-3xl shadow-lg transform transition-all duration-300 ease-out translate-y-0"
        style={{
          backgroundColor: colors.background,
        }}
      >
        {/* Close Button (X) */}
        <button
          onClick={() => router.back()}
          className="absolute top-4 right-4 text-2xl font-light leading-none"
          style={{ color: colors.subheadingText }}
          aria-label="Close"
        >
          &times;
        </button>

        <h2
          className="text-3xl font-bold mb-8 text-center"
          style={{ color: colors.headingText }}
        >
          What's something you'd<br/>like to do with {currentPartnerName}
        </h2>

        <form onSubmit={handleSubmit}>
          {/* Custom Input Styling for Title */}
          <Input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full text-center text-xl py-3 px-4 rounded-full shadow-inner focus:ring-2 focus:ring-blue-300 focus:border-blue-300 mb-4"
            style={{
              backgroundColor: colors.cardBackground,
              color: colors.headingText,
              border: 'none',
            }}
            placeholder="passear o sushi"
            disabled={isSubmitting}
          />

          {/* New TextArea for Notes */}
          <textarea
            id="notes"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-inner focus:outline-none focus:ring-blue-300 focus:border-blue-300 sm:text-lg"
            style={{
              backgroundColor: colors.cardBackground,
              color: colors.headingText,
              borderColor: colors.borderGray,
              resize: 'none',
            }}
            placeholder="Add some notes (optional)"
            disabled={isSubmitting}
          />

          {/* Add Thing Button */}
          <Button
            type="submit"
            className="w-full mt-8 py-3 rounded-full text-xl"
            style={{
              backgroundColor: '#EB5B46',
              color: 'white',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}
            disabled={isSubmitting || !userProfile} // Disable if profile not loaded
          >
            {isSubmitting ? 'Adding...' : 'Add Thing'}
          </Button>
        </form>
      </div>
    </div>
  );
}