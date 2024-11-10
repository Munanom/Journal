'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { collection, query, where, orderBy, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from './AuthContext';

const EntriesContext = createContext();

export function EntriesProvider({ children }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchEntries = async () => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching entries for user:', user.uid);
      const entriesRef = collection(db, 'entries');
      const q = query(
        entriesRef,
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const entriesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log('Fetched entries:', entriesData);
      setEntries(entriesData);
    } catch (error) {
      console.error('Error fetching entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const addEntry = async (entryData) => {
    try {
      const entry = {
        ...entryData,
        userId: user.uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, 'entries'), entry);
      const newEntry = { id: docRef.id, ...entry };
      
      // Update local state
      setEntries(prevEntries => [newEntry, ...prevEntries]);
      
      return newEntry;
    } catch (error) {
      console.error('Error adding entry:', error);
      throw error;
    }
  };

  // Fetch entries when user changes
  useEffect(() => {
    fetchEntries();
  }, [user]);

  const value = {
    entries,
    loading,
    fetchEntries,
    addEntry
  };

  return (
    <EntriesContext.Provider value={value}>
      {children}
    </EntriesContext.Provider>
  );
}

export function useEntries() {
  const context = useContext(EntriesContext);
  if (context === undefined) {
    throw new Error('useEntries must be used within an EntriesProvider');
  }
  return context;
}
