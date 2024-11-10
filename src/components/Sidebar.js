'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import styles from './sidebar.module.css';

const Sidebar = () => {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    {
      title: 'Dashboard',
      path: '/',
      icon: '🏠'
    },
    {
      title: 'Journal Entries',
      path: '/entries',
      icon: '📖'
    },
    {
      title: 'Write Entry',
      path: '/add-entry',
      icon: '✏️'
    },
    {
      title: 'Mood Tracker',
      path: '/mood-tracker',
      icon: '🎭'
    },
    {
      title: 'Tasks',
      path: '/todolist',
      icon: '📋'
    }
  ];

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''}`}>
      <button 
        className={styles.collapseButton}
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? '→' : '←'}
      </button>

      <div className={styles.sidebarHeader}>
        <div className={styles.logo}>
          {!isCollapsed && <h1>Journal</h1>}
          {isCollapsed && <h1>J</h1>}
        </div>
      </div>

      <nav className={styles.navigation}>
        {menuItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={`${styles.navItem} ${
              pathname === item.path ? styles.active : ''
            }`}
          >
            <span className={styles.navIcon}>{item.icon}</span>
            {!isCollapsed && <span className={styles.navText}>{item.title}</span>}
          </Link>
        ))}
      </nav>

      {user && (
        <div className={styles.userSection}>
          <div className={styles.userInfo}>
            <div className={styles.userAvatar}>
              {user.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            {!isCollapsed && (
              <div className={styles.userDetails}>
                <span className={styles.userName}>
                  {user.email?.split('@')[0]}
                </span>
                <span className={styles.userEmail}>{user.email}</span>
              </div>
            )}
          </div>
          <button onClick={handleLogout} className={styles.logoutButton}>
            {isCollapsed ? '🚪' : 'Logout'}
          </button>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
