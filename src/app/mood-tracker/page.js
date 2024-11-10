'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase/config';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import styles from './MoodTracker.module.css';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Dynamic imports for Charts
const DynamicPieChart = dynamic(
  () => import('react-chartjs-2').then((mod) => mod.Pie),
  { ssr: false, loading: () => <div className={styles.chartLoading}>Loading chart...</div> }
);

const DynamicBarChart = dynamic(
  () => import('react-chartjs-2').then((mod) => mod.Bar),
  { ssr: false, loading: () => <div className={styles.chartLoading}>Loading chart...</div> }
);

const DynamicLineChart = dynamic(
  () => import('react-chartjs-2').then((mod) => mod.Line),
  { ssr: false, loading: () => <div className={styles.chartLoading}>Loading chart...</div> }
);

// Dynamic import for Chart.js registration
const ChartSetup = dynamic(
  () => import('chart.js').then((ChartJS) => {
    const { 
      Chart,
      ArcElement,
      CategoryScale,
      LinearScale,
      PointElement,
      LineElement,
      BarElement,
      Title,
      Tooltip,
      Legend,
      Filler 
    } = ChartJS;

    Chart.register(
      ArcElement,
      CategoryScale,
      LinearScale,
      PointElement,
      LineElement,
      BarElement,
      Title,
      Tooltip,
      Legend,
      Filler
    );
    return () => null;
  }),
  { ssr: false }
);

