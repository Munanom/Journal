'use client';

import React, { useEffect, useContext } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { EntriesContext } from '../../../context/EntriesContext';
import EntryForm from '../../../components/EntryForm'; 
import dayjs from 'dayjs'; 
import styles from '../../page.module.css';

const EditEntryPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const { entries, fetchEntries, saveEntries } = useContext(EntriesContext);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const entry = entries.find((entry) => entry.id === parseInt(id));

  const handleEditEntry = async (updatedEntry) => {
    const updatedEntries = entries.map((entry) =>
      entry.id === parseInt(id) ? { ...entry, ...updatedEntry, date: updatedEntry.date.toISOString() } : entry
    );
    await saveEntries(updatedEntries);
    router.push('/entries');
  };

  return entry ? (
    <div className={styles.formContainer}>
      <EntryForm
        initialTitle={entry.title}
        initialContent={entry.content}
        initialDate={entry.date ? dayjs(entry.date) : null}
        initialMood={entry.mood}
        onSubmit={handleEditEntry}
      />
    </div>
  ) : (
    <p>Loading...</p>
  );
};

export default EditEntryPage;
