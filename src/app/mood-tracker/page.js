'use client';
import React, { useContext, useEffect, useState } from 'react';
import { Select, Typography, Spin, Alert } from 'antd';
import { EntriesContext } from '../../context/EntriesContext';
import { Pie } from 'react-chartjs-2';
import 'chart.js/auto';
import styles from '../page.module.css';

const { Option } = Select;

const MoodTrackerPage = () => {
  const { entries } = useContext(EntriesContext);
  const [timePeriod, setTimePeriod] = useState('week');
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [suggestion, setSuggestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const now = new Date();
    let filtered;

    switch (timePeriod) {
      case 'week':
        filtered = entries.filter(entry => {
          const entryDate = new Date(entry.date);
          const oneWeekAgo = new Date(now.setDate(now.getDate() - 7));
          return entryDate >= oneWeekAgo;
        });
        break;
      case 'month':
        filtered = entries.filter(entry => {
          const entryDate = new Date(entry.date);
          const oneMonthAgo = new Date(now.setMonth(now.getMonth() - 1));
          return entryDate >= oneMonthAgo;
        });
        break;
      case 'year':
        filtered = entries.filter(entry => {
          const entryDate = new Date(entry.date);
          const oneYearAgo = new Date(now.setFullYear(now.getFullYear() - 1));
          return entryDate >= oneYearAgo;
        });
        break;
      default:
        filtered = entries;
    }

    setFilteredEntries(filtered);
  }, [timePeriod, entries]);

  const moodCount = filteredEntries.reduce((acc, entry) => {
    acc[entry.mood] = (acc[entry.mood] || 0) + 1;
    return acc;
  }, {});

  const prominentMood = Object.keys(moodCount).reduce((a, b) => (moodCount[a] > moodCount[b] ? a : b), '');

  useEffect(() => {
    if (prominentMood) {
      setLoading(true);
      fetch('/api/getMoodSuggestion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mood: prominentMood }),
      })
        .then(response => response.json())
        .then(data => {
          if (data.error) {
            throw new Error(data.error);
          }
          setSuggestion(data.suggestion);
          setLoading(false);
        })
        .catch(error => {
          console.error('Error fetching mood suggestion:', error);
          setError('Failed to fetch mood suggestion');
          setLoading(false);
        });
    }
  }, [prominentMood]);
  

  const data = {
    labels: Object.keys(moodCount),
    datasets: [
      {
        data: Object.values(moodCount),
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40'
        ],
      },
    ],
  };

  return (
    <div className={styles.moodTrackerContainer}>
      <Typography.Title>Mood Tracker</Typography.Title>
      <Select value={timePeriod} onChange={setTimePeriod} style={{ width: 200, marginBottom: 20 }}>
        <Option value="week">This Week</Option>
        <Option value="month">This Month</Option>
        <Option value="year">This Year</Option>
      </Select>
      <div className={styles.pieChartContainer}>
        <Pie data={data} />
      </div>
      {loading ? (
        <Spin tip="Fetching suggestion..." />
      ) : error ? (
        <Alert message="Error" description={error} type="error" showIcon />
      ) : (
        suggestion && (
          <div className={styles.suggestionBox}>
            <Typography.Paragraph>
              <strong>🎉Suggestion to improve your mood:</strong> {suggestion}
            </Typography.Paragraph>
          </div>
        )
      )}
    </div>
  );
};

export default MoodTrackerPage;
