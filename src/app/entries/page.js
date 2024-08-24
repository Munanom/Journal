'use client';
import React, { useContext, useEffect, useState } from 'react';
import { List, Typography, Button, Input } from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { EntriesContext } from '../../context/EntriesContext';
import styles from '../page.module.css';

const EntriesPage = () => {
  const { entries, fetchEntries } = useContext(EntriesContext);
  const [sortedEntries, setSortedEntries] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  useEffect(() => {
    const filteredEntries = entries
      .filter(entry => 
        (entry.title?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) || 
        (entry.content?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
      )
      .sort((a, b) => new Date(b.date) - new Date(a.date));
    setSortedEntries(filteredEntries);
  }, [entries, searchTerm]);

  const handleAddEntryClick = () => {
    router.push('/add-entry');
  };

  return (
    <div className={styles.entriesContainer}>
      <div className={styles.searchContainer}>
        <Input 
          placeholder="Search entries..." 
          value={searchTerm} 
          onChange={e => setSearchTerm(e.target.value)} 
          style={{ marginBottom: '20px' }}
        />
      </div>
      <Typography.Title className="custom-title">
        Your Journal Entries
      </Typography.Title>
      <List
        itemLayout="vertical"
        dataSource={sortedEntries}
        renderItem={(item) => (
          <List.Item>
            <List.Item.Meta
              title={<Link href={`/entries/${item.id}`}>{item.title}</Link>}
              description={
                <>
                  <p><strong>Date:</strong> {new Date(item.date).toLocaleString()}</p>
                  <p><strong>Mood:</strong> {item.mood}</p>
                  <p>{item.content}</p>
                </>
              }
            />
          </List.Item>
        )}
      />
      <Button className={styles.floatButton} onClick={handleAddEntryClick}>
        +
      </Button>
      <style jsx>{`
        .custom-title {
          color: #777ae8;
        }
      `}</style>
    </div>
  );
};

export default EntriesPage;
