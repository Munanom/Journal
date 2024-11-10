import './globals.css';
import styles from './layout.module.css';
import { Providers } from './providers';
import Footer from '../components/Footer';

export const metadata = {
  title: 'Journal App',
  description: 'A personal journaling application',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <div className={styles.wrapper}>
            <div className={styles.container}>
              <main className={styles.main}>
                <div className={styles.pageContainer}>
                  {children}
                </div>
              </main>
            </div>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
