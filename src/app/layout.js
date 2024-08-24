'use client'; // Ensure this is at the top

import './globals.css'; // Import your global CSS
import Sidebar from '../components/Sidebar';
import { EntriesProvider } from '../context/EntriesContext';
import styles from './layout.module.css';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <title>MyJournal</title>
        <meta name="description" content="Journal App" />
        <link rel="icon" href="public/favicon_io/favicon1.ico" />
      </head>
      <body>
        <EntriesProvider>
          <div className={styles.layout}>
            <Sidebar />
            <div className={styles.content}>
              {children}
            </div>
          </div>
        </EntriesProvider>
      </body>
    </html>
  );
}
