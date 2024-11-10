'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';
import Link from 'next/link';
import styles from './Entries.module.css';

export default function EntriesPage() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, week, month
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchEntries();
    }
  }, [user]);

  const fetchEntries = async () => {
    if (!user) return;

    try {
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
      
      setEntries(entriesData);
    } catch (error) {
      console.error('Error fetching entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredEntries = () => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    return entries.filter(entry => {
      const entryDate = new Date(entry.createdAt);
      switch (filter) {
        case 'week':
          return entryDate >= oneWeekAgo;
        case 'month':
          return entryDate >= oneMonthAgo;
        default:
          return true;
      }
    });
  };

  const getMoodEmoji = (mood) => {
    const moodEmojis = {
      'Happy': '😊',
      'Sad': '😔',
      'Calm': '😌',
      'Angry': '😤',
      'Grateful': '🤗',
      'Tired': '😴',
      'Thoughtful': '🤔',
      'Confident': '😎'
    };
    return moodEmojis[mood] || '😐';
  };

  if (!user) {
    return (
      <div className={styles.container}>
        <div className={styles.unauthorized}>
          <h2>Please log in to view your entries</h2>
          <Link href="/login" className={styles.loginButton}>
            Log In
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading your entries...</div>
      </div>
    );
  }

  const filteredEntries = getFilteredEntries();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1>Your Journal Entries</h1>
          <div className={styles.stats}>
            <div className={styles.stat}>
              <span className={styles.statNumber}>{entries.length}</span>
              <span className={styles.statLabel}>Total Entries</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNumber}>
                {entries.filter(entry => 
                  new Date(entry.createdAt) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                ).length}
              </span>
              <span className={styles.statLabel}>This Week</span>
            </div>
          </div>
        </div>
        <Link href="/add-entry" className={styles.addButton}>
          Create New Entry
        </Link>
      </div>

      <div className={styles.filters}>
        <button
          className={`${styles.filterButton} ${filter === 'all' ? styles.active : ''}`}
          onClick={() => setFilter('all')}
        >
          All Time
        </button>
        <button
          className={`${styles.filterButton} ${filter === 'week' ? styles.active : ''}`}
          onClick={() => setFilter('week')}
        >
          This Week
        </button>
        <button
          className={`${styles.filterButton} ${filter === 'month' ? styles.active : ''}`}
          onClick={() => setFilter('month')}
        >
          This Month
        </button>
      </div>

      {filteredEntries.length === 0 ? (
        <div className={styles.noEntries}>
          <h3>No entries found</h3>
          <p>Start writing your journal entries to see them here.</p>
          <Link href="/add-entry" className={styles.startButton}>
            Write Your First Entry
          </Link>
        </div>
      ) : (
        <div className={styles.entriesGrid}>
          {filteredEntries.map((entry) => (
            <div key={entry.id} className={styles.entryCard}>
              <div className={styles.entryHeader}>
                <span className={styles.date}>
                  {new Date(entry.createdAt).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
                {entry.mood && (
                  <span className={styles.moodBadge}>
                    {getMoodEmoji(entry.mood)} {entry.mood}
                  </span>
                )}
              </div>
              <h2 className={styles.entryTitle}>{entry.title}</h2>
              <div className={styles.entryPreview}>
                {entry.content.replace(/<[^>]*>/g, '').substring(0, 150)}
                {entry.content.length > 150 ? '...' : ''}
              </div>
              <div className={styles.entryFooter}>
                <Link href={`/entries/${entry.id}`} className={styles.readMoreLink}>
                  Read Full Entry →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
