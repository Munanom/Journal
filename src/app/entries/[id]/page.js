'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { db } from '../../../firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import styles from './EntryDetail.module.css';

export default function EntryDetail({ params }) {
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const router = useRouter();
  const { id } = params;

  useEffect(() => {
    const fetchEntry = async () => {
      if (!user || !id) {
        router.push('/entries');
        return;
      }

      try {
        const entryRef = doc(db, 'entries', id);
        const entrySnap = await getDoc(entryRef);

        if (entrySnap.exists()) {
          const entryData = entrySnap.data();
          // Verify that the entry belongs to the current user
          if (entryData.userId === user.uid) {
            setEntry({ id: entrySnap.id, ...entryData });
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

    fetchEntry();
  }, [id, user, router]);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading entry...</div>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>Entry not found</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.entryHeader}>
        <button
          onClick={() => router.push('/entries')}
          className={styles.backButton}
        >
          ← Back to Entries
        </button>
        <div className={styles.metadata}>
          <span className={styles.date}>
            {new Date(entry.createdAt).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
          {entry.mood && (
            <span className={styles.mood}>
              Mood: {entry.mood}
            </span>
          )}
        </div>
      </div>

      <article className={styles.entryContent}>
        <h1 className={styles.title}>{entry.title}</h1>
        
        {entry.location && (
          <div className={styles.location}>
            📍 {entry.location}
          </div>
        )}

        {entry.weather && (
          <div className={styles.weather}>
            {entry.weather}
          </div>
        )}

        <div 
          className={styles.content}
          dangerouslySetInnerHTML={{ __html: entry.content }}
        />

        {entry.tags && entry.tags.length > 0 && (
          <div className={styles.tags}>
            {entry.tags.map((tag, index) => (
              <span key={index} className={styles.tag}>
                #{tag}
              </span>
            ))}
          </div>
        )}
      </article>
    </div>
  );
}
