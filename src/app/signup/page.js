'use client';

import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './Signup.module.css';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      await signUp(email, password);
      router.push('/');
    } catch (error) {
      setError(
        error.code === 'auth/email-already-in-use'
          ? 'An account with this email already exists'
          : error.code === 'auth/invalid-email'
          ? 'Invalid email address'
          : 'Failed to create account. Please try again.'
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
            <h1>Create Account</h1>
            <p>Start your journaling journey today</p>
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

            <div className={styles.formGroup}>
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>

          <div className={styles.divider}>
            <span>or</span>
          </div>

          <div className={styles.alternativeActions}>
            <button className={styles.googleButton}>
              Sign up with Google
            </button>
            
            <Link href="/login" className={styles.loginLink}>
              Already have an account? Log in
            </Link>
          </div>
        </div>

        <div className={styles.features}>
          <h2>What You'll Get</h2>
          <div className={styles.featuresList}>
            <div className={styles.featureItem}>
              <span className={styles.featureIcon}>✨</span>
              <h3>Personal Space</h3>
              <p>Your private digital journal for thoughts and reflections</p>
            </div>
            <div className={styles.featureItem}>
              <span className={styles.featureIcon}>🎭</span>
              <h3>Mood Tracking</h3>
              <p>Track and analyze your emotional well-being over time</p>
            </div>
            <div className={styles.featureItem}>
              <span className={styles.featureIcon}>📱</span>
              <h3>Access Anywhere</h3>
              <p>Write and reflect from any device, anytime</p>
            </div>
            <div className={styles.featureItem}>
              <span className={styles.featureIcon}>🔒</span>
              <h3>Secure & Private</h3>
              <p>Your thoughts are protected with enterprise-grade security</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
