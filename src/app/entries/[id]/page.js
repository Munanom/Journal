'use client';

import { useAuthContext } from '@/context/AuthContext';
import { db } from '@/firebase/config';
import styles from './EntryDetail.module.css';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function EntryDetail({ params }) {
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthContext();
  const router = useRouter();
  const { id } = params;

  useEffect(() => {
    const fetchEntry = async () => {
      try {
        const docRef = doc(db, 'entries', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const entryData = docSnap.data();
          // Verify that the entry belongs to the current user
          if (entryData.userId === user?.uid) {
            setEntry({ id: docSnap.id, ...entryData });
          } else {
            router.push('/entries');
          }
        } else {
          router.push('/entries');
        }
      } catch (error) {
        console.error('Error fetching entry:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchEntry();
    }
  }, [id, user, router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!entry) {
    return <div>Entry not found</div>;
  }

  return (
    <div className={styles.entryDetail}>
      <h1>{entry.title}</h1>
      <div className={styles.metadata}>
        <span>Date: {new Date(entry.date).toLocaleDateString()}</span>
        <span>Mood: {entry.mood}</span>
      </div>
      <div className={styles.content} 
           dangerouslySetInnerHTML={{ __html: entry.content }} 
      />
    </div>
  );
}
