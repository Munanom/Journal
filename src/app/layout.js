import './globals.css';
import styles from './layout.module.css';
import Sidebar from '../components/Sidebar';
import { Inter } from 'next/font/google';
import { AuthProvider } from '../context/AuthContext';
import { EntriesProvider } from '../context/EntriesContext';
import ErrorBoundary from '../components/ErrorBoundary';
import { metadata } from './metadata';

const inter = Inter({ subsets: ['latin'] });

export { metadata };

export default function RootLayout({ children }) {
  const isAuthPage = ['login', 'signup'].includes(children.props.childPropSegment);

  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <EntriesProvider>
            <ErrorBoundary>
        <div className={styles.container}>
          {!isAuthPage && <Sidebar />}
          <main className={`${styles.main} ${isAuthPage ? styles.authPage : ''}`}>
                  <div className={styles.pageContainer}>
            {children}
                  </div>
                </main>
              </div>
            </ErrorBoundary>
          </EntriesProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
