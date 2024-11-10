import { getFirestore, collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, where } from 'firebase/firestore';
import { app } from './config';

const db = getFirestore(app);

export const getEntries = async (userId) => {
  const entriesRef = collection(db, 'entries');
  const q = query(entriesRef, where("userId", "==", userId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

export const addEntry = async (userId, entry) => {
  const entriesRef = collection(db, 'entries');
  const docRef = await addDoc(entriesRef, { ...entry, userId });
  return { id: docRef.id, ...entry };
};

export const updateEntry = async (userId, id, updatedEntry) => {
  const entryRef = doc(db, 'entries', id);
  await updateDoc(entryRef, updatedEntry);
};

export const deleteEntry = async (userId, id) => {
  const entryRef = doc(db, 'entries', id);
  await deleteDoc(entryRef);
};
