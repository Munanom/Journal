'use client';

import { useAuth } from '../context/AuthContext';
import Link from 'next/link';
import Image from 'next/image';
import styles from './page.module.css';

export default function Home() {
  const { user } = useAuth();

  const features = [
    {
      title: 'Journal Entries',
      description: 'Write and reflect on your daily experiences with our intuitive journal editor.',
      icon: '📝',
      link: '/add-entry'
    },
    {
      title: 'Mood Tracking',
      description: 'Monitor your emotional well-being and identify patterns in your mood over time.',
      icon: '🎭',
      link: '/mood-tracker'
    },
    {
      title: 'Task Management',
      description: 'Stay organized with our built-in task manager and daily planner.',
      icon: '✓',
      link: '/todolist'
    },
    {
      title: 'Smart Insights',
      description: 'Get AI-powered suggestions and reflective prompts based on your entries.',
      icon: '💡',
      link: '/entries'
    }
  ];

  return (
    <div className={styles.container}>
      {/* Hero Section with Image Background */}
      <section className={styles.hero}>
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <h1>Your Digital Space for Reflection and Growth</h1>
          <p>
            Combine journaling, mood tracking, and task management in one beautiful space.
            Start your journey of self-discovery today.
          </p>
          {!user ? (
            <div className={styles.heroButtons}>
              <Link href="/signup" className={styles.primaryButton}>
                Get Started
              </Link>
              <Link href="/login" className={styles.secondaryButton}>
                Login
              </Link>
            </div>
          ) : (
            <div className={styles.heroButtons}>
              <Link href="/add-entry" className={styles.primaryButton}>
                Write New Entry
              </Link>
              <Link href="/entries" className={styles.secondaryButton}>
                View Journal
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.features}>
        <h2>Everything You Need for Mindful Journaling</h2>
        <div className={styles.featureGrid}>
          {features.map((feature, index) => (
            <Link href={feature.link} key={index} className={styles.featureCard}>
              <span className={styles.featureIcon}>{feature.icon}</span>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Benefits Section with Image */}
      <section className={styles.benefits}>
        <div className={styles.benefitsImageContainer}>
          <Image 
            src="/journalpng.svg" 
            alt="Journaling illustration" 
            width={400} 
            height={400}
            className={styles.benefitsImage}
          />
        </div>
        <div className={styles.benefitsContent}>
          <h2>Transform Your Daily Reflections</h2>
          <ul className={styles.benefitsList}>
            <li>
              <span className={styles.checkmark}>✓</span>
              Develop a consistent journaling habit
            </li>
            <li>
              <span className={styles.checkmark}>✓</span>
              Track your emotional well-being
            </li>
            <li>
              <span className={styles.checkmark}>✓</span>
              Get AI-powered writing prompts
            </li>
            <li>
              <span className={styles.checkmark}>✓</span>
              Organize your thoughts and tasks
            </li>
          </ul>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.cta}>
        <h2>Start Your Journey Today</h2>
        <p>Join thousands of users who have transformed their journaling practice.</p>
        {!user ? (
          <Link href="/signup" className={styles.ctaButton}>
            Create Your Account
          </Link>
        ) : (
          <Link href="/add-entry" className={styles.ctaButton}>
            Write Your First Entry
          </Link>
        )}
      </section>
    </div>
  );
}
