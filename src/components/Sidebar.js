'use client';
import React from 'react';
import { Menu } from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import styles from './sidebar.module.css';

const Sidebar = () => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  const handleLogout = () => {
    setIsAuthenticated(false);
    router.push('/login');
  };

  return (
    <div className={styles.sidebar}>
      <Menu mode="inline">
        <Menu.Item key="home">
          <Link href="/">Home</Link>
        </Menu.Item>
        {isAuthenticated ? (
          <>
            <Menu.Item key="entries">
              <Link href="/add-entry">Add Entries</Link>
            </Menu.Item>
            <Menu.Item key="entries">
              <Link href="/entries">View Entries</Link>
            </Menu.Item>
            <Menu.Item key="mood-tracker">
              <Link href="/mood-tracker">Mood Tracker</Link>
            </Menu.Item>

            <Menu.Item key="mood-tracker">
              <Link href="/todolist">TodoList</Link>
            </Menu.Item>

            <Menu.Item key="logout" onClick={handleLogout}>
              Logout
            </Menu.Item>
          </>
        ) : (
          <Menu.Item key="login">
            <Link href="/login">Login</Link>
          </Menu.Item>
        )}
      </Menu>
    </div>
  );
};

export default Sidebar;
