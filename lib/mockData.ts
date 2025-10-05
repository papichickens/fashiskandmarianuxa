// src/lib/mockData.ts

export interface Thing {
  id: string;
  title: string;
  notes?: string;
  status: 'planned' | 'done';
  createdAt: string;
  doneAt?: string;
  photoUrl?: string;
}

export const mockThings: Thing[] = [
  {
    id: '1',
    title: 'Plan a weekend getaway',
    notes: 'Research cabins near the mountains or beach.',
    status: 'planned',
    createdAt: '2023-10-26T10:00:00Z',
  },
  {
    id: '2',
    title: 'Try that new restaurant',
    notes: 'The one with the great reviews for Italian food.',
    status: 'planned',
    createdAt: '2023-10-25T14:30:00Z',
  },
  {
    id: '3',
    title: 'Movie night: Oppenheimer + homemade popcorn',
    status: 'planned',
    createdAt: '2023-10-24T18:00:00Z',
  },
  {
    id: '4',
    title: 'Stargazing date',
    notes: 'Pack a blanket and hot cocoa.',
    status: 'done',
    createdAt: '2023-10-20T20:00:00Z',
    doneAt: '2023-10-21T22:30:00Z',
    photoUrl: 'https://via.placeholder.com/400x300/4CAF50/FFFFFF?text=Stargazing',
  },
  {
    id: '5',
    title: 'Hiking adventure',
    notes: 'Found a beautiful trail with a waterfall!',
    status: 'done',
    createdAt: '2023-10-15T09:00:00Z',
    doneAt: '2023-10-15T15:00:00Z',
    photoUrl: 'https://via.placeholder.com/400x300/2196F3/FFFFFF?text=Hiking',
  },
];

export const getThingById = (id: string): Thing | undefined => {
  return mockThings.find(thing => thing.id === id);
};