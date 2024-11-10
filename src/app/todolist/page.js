'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase/config';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  updateDoc,
  deleteDoc,
  doc,
  orderBy 
} from 'firebase/firestore';
import styles from './TodoList.module.css';

export default function TodoList() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [filter, setFilter] = useState('all');
  const [priority, setPriority] = useState('medium');
  const [category, setCategory] = useState('personal');
  const [dueDate, setDueDate] = useState('');
  const [view, setView] = useState('grid'); // grid or list
  const [sortBy, setSortBy] = useState('dueDate'); // dueDate, priority, category
  const { user } = useAuth();

  const categories = [
    { value: 'personal', label: 'Personal', icon: '👤' },
    { value: 'work', label: 'Work', icon: '💼' },
    { value: 'shopping', label: 'Shopping', icon: '🛒' },
    { value: 'health', label: 'Health', icon: '💪' },
    { value: 'education', label: 'Education', icon: '📚' },
    { value: 'home', label: 'Home', icon: '🏠' }
  ];

  const priorities = [
    { value: 'high', label: 'High', color: '#ff4757' },
    { value: 'medium', label: 'Medium', color: '#ffa502' },
    { value: 'low', label: 'Low', color: '#2ed573' }
  ];

  useEffect(() => {
    if (user) fetchTasks();
  }, [user]);

  const fetchTasks = async () => {
    if (!user) return;

    try {
      const tasksRef = collection(db, 'tasks');
      const q = query(
        tasksRef,
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const tasksData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setTasks(tasksData);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTask = async (e) => {
    e.preventDefault();
    if (!title.trim() || !user) return;

    try {
      const task = {
        title,
        description,
        completed: false,
        priority,
        category,
        dueDate: dueDate || null,
        userId: user.uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, 'tasks'), task);
      setTasks(prev => [{
        id: docRef.id,
        ...task
      }, ...prev]);
      
      // Reset form
      setTitle('');
      setDescription('');
      setPriority('medium');
      setCategory('personal');
      setDueDate('');
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const toggleTask = async (taskId) => {
    try {
      const taskRef = doc(db, 'tasks', taskId);
      const updatedTasks = tasks.map(task => {
        if (task.id === taskId) {
          return { ...task, completed: !task.completed };
        }
        return task;
      });

      const taskToUpdate = updatedTasks.find(t => t.id === taskId);
      await updateDoc(taskRef, {
        completed: taskToUpdate.completed,
        updatedAt: new Date().toISOString()
      });

      setTasks(updatedTasks);
    } catch (error) {
      console.error('Error toggling task:', error);
    }
  };

  const deleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    try {
      await deleteDoc(doc(db, 'tasks', taskId));
      setTasks(prev => prev.filter(task => task.id !== taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const getSortedAndFilteredTasks = () => {
    let filteredTasks = [...tasks];

    // Apply filters
    if (filter !== 'all') {
      filteredTasks = filteredTasks.filter(task => {
        if (filter === 'completed') return task.completed;
        if (filter === 'active') return !task.completed;
        if (filter === 'overdue') {
          return !task.completed && task.dueDate && new Date(task.dueDate) < new Date();
        }
        return task.category === filter;
      });
    }

    // Apply sorting
    return filteredTasks.sort((a, b) => {
      switch (sortBy) {
        case 'dueDate':
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate) - new Date(b.dueDate);
        case 'priority':
          const priorityOrder = { high: 0, medium: 1, low: 2 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        case 'category':
          return a.category.localeCompare(b.category);
        default:
          return 0;
      }
    });
  };

  const getTaskStatusColor = (task) => {
    if (task.completed) return '#2ed573';
    if (task.dueDate && new Date(task.dueDate) < new Date()) return '#ff4757';
    return priorities.find(p => p.value === task.priority)?.color;
  };

  const sortedAndFilteredTasks = getSortedAndFilteredTasks();
  const taskStats = {
    total: tasks.length,
    completed: tasks.filter(t => t.completed).length,
    overdue: tasks.filter(t => !t.completed && t.dueDate && new Date(t.dueDate) < new Date()).length
  };

  if (!user) {
    return (
      <div className={styles.container}>
        <div className={styles.unauthorized}>
          <h2>Please log in to manage your tasks</h2>
          <button onClick={() => router.push('/login')} className={styles.loginButton}>
            Log In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Task Manager</h1>
        <div className={styles.stats}>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{taskStats.total}</span>
            <span className={styles.statLabel}>Total Tasks</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{taskStats.completed}</span>
            <span className={styles.statLabel}>Completed</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{taskStats.overdue}</span>
            <span className={styles.statLabel}>Overdue</span>
          </div>
        </div>
      </div>

      <form onSubmit={addTask} className={styles.addTaskForm}>
        <div className={styles.formRow}>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task title..."
            className={styles.titleInput}
            required
          />
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
            className={styles.descriptionInput}
          />
        </div>

        <div className={styles.formRow}>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={styles.categorySelect}
          >
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>
                {cat.icon} {cat.label}
              </option>
            ))}
          </select>

          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className={styles.prioritySelect}
          >
            {priorities.map(pri => (
              <option key={pri.value} value={pri.value}>
                {pri.label} Priority
              </option>
            ))}
          </select>

          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className={styles.dateInput}
            min={new Date().toISOString().split('T')[0]}
          />

          <button type="submit" className={styles.addButton}>
            Add Task
          </button>
        </div>
      </form>

      <div className={styles.controls}>
        <div className={styles.filterSection}>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All Tasks</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="overdue">Overdue</option>
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>
                {cat.label} Tasks
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className={styles.sortSelect}
          >
            <option value="dueDate">Sort by Due Date</option>
            <option value="priority">Sort by Priority</option>
            <option value="category">Sort by Category</option>
          </select>

          <div className={styles.viewToggle}>
            <button
              onClick={() => setView('grid')}
              className={`${styles.viewButton} ${view === 'grid' ? styles.active : ''}`}
            >
              Grid
            </button>
            <button
              onClick={() => setView('list')}
              className={`${styles.viewButton} ${view === 'list' ? styles.active : ''}`}
            >
              List
            </button>
          </div>
        </div>
      </div>

      <div className={`${styles.taskList} ${styles[view]}`}>
        {sortedAndFilteredTasks.map((task) => (
          <div 
            key={task.id} 
            className={`${styles.taskCard} ${task.completed ? styles.completed : ''}`}
            style={{ borderColor: getTaskStatusColor(task) }}
          >
            <div className={styles.taskHeader}>
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => toggleTask(task.id)}
                className={styles.checkbox}
              />
              <span className={styles.taskCategory}>
                {categories.find(cat => cat.value === task.category)?.icon}
              </span>
            </div>

            <div className={styles.taskContent}>
              <h3>{task.title}</h3>
              {task.description && (
                <p className={styles.taskDescription}>{task.description}</p>
              )}
            </div>

            <div className={styles.taskMeta}>
              {task.dueDate && (
                <span className={`${styles.dueDate} ${
                  new Date(task.dueDate) < new Date() ? styles.overdue : ''
                }`}>
                  Due: {new Date(task.dueDate).toLocaleDateString()}
                </span>
              )}
              <span className={`${styles.priority} ${styles[task.priority]}`}>
                {task.priority}
              </span>
            </div>

            <button
              onClick={() => deleteTask(task.id)}
              className={styles.deleteButton}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
