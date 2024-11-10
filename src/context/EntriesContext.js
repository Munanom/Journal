'use client';
import { createContext, useState, useEffect } from 'react';
import { getEntries, addEntry as addEntryToFirebase, updateEntry as updateEntryInFirebase, deleteEntry as deleteEntryFromFirebase } from '../firebase/firestore';
import { useAuth } from './AuthContext';
export const EntriesContext = createContext();

export const EntriesProvider = ({ children }) => {
  const [entries, setEntries] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
        fetchEntries();
      }
  }, [user]);

  const fetchEntries = async () => {
    try {
      const fetchedEntries = await getEntries(user.uid);
      setEntries(fetchedEntries);
    } catch (error) {
      console.error('Failed to fetch entries:', error);
    }
  };

  const addEntry = async (entry) => {
    try {
      const newEntry = await addEntryToFirebase(user.uid, entry);
      setEntries([...entries, newEntry]);
      return newEntry;
    } catch (error) {
      console.error('Failed to add entry:', error);
      throw error;
    }
  };

  const updateEntry = async (id, updatedEntry) => {
    try {
      await updateEntryInFirebase(user.uid, id, updatedEntry);
      setEntries(entries.map(entry => entry.id === id ? { ...entry, ...updatedEntry } : entry));
    } catch (error) {
      console.error('Failed to update entry:', error);
      throw error;
    }
};

  const deleteEntry = async (id) => {
    try {
      await deleteEntryFromFirebase(user.uid, id);
      setEntries(entries.filter(entry => entry.id !== id));
    } catch (error) {
      console.error('Failed to delete entry:', error);
      throw error;
    }
  };

  return (
    <EntriesContext.Provider value={{ entries, addEntry, updateEntry, deleteEntry }}>
      {children}
    </EntriesContext.Provider>
  );
};