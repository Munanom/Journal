// src/pages/api/login.js
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcrypt';

const usersFilePath = path.resolve(process.cwd(), 'data/users.json');

const getUsers = () => {
  if (!fs.existsSync(usersFilePath)) {
    return [];
  }
  const fileContents = fs.readFileSync(usersFilePath, 'utf8');
  return JSON.parse(fileContents);
};

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { username, password } = req.body;
    const users = getUsers();

    const user = users.find(user => user.username === username);
    if (!user) {
      res.status(400).json({ message: 'Invalid username or password' });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(400).json({ message: 'Invalid username or password' });
      return;
    }

    res.status(200).json({ message: 'Login successful' });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
