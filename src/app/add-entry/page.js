'use client';
import { useContext } from 'react';
import { useRouter } from 'next/navigation';
import EntryForm from '../../components/EntryForm';
import { EntriesContext } from '../../context/EntriesContext';
import ProtectedRoute from '../../components/ProtectedRoute';
import styles from '../page.module.css';

const AddEntryPage = () => {
  const router = useRouter();
  const { addEntry } = useContext(EntriesContext);

  const handleAddEntry = async (entry) => {
    const newEntry = {
      ...entry,
      date: new Date().toISOString(),
    };

    try {
    await addEntry(newEntry);
    router.push('/entries');
    } catch (error) {
      console.error('Failed to add entry:', error);
      // You might want to show an error message to the user here
    }
  };

  return (
    <ProtectedRoute>
      <div className={styles.container}>
        <h1 className={styles.title}></h1>
      <EntryForm onSubmit={handleAddEntry} />
    </div>
    </ProtectedRoute>
  );
};

export default AddEntryPage;
