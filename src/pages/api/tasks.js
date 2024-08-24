import fs from 'fs';
import path from 'path';

const filePath = path.resolve('./data/tasks.json');

export default function handler(req, res) {
  if (req.method === 'GET') {
    // Read tasks from JSON file
    const tasks = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    res.status(200).json(tasks);
  } else if (req.method === 'POST') {
    // Save tasks to JSON file
    const tasks = req.body;
    fs.writeFileSync(filePath, JSON.stringify(tasks, null, 2));
    res.status(200).json({ message: 'Tasks saved successfully' });
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
