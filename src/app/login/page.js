'use client';
import { useState } from 'react';
import { signInWithGoogle, signInWithEmail } from '../../firebase/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from '../Auth.module.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const router = useRouter();

  const validateForm = () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }
    return true;
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      await signInWithEmail(email, password);
      router.push('/entries');
    } catch (error) {
      setError(error.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
      router.push('/entries');
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authBox}>
        <h1 className={styles.title}>Log In</h1>
        <form onSubmit={handleEmailLogin} className={styles.form}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.input}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={styles.input}
            required
          />
          <button type="submit" className={styles.button}>
            Log in with Email
          </button>
        </form>
        <div className={styles.divider}>
          <span>or</span>
        </div>
        <button className={styles.googleButton} onClick={handleGoogleLogin}>
          Log in with Google
        </button>
        <p className={styles.toggleText}>
          Don't have an account?
          <Link href="/signup" className={styles.link}> Sign up</Link>
        </p>
        <Link href="/forgot-password" className={styles.forgotPassword}>
          Forgot password?
        </Link>
        {error && <p className={styles.errorText}>{error}</p>}
      </div>
    </div>
  );
}