export default function MoodTracker() {
  const [mounted, setMounted] = useState(false);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('week');
  const [chartType, setChartType] = useState('pie');
  const [selectedMood, setSelectedMood] = useState(null);
  const { user } = useAuth();

  const moodTypes = {
    'Happy': { emoji: '😊', color: '#FFD93D', description: 'Joyful and content' },
    'Sad': { emoji: '😔', color: '#6C91BF', description: 'Down or melancholic' },
    'Calm': { emoji: '😌', color: '#98DDCA', description: 'Peaceful and relaxed' },
    'Angry': { emoji: '😤', color: '#FF6B6B', description: 'Frustrated or annoyed' },
    'Grateful': { emoji: '🤗', color: '#95DAB6', description: 'Thankful and appreciative' },
    'Tired': { emoji: '😴', color: '#B5EAEA', description: 'Low energy or exhausted' },
    'Thoughtful': { emoji: '🤔', color: '#E7BCFF', description: 'Reflective or contemplative' },
    'Confident': { emoji: '😎', color: '#FFB347', description: 'Self-assured and capable' }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (user) {
      fetchEntries();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchEntries = async () => {
    try {
      const entriesRef = collection(db, 'entries');
      const q = query(
        entriesRef,
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const entriesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setEntries(entriesData);
    } catch (error) {
      console.error('Error fetching entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredEntries = () => {
    const now = new Date();
    return entries.filter(entry => {
      const entryDate = new Date(entry.createdAt);
      const diffTime = Math.abs(now - entryDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      switch (timeRange) {
        case 'week': return diffDays <= 7;
        case 'month': return diffDays <= 30;
        case 'year': return diffDays <= 365;
        default: return true;
      }
    });
  };

  const getMoodStats = () => {
    const filteredEntries = getFilteredEntries();
    const moodCounts = {};
    let totalEntries = 0;

    filteredEntries.forEach(entry => {
      if (entry.mood) {
        moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
        totalEntries++;
      }
    });

    const dominantMood = Object.entries(moodCounts)
      .sort((a, b) => b[1] - a[1])[0];

    return {
      totalEntries,
      moodCounts,
      dominantMood: dominantMood ? {
        mood: dominantMood[0],
        count: dominantMood[1],
        percentage: ((dominantMood[1] / totalEntries) * 100).toFixed(1)
      } : null,
      recentMood: filteredEntries[0]?.mood
    };
  };

  const getChartData = () => {
    const filteredEntries = getFilteredEntries();
    const moodCounts = {};
    const dateGroups = {};

    filteredEntries.forEach(entry => {
      if (entry.mood) {
        // For pie and bar charts
        moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;

        // For line chart
        const date = new Date(entry.createdAt).toLocaleDateString();
        if (!dateGroups[date]) dateGroups[date] = {};
        dateGroups[date][entry.mood] = (dateGroups[date][entry.mood] || 0) + 1;
      }
    });

    if (chartType === 'line') {
      const dates = Object.keys(dateGroups).sort((a, b) => 
        new Date(a) - new Date(b)
      ).slice(-14); // Last 14 days

      const datasets = Object.keys(moodTypes).map(mood => ({
        label: mood,
        data: dates.map(date => dateGroups[date]?.[mood] || 0),
        borderColor: moodTypes[mood].color,
        backgroundColor: `${moodTypes[mood].color}40`,
        fill: true,
        tension: 0.4
      }));

      return { labels: dates, datasets };
    } else {
      const labels = Object.keys(moodCounts);
      const data = labels.map(label => moodCounts[label]);
      const backgroundColor = labels.map(label => moodTypes[label].color);

      return {
        labels,
        datasets: [{
          data,
          backgroundColor,
          borderColor: backgroundColor.map(color => `${color}80`),
          borderWidth: 1
        }]
      };
    }
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          font: { size: 12 }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const value = context.raw;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${context.label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
    scales: chartType === 'line' ? {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1 }
      }
    } : undefined
  };

  if (!mounted) return null;

  if (!user) {
    return (
      <div className={styles.container}>
        <div className={styles.unauthorized}>
          <h2>Please log in to view your mood tracker</h2>
          <Link href="/login" className={styles.loginButton}>
            Log In
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading your mood data...</div>
      </div>
    );
  }

  const stats = getMoodStats();

  return (
    <div className={styles.container}>
      <ChartSetup />
      
      <header className={styles.header}>
        <h1>Mood Tracker</h1>
        <p className={styles.subtitle}>Track and analyze your emotional well-being</p>
      </header>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h3>Total Entries</h3>
          <div className={styles.statValue}>{stats.totalEntries}</div>
          <p>in selected period</p>
        </div>
        {stats.dominantMood && (
          <div className={styles.statCard}>
            <h3>Most Common Mood</h3>
            <div className={styles.statValue}>
              <span>{moodTypes[stats.dominantMood.mood].emoji}</span>
              <span>{stats.dominantMood.mood}</span>
              <small>{stats.dominantMood.percentage}%</small>
            </div>
          </div>
        )}
        {stats.recentMood && (
          <div className={styles.statCard}>
            <h3>Latest Mood</h3>
            <div className={styles.statValue}>
              <span>{moodTypes[stats.recentMood].emoji}</span>
              <span>{stats.recentMood}</span>
            </div>
          </div>
        )}
      </div>

      <div className={styles.controls}>
        <div className={styles.timeSelector}>
          <button 
            className={`${styles.timeButton} ${timeRange === 'week' ? styles.active : ''}`}
            onClick={() => setTimeRange('week')}
          >
            Past Week
          </button>
          <button 
            className={`${styles.timeButton} ${timeRange === 'month' ? styles.active : ''}`}
            onClick={() => setTimeRange('month')}
          >
            Past Month
          </button>
          <button 
            className={`${styles.timeButton} ${timeRange === 'year' ? styles.active : ''}`}
            onClick={() => setTimeRange('year')}
          >
            Past Year
          </button>
        </div>

        <div className={styles.chartTypeSelector}>
          <button
            className={`${styles.chartTypeButton} ${chartType === 'pie' ? styles.active : ''}`}
            onClick={() => setChartType('pie')}
          >
            Pie Chart
          </button>
          <button
            className={`${styles.chartTypeButton} ${chartType === 'bar' ? styles.active : ''}`}
            onClick={() => setChartType('bar')}
          >
            Bar Chart
          </button>
          <button
            className={`${styles.chartTypeButton} ${chartType === 'line' ? styles.active : ''}`}
            onClick={() => setChartType('line')}
          >
            Line Chart
          </button>
        </div>
      </div>

      <div className={styles.chartSection}>
        {entries.length > 0 ? (
          <div className={styles.chart}>
            {mounted && (
              <>
                {chartType === 'pie' && (
                  <DynamicPieChart data={getChartData()} options={chartOptions} />
                )}
                {chartType === 'bar' && (
                  <DynamicBarChart data={getChartData()} options={chartOptions} />
                )}
                {chartType === 'line' && (
                  <DynamicLineChart data={getChartData()} options={chartOptions} />
                )}
              </>
            )}
          </div>
        ) : (
          <div className={styles.noData}>
            <p>No entries found for the selected period.</p>
            <Link href="/add-entry" className={styles.addEntryButton}>
              Add Your First Entry
            </Link>
          </div>
        )}
      </div>

      <div className={styles.moodGrid}>
        {Object.entries(moodTypes).map(([mood, data]) => (
          <div 
            key={mood}
            className={`${styles.moodCard} ${selectedMood === mood ? styles.selected : ''}`}
            onClick={() => setSelectedMood(mood === selectedMood ? null : mood)}
          >
            <span className={styles.moodEmoji}>{data.emoji}</span>
            <h3>{mood}</h3>
            <p>{data.description}</p>
            <div className={styles.moodCount}>
              {stats.moodCounts[mood] || 0} entries
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
