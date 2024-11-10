'use client';

import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './Login.module.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
      router.push('/');
    } catch (error) {
      setError(
        error.code === 'auth/wrong-password'
          ? 'Incorrect password'
          : error.code === 'auth/user-not-found'
          ? 'No account found with this email'
          : 'Failed to log in. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.cardWrapper}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h1>Welcome Back</h1>
            <p>Continue your journaling journey</p>
          </div>

          {error && (
            <div className={styles.errorBox}>
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={styles.input}
                placeholder="your@email.com"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={styles.input}
                placeholder="••••••••"
              />
            </div>

            <button 
              type="submit" 
              className={styles.submitButton}
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Log In'}
            </button>
          </form>

          <div className={styles.divider}>
            <span>or</span>
          </div>

          <div className={styles.alternativeActions}>
            <button className={styles.googleButton}>
              Continue with Google
            </button>
            
            <Link href="/signup" className={styles.signupLink}>
              Don't have an account? Sign up
            </Link>
          </div>
        </div>

        <div className={styles.features}>
          <h2>Why Join Us?</h2>
          <div className={styles.featuresList}>
            <div className={styles.featureItem}>
              <span className={styles.featureIcon}>📝</span>
              <h3>Daily Journaling</h3>
              <p>Capture your thoughts and memories in a beautiful digital space</p>
            </div>
            <div className={styles.featureItem}>
              <span className={styles.featureIcon}>🎯</span>
              <h3>Track Goals</h3>
              <p>Set and monitor your personal goals and achievements</p>
            </div>
            <div className={styles.featureItem}>
              <span className={styles.featureIcon}>📊</span>
              <h3>Mood Analysis</h3>
              <p>Understand your emotional patterns with detailed insights</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
