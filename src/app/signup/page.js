'use client';
import { useState } from 'react';
import { signUpWithEmail, signInWithGoogle } from '../../firebase/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from '../Auth.module.css';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleEmailSignup = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    try {
      await signUpWithEmail(email, password);
      router.push('/entries');
    } catch (error) {
      setError(error.message);
    }
  };

  const handleGoogleSignup = async () => {
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
        <h1 className={styles.title}>Sign Up</h1>
        <form onSubmit={handleEmailSignup} className={styles.form}>
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
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={styles.input}
            required
          />
          <button type="submit" className={styles.button}>
            Sign up with Email
          </button>
        </form>
        <div className={styles.divider}>
          <span>or</span>
        </div>
        <button className={styles.googleButton} onClick={handleGoogleSignup}>
          Sign up with Google
        </button>
        <p className={styles.toggleText}>
          Already have an account?
          <Link href="/login" className={styles.link}> Log in</Link>
        </p>
        {error && <p className={styles.errorText}>{error}</p>}
      </div>
    </div>
  );
}
