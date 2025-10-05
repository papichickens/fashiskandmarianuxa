import { db } from './firebase';
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  updateDoc,
  getDoc,
  serverTimestamp,
  setDoc, // Import setDoc for creating/updating user profiles
  QueryDocumentSnapshot,
  DocumentData,
} from 'firebase/firestore';

// Define the interface for a Thing document (updated addedBy to string, expecting display name)
export interface Thing {
  id: string; // This will be the Firestore doc.id
  title: string;
  notes?: string;
  status: 'planned' | 'done';
  createdAt: Date; // Stored as Timestamp in Firestore, converted to Date in client
  doneAt?: Date; // Stored as Timestamp in Firestore, converted to Date in client
  photoUrl?: string;
  addedBy: string; // Now storing displayName, not UID
}

// Define the interface for a User Profile document
export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  partnerName: string;
  createdAt: Date;
}

// Helper to convert Firestore document to our Thing interface
const formatThingDocument = (doc: QueryDocumentSnapshot<DocumentData>): Thing => {
  const data = doc.data();
  return {
    id: doc.id,
    title: data.title,
    notes: data.notes,
    status: data.status,
    createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
    doneAt: data.doneAt ? data.doneAt.toDate() : undefined,
    photoUrl: data.photoUrl,
    addedBy: data.addedBy, // This will now be displayName
  };
};

// Helper to convert Firestore document to our UserProfile interface
const formatUserProfileDocument = (doc: QueryDocumentSnapshot<DocumentData>): UserProfile => {
  const data = doc.data();
  return {
    uid: doc.id,
    email: data.email,
    displayName: data.displayName,
    partnerName: data.partnerName,
    createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
  };
};

// --- CRUD Operations for 'things' Collection (updated addedBy param) ---

/**
 * Adds a new 'thing' to the Firestore database.
 * @param title The title of the thing.
 * @param addedByDisplayName The displayName of the user adding the thing.
 * @param notes Optional notes for the thing.
 * @returns The ID of the newly created document.
 */
export const addThing = async (title: string, addedByDisplayName: string, notes?: string): Promise<string> => {
  if (!addedByDisplayName) throw new Error('User display name is required to add a thing.');

  const docRef = await addDoc(collection(db, 'things'), {
    title,
    notes: notes || null,
    status: 'planned',
    createdAt: serverTimestamp(),
    addedBy: addedByDisplayName, // Store display name here
  });
  return docRef.id;
};

// ... (getPlannedThings, getDoneThings, getThingById, markThingAsDone, updateThingNotes, deleteThing remain the same) ...
// Ensure you update the existing getThingById function type to match the new Thing interface as well

// Just ensuring the existing functions use the correct Thing interface
export const getPlannedThings = async (): Promise<Thing[]> => {
  const q = query(
    collection(db, 'things'),
    where('status', '==', 'planned'),
    orderBy('createdAt', 'desc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(formatThingDocument);
};

export const getDoneThings = async (): Promise<Thing[]> => {
  const q = query(
    collection(db, 'things'),
    where('status', '==', 'done'),
    orderBy('doneAt', 'desc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(formatThingDocument);
};

export const getThingById = async (thingId: string): Promise<Thing | undefined> => {
  const docRef = doc(db, 'things', thingId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return formatThingDocument(docSnap as QueryDocumentSnapshot<DocumentData>);
  } else {
    return undefined;
  }
};

export const markThingAsDone = async (thingId: string, photoUrl?: string): Promise<void> => {
  const thingRef = doc(db, 'things', thingId);
  await updateDoc(thingRef, {
    status: 'done',
    doneAt: serverTimestamp(),
    ...(photoUrl && { photoUrl }),
  });
};

// --- CRUD Operations for 'users' Collection ---

/**
 * Fetches a user's profile by their UID.
 * @param uid The UID of the user.
 * @returns The UserProfile object or undefined if not found.
 */
export const getUserProfile = async (uid: string): Promise<UserProfile | undefined> => {
  const userRef = doc(db, 'users', uid);
  const docSnap = await getDoc(userRef);

  if (docSnap.exists()) {
    return formatUserProfileDocument(docSnap as QueryDocumentSnapshot<DocumentData>);
  } else {
    return undefined;
  }
};

/**
 * Creates or updates a user's profile.
 * Use this carefully, typically only during initial setup or a specific onboarding flow.
 * For this two-person app, you might only create them manually in the Firebase Console.
 * @param uid The UID of the user.
 * @param email The user's email.
 * @param displayName The user's preferred name.
 * @param partnerName The name of their partner.
 * @returns The created/updated UserProfile object.
 */
export const createOrUpdateUserProfile = async (
  uid: string,
  email: string,
  displayName: string,
  partnerName: string
): Promise<UserProfile> => {
  const userRef = doc(db, 'users', uid);
  const userProfileData = {
    uid, // Redundant but explicit for clarity
    email,
    displayName,
    partnerName,
    createdAt: serverTimestamp(), // Only set on initial creation for consistent timestamp
  };

  // setDoc with { merge: true } would update existing fields without overwriting the whole doc.
  // For initial creation, a simple setDoc is fine.
  await setDoc(userRef, userProfileData, { merge: true }); // Use merge: true to avoid overwriting createdAt if it exists

  // Refetch to get the actual serverTimestamp if it was just set
  const updatedDocSnap = await getDoc(userRef);
  if (updatedDocSnap.exists()) {
    return formatUserProfileDocument(updatedDocSnap as QueryDocumentSnapshot<DocumentData>);
  } else {
    // This case should ideally not happen after a setDoc
    throw new Error('Failed to retrieve user profile after creation/update.');
  }
};