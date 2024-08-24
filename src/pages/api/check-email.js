import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  if (req.method === 'GET') {
    const { email } = req.query;
    const filePath = path.join(process.cwd(), 'data', 'users.json');
    const users = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    const userExists = users.some(user => user.email === email);

    res.status(200).json({ exists: userExists });
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
