import { getEntryById } from '../../../utils/entryOperations';

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const entry = await getEntryById(id);
      if (entry) {
        res.status(200).json(entry);
      } else {
        res.status(404).json({ message: 'Entry not found' });
      }
    } catch (error) {
      console.error('Error fetching entry:', error);
      res.status(500).json({ message: 'Error fetching entry' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
