// src/pages/api/signup.js
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

const saveUsers = (users) => {
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
};

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { username, email, password } = req.body;
    const users = getUsers();

    if (users.some(user => user.email === email)) {
      res.status(400).json({ message: 'Email already exists' });
      return;
    }

    if (users.some(user => user.username === username)) {
      res.status(400).json({ message: 'Username already exists' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { id: Date.now(), username, email, password: hashedPassword };
    users.push(newUser);
    saveUsers(users);

    res.status(201).json({ message: 'User registered successfully' });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
