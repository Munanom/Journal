'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { collection, query, where, getDocs, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import Link from 'next/link';
import styles from './Entries.module.css';

export default function EntriesPage() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMood, setSelectedMood] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const { user } = useAuth();

  const moodTypes = {
    'Happy': { emoji: '😊', color: '#FFD93D' },
    'Sad': { emoji: '😔', color: '#6C91BF' },
    'Calm': { emoji: '😌', color: '#98DDCA' },
    'Angry': { emoji: '😤', color: '#FF6B6B' },
    'Grateful': { emoji: '🤗', color: '#95DAB6' },
    'Tired': { emoji: '😴', color: '#B5EAEA' },
    'Thoughtful': { emoji: '🤔', color: '#E7BCFF' },
    'Confident': { emoji: '😎', color: '#FFB347' }
  };

  useEffect(() => {
    if (user) {
      fetchEntries();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchEntries = async () => {
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

  const handleDeleteEntry = async (entryId) => {
    if (!window.confirm('Are you sure you want to delete this entry?')) return;

    try {
      await deleteDoc(doc(db, 'entries', entryId));
      setEntries(prev => prev.filter(entry => entry.id !== entryId));
    } catch (error) {
      console.error('Error deleting entry:', error);
    }
  };

  const getFilteredEntries = () => {
    return entries
      .filter(entry => {
        // Filter by mood if selected
        if (selectedMood && entry.mood !== selectedMood) return false;

        // Filter by search term
        if (searchTerm) {
          const searchLower = searchTerm.toLowerCase();
          return (
            entry.title.toLowerCase().includes(searchLower) ||
            entry.content.toLowerCase().includes(searchLower)
          );
        }

        // Filter by time period
        if (filter !== 'all') {
          const now = new Date();
          const entryDate = new Date(entry.createdAt);
          const diffDays = Math.ceil((now - entryDate) / (1000 * 60 * 60 * 24));

          switch (filter) {
            case 'today':
              return diffDays <= 1;
            case 'week':
              return diffDays <= 7;
            case 'month':
              return diffDays <= 30;
            default:
              return true;
          }
        }

        return true;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'oldest':
            return new Date(a.createdAt) - new Date(b.createdAt);
          case 'title':
            return a.title.localeCompare(b.title);
          default: // newest
            return new Date(b.createdAt) - new Date(a.createdAt);
        }
      });
  };

  const getStats = () => {
    const total = entries.length;
    const thisWeek = entries.filter(entry => {
      const diffTime = Math.abs(new Date() - new Date(entry.createdAt));
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) <= 7;
    }).length;
    const moodCounts = entries.reduce((acc, entry) => {
      acc[entry.mood] = (acc[entry.mood] || 0) + 1;
      return acc;
    }, {});

    return { total, thisWeek, moodCounts };
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
  const stats = getStats();

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1>Journal Entries</h1>
          <div className={styles.statsBar}>
            <div className={styles.stat}>
              <span className={styles.statNumber}>{stats.total}</span>
              <span className={styles.statLabel}>Total Entries</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNumber}>{stats.thisWeek}</span>
              <span className={styles.statLabel}>This Week</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNumber}>
                {Object.keys(stats.moodCounts).length}
              </span>
              <span className={styles.statLabel}>Different Moods</span>
            </div>
          </div>
        </div>
        <Link href="/add-entry" className={styles.addButton}>
          New Entry
        </Link>
      </header>

      <div className={styles.controls}>
        <div className={styles.searchBar}>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search entries..."
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filters}>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>

          <select
            value={selectedMood}
            onChange={(e) => setSelectedMood(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="">All Moods</option>
            {Object.keys(moodTypes).map(mood => (
              <option key={mood} value={mood}>
                {moodTypes[mood].emoji} {mood}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="title">By Title</option>
          </select>

          <div className={styles.viewToggle}>
            <button
              onClick={() => setViewMode('grid')}
              className={`${styles.viewButton} ${viewMode === 'grid' ? styles.active : ''}`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`${styles.viewButton} ${viewMode === 'list' ? styles.active : ''}`}
            >
              List
            </button>
          </div>
        </div>
      </div>

      {filteredEntries.length === 0 ? (
        <div className={styles.noEntries}>
          <h3>No entries found</h3>
          {searchTerm || selectedMood ? (
            <p>Try adjusting your filters or search terms</p>
          ) : (
            <>
              <p>Start writing your journal entries to see them here.</p>
              <Link href="/add-entry" className={styles.startButton}>
                Write Your First Entry
              </Link>
            </>
          )}
        </div>
      ) : (
        <div className={`${styles.entriesGrid} ${styles[viewMode]}`}>
          {filteredEntries.map((entry) => (
            <div 
              key={entry.id} 
              className={styles.entryCard}
              style={{
                '--mood-color': moodTypes[entry.mood]?.color || '#ddd'
              }}
            >
              <div className={styles.entryHeader}>
                <span className={styles.date}>
                  {new Date(entry.createdAt).toLocaleDateString('en-US', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
                {entry.mood && (
                  <span className={styles.moodBadge}>
                    {moodTypes[entry.mood].emoji} {entry.mood}
                  </span>
                )}
              </div>

              <h2 className={styles.entryTitle}>{entry.title}</h2>

              <div className={styles.entryPreview}>
                {entry.content.replace(/<[^>]*>/g, '').substring(0, 200)}
                {entry.content.length > 200 ? '...' : ''}
              </div>

              <div className={styles.entryFooter}>
                <Link 
                  href={`/entries/${entry.id}`} 
                  className={styles.readMoreLink}
                >
                  Read More
                </Link>
                <button
                  onClick={() => handleDeleteEntry(entry.id)}
                  className={styles.deleteButton}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
