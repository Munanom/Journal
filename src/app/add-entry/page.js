'use client';
import React, { useContext } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { EntriesContext } from '../../context/EntriesContext';
import styles from '../page.module.css';

const EntryForm = dynamic(() => import('../../components/EntryForm'), { ssr: false });

const AddEntryPage = () => {
  const router = useRouter();
  const { addEntry } = useContext(EntriesContext);

  const handleAddEntry = async (entry) => {
    const newEntry = {
      id: Date.now(),
      ...entry,
      date: entry.date ? entry.date.toISOString() : new Date().toISOString(),
    };
    await addEntry(newEntry);
    router.push('/entries');
  };

  return (
    <div className={styles.formContainer}>
      <EntryForm onSubmit={handleAddEntry} />
    </div>
  );
};

export default AddEntryPage;
