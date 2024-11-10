'use client';
import React from 'react';
import { Menu } from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './Sidebar.module.css';
import { useAuth } from '../context/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/config';

const Sidebar = () => {
  const router = useRouter();
  const { user } = useAuth();
  const handleLogout = async () => {
    try {
      await signOut(auth);
    router.push('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  return (
    <div className={styles.sidebar}>
      <Menu mode="inline">
        <Menu.Item key="home">
          <Link href="/">Home</Link>
        </Menu.Item>
        {user ? (
          <>
            <Menu.Item key="add-entries">
              <Link href="/add-entry">Add Entries</Link>
            </Menu.Item>
            <Menu.Item key="view-entries">
              <Link href="/entries">View Entries</Link>
            </Menu.Item>
            <Menu.Item key="mood-tracker">
              <Link href="/mood-tracker">Mood Tracker</Link>
            </Menu.Item>
            <Menu.Item key="todolist">
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
