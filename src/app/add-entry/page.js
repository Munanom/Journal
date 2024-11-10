'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { db } from '../../firebase/config';
import { addDoc, collection } from 'firebase/firestore';
import dynamic from 'next/dynamic';
import styles from './AddEntry.module.css';

const ReactQuill = dynamic(
  () => import('react-quill'),
  { ssr: false, loading: () => <div className={styles.editorLoading}>Loading editor...</div> }
);

const modules = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    ['blockquote', 'code-block'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'script': 'sub'}, { 'script': 'super' }],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'align': [] }],
    ['link', 'image'],
    ['clean']
  ]
};

export default function AddEntry() {
  const [mounted, setMounted] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState('');
  const [showPrompts, setShowPrompts] = useState(false);
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [location, setLocation] = useState('');
  const [weather, setWeather] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [isLoadingSuggestion, setIsLoadingSuggestion] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState('');
  const router = useRouter();
  const { user } = useAuth();

  const moodOptions = [
    { emoji: '😊', label: 'Happy', color: '#FFD93D' },
    { emoji: '😔', label: 'Sad', color: '#6C91BF' },
    { emoji: '😌', label: 'Calm', color: '#98DDCA' },
    { emoji: '😤', label: 'Angry', color: '#FF6B6B' },
    { emoji: '🤗', label: 'Grateful', color: '#95DAB6' },
    { emoji: '😴', label: 'Tired', color: '#B5EAEA' },
    { emoji: '🤔', label: 'Thoughtful', color: '#E7BCFF' },
    { emoji: '😎', label: 'Confident', color: '#FFB347' }
  ];

  const weatherOptions = [
    '☀️ Sunny',
    '⛅ Partly Cloudy',
    '☁️ Cloudy',
    '🌧️ Rainy',
    '⛈️ Stormy',
    '❄️ Snowy',
    '🌫️ Foggy'
  ];

  const writingPrompts = [
    "What's the most memorable part of your day?",
    "What are you grateful for today?",
    "How are you feeling and why?",
    "What's challenging you right now?",
    "What's something you're looking forward to?",
    "What's something you learned today?",
    "What would you like to improve about today?",
    "What made you smile today?"
  ];

  const suggestedTags = {
    'Emotions': ['happy', 'sad', 'anxious', 'excited', 'peaceful'],
    'Activities': ['work', 'exercise', 'travel', 'hobby', 'family'],
    'Growth': ['learning', 'achievement', 'challenge', 'goal', 'progress'],
    'Wellness': ['health', 'mindfulness', 'self-care', 'meditation', 'reflection']
  };

  useEffect(() => {
    setMounted(true);
    loadDraft();
    getLocation();

    const handleClickOutside = (event) => {
      if (showTagSuggestions && !event.target.closest('.tagsSection')) {
        setShowTagSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showTagSuggestions]);

  useEffect(() => {
    import('react-quill/dist/quill.snow.css');
  }, []);

  useEffect(() => {
    if (title || content || mood || tags.length > 0) {
      const saveToLocalStorage = () => {
        const draft = { title, content, mood, tags, location, weather };
        localStorage.setItem('entryDraft', JSON.stringify(draft));
        setAutoSaveStatus('Draft saved at ' + new Date().toLocaleTimeString());
        setTimeout(() => setAutoSaveStatus(''), 2000);
      };

      const timeoutId = setTimeout(saveToLocalStorage, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [title, content, mood, tags, location, weather]);

  const loadDraft = () => {
    const savedDraft = localStorage.getItem('entryDraft');
    if (savedDraft) {
      const draft = JSON.parse(savedDraft);
      setTitle(draft.title || '');
      setContent(draft.content || '');
      setMood(draft.mood || '');
      setTags(draft.tags || []);
      setLocation(draft.location || '');
      setWeather(draft.weather || '');
    }
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`
            );
            const data = await response.json();
            if (data.display_name) {
              setLocation(data.display_name);
            }
          } catch (error) {
            console.error('Error getting location:', error);
          }
        }
      );
    }
  };

  const handleGetSuggestion = async () => {
    setIsLoadingSuggestion(true);
    try {
      const response = await fetch('/api/getMoodSuggestion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood }),
      });
      const data = await response.json();
      setAiSuggestion(data.suggestion);
    } catch (error) {
      console.error('Error getting suggestion:', error);
    } finally {
      setIsLoadingSuggestion(false);
    }
  };

  const addTag = (tag) => {
    if (!tags.includes(tag)) {
      setTags([...tags, tag]);
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      addTag(tagInput.trim());
      setTagInput('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !content) {
      alert('Please fill in both title and content');
      return;
    }

    setIsSubmitting(true);
    try {
      const entry = {
        title,
        content,
        mood,
        tags,
        location,
        weather,
        userId: user.uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'entries'), entry);
      localStorage.removeItem('entryDraft');
      router.push('/entries');
    } catch (error) {
      console.error('Error adding entry:', error);
      alert('Error saving entry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Write New Entry</h1>
        <p className={styles.subtitle}>Express your thoughts and feelings</p>
      </header>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.titleWrapper}>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Give your entry a title..."
            className={styles.titleInput}
            maxLength="100"
          />
        </div>

        <div className={styles.contentWrapper}>
          <div className={styles.sidebar}>
            <div className={styles.moodSection}>
              <label>How are you feeling?</label>
              <div className={styles.moodGrid}>
                {moodOptions.map((option) => (
                  <button
                    key={option.label}
                    type="button"
                    className={`${styles.moodButton} ${mood === option.label ? styles.selected : ''}`}
                    onClick={() => setMood(option.label)}
                    style={{ '--mood-color': option.color }}
                  >
                    <span className={styles.moodEmoji}>{option.emoji}</span>
                    <span className={styles.moodLabel}>{option.label}</span>
                  </button>
                ))}
              </div>
              {mood && (
                <button
                  type="button"
                  onClick={handleGetSuggestion}
                  className={styles.aiPromptButton}
                  disabled={isLoadingSuggestion}
                >
                  {isLoadingSuggestion ? '✨ Getting suggestion...' : '✨ Get AI Writing Prompt'}
                </button>
              )}
            </div>

            <div className={styles.metadataSection}>
              <div className={styles.weatherSelect}>
                <label>Weather</label>
                <select
                  value={weather}
                  onChange={(e) => setWeather(e.target.value)}
                >
                  <option value="">Select weather...</option>
                  {weatherOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              <div className={styles.locationInput}>
                <label>Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Add location..."
                />
              </div>
            </div>

            <div className={styles.tagsSection}>
              <div className={styles.tagsHeader}>
                <label>Tags</label>
                <button
                  type="button"
                  onClick={() => setShowTagSuggestions(!showTagSuggestions)}
                  className={styles.showSuggestionsButton}
                >
                  {showTagSuggestions ? 'Hide Suggestions' : 'Show Suggestions'} 🏷️
                </button>
              </div>
              
              <div className={styles.tagsContainer}>
                {tags.map((tag) => (
                  <span key={tag} className={styles.tag}>
                    #{tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className={styles.removeTag}
                    >
                      ×
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Add tags..."
                  className={styles.tagInput}
                />
                
                {showTagSuggestions && (
                  <div className={styles.tagSuggestionsModal}>
                    {Object.entries(suggestedTags).map(([category, categoryTags]) => (
                      <div key={category} className={styles.tagCategory}>
                        <span className={styles.categoryLabel}>{category}</span>
                        <div className={styles.tagList}>
                          {categoryTags.map(tag => (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => {
                                addTag(tag);
                                setShowTagSuggestions(false);
                              }}
                              className={styles.tagSuggestion}
                            >
                              {tag}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className={styles.mainContent}>
            {aiSuggestion && (
              <div className={styles.aiSuggestion}>
                <span className={styles.suggestionLabel}>AI Suggestion</span>
                <p>{aiSuggestion}</p>
              </div>
            )}

            <div className={styles.editorWrapper}>
              <div className={styles.editorHeader}>
                <button
                  type="button"
                  onClick={() => setShowPrompts(!showPrompts)}
                  className={styles.promptsToggle}
                >
                  {showPrompts ? 'Hide Prompts' : 'Show Writing Prompts'} 💭
                </button>
              </div>

              {showPrompts && (
                <div className={styles.promptsList}>
                  {writingPrompts.map((prompt, index) => (
                    <div key={index} className={styles.promptItem}>
                      {prompt}
                    </div>
                  ))}
                </div>
              )}

              <ReactQuill
                value={content}
                onChange={setContent}
                modules={modules}
                theme="snow"
                placeholder="Start writing your thoughts..."
                className={styles.editor}
              />

              <div className={styles.editorFooter}>
                <span className={styles.charCount}>
                  {content.replace(/<[^>]*>/g, '').length} characters
                </span>
                {autoSaveStatus && (
                  <span className={styles.autoSaveStatus}>
                    {autoSaveStatus}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className={styles.actionButtons}>
          <button
            type="button"
            onClick={() => router.push('/entries')}
            className={styles.cancelButton}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={styles.submitButton}
          >
            {isSubmitting ? 'Saving...' : 'Save Entry'}
          </button>
        </div>
      </form>
    </div>
  );
}
