'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinnner';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';

const EntriesPageContent = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchEntries = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const entriesRef = collection(db, 'entries');
        const q = query(entriesRef, where('userId', '==', user.uid));
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

    fetchEntries();
  }, [user]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="entries-container">
      <h1>Your Journal Entries</h1>
      {entries && entries.length === 0 ? (
        <p>No entries yet. Start writing your first entry!</p>
      ) : (
        <ul className="entries-list">
          {entries && entries.map((entry) => (
            <li key={entry.id} className="entry-item">
              <h3>{entry.title}</h3>
              <p>{entry.content.substring(0, 100)}...</p>
              <p>Date: {new Date(entry.date).toLocaleDateString()}</p>
              <a href={`/entries/${entry.id}`}>Read more</a>
            </li>
          ))}
        </ul>
      )}

      <style jsx>{`
        .entries-container {
          padding: 20px;
          max-width: 800px;
          margin: 0 auto;
        }
        
        .entries-list {
          list-style: none;
          padding: 0;
        }
        
        .entry-item {
          border: 1px solid #ddd;
          margin-bottom: 20px;
          padding: 15px;
          border-radius: 8px;
        }
        
        .entry-item h3 {
          margin-top: 0;
        }
        
        .entry-item a {
          color: #0070f3;
          text-decoration: none;
        }
        
        .entry-item a:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
};

export default EntriesPageContent;
