import fs from 'fs/promises';
import path from 'path';

const entriesFile = path.join(process.cwd(), 'data', 'entries.json');

export async function getEntries() {
  try {
    const data = await fs.readFile(entriesFile, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading entries file:', error);
    return [];
  }
}

export async function addEntry(entry) {
  try {
    const entries = await getEntries();
    const newEntry = {
      id: Date.now().toString(),
      ...entry,
      date: new Date().toISOString(),
    };
    entries.push(newEntry);
    await fs.writeFile(entriesFile, JSON.stringify(entries, null, 2));
    return newEntry;
  } catch (error) {
    console.error('Error adding entry:', error);
    throw error;
  }
}

export async function getEntryById(id) {
  try {
    const entries = await getEntries();
    return entries.find(entry => entry.id === id);
  } catch (error) {
    console.error('Error getting entry by ID:', error);
    throw error;
  }
}
