import { createContext, useState } from 'react';
import { notification } from 'antd';

export const EntriesContext = createContext();

export const EntriesProvider = ({ children }) => {
  const [entries, setEntries] = useState([]);

  const fetchEntries = async () => {
    try {
      const response = await fetch('/api/entries');
      const data = await response.json();
      setEntries(data);
    } catch (error) {
      notification.error({ message: 'Error', description: 'Failed to fetch entries' });
    }
  };

  const saveEntries = async (updatedEntries) => {
    try {
      const response = await fetch('/api/entries', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedEntries),
      });
      if (response.ok) {
        setEntries(updatedEntries);
        notification.success({ message: 'Success', description: 'Entries updated successfully' });
      } else {
        notification.error({ message: 'Error', description: 'Failed to update entries' });
      }
    } catch (error) {
      notification.error({ message: 'Error', description: 'Failed to update entries' });
    }
  };

  const addEntry = async (entry) => {
    try {
      const response = await fetch('/api/entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entry),
      });
      if (response.ok) {
        fetchEntries();
        notification.success({ message: 'Success', description: 'Entry added successfully' });
      } else {
        notification.error({ message: 'Error', description: 'Failed to add entry' });
      }
    } catch (error) {
      notification.error({ message: 'Error', description: 'Failed to add entry' });
    }
  };

  return (
    <EntriesContext.Provider value={{ entries, fetchEntries, saveEntries, addEntry }}>
      {children}
    </EntriesContext.Provider>
  );
};
