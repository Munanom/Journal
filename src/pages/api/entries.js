import fs from 'fs';
import path from 'path';

const entriesFilePath = path.resolve(process.cwd(), 'data/entries.json');

const getEntries = () => {
  if (!fs.existsSync(entriesFilePath)) {
    return [];
  }
  const fileContents = fs.readFileSync(entriesFilePath, 'utf8');
  return JSON.parse(fileContents);
};

const saveEntries = (entries) => {
  fs.writeFileSync(entriesFilePath, JSON.stringify(entries, null, 2));
};

export default function handler(req, res) {
  if (req.method === 'GET') {
    const entries = getEntries();
    res.status(200).json(entries);
  } else if (req.method === 'POST') {
    const entries = getEntries();
    const newEntry = req.body;
    entries.push(newEntry);
    saveEntries(entries);
    res.status(201).json(newEntry);
  } else if (req.method === 'PUT') {
    const updatedEntries = req.body;
    saveEntries(updatedEntries);
    res.status(200).json({ message: 'Entries updated successfully' });
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
