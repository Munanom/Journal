'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Form, Input, Button, Space, notification, Typography } from 'antd';
import { EyeTwoTone, EyeInvisibleOutlined } from '@ant-design/icons';
import Image from 'next/image';
import styles from '../page.module.css';

const SignupPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const router = useRouter();

  const handleSignup = async () => {
    if (password !== confirmPassword) {
      notification.error({
        message: 'Error',
        description: 'Passwords do not match!',
      });
      return;
    }

    try {
      const existingUserResponse = await fetch(`/api/check-email?email=${email}`);
      const existingUserData = await existingUserResponse.json();

      if (existingUserData.exists) {
        notification.error({
          message: 'Error',
          description: 'Email already exists. Please choose a new email.',
        });
        return;
      }

      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();
      if (response.ok) {
        notification.success({
          message: 'Success',
          description: 'Signup successful! Redirecting to login page...',
        });
        router.push('/login'); // Redirect to the login page
      } else {
        notification.error({
          message: 'Error',
          description: data.message,
        });
      }
    } catch (error) {
      notification.error({
        message: 'Error',
        description: 'An unexpected error occurred. Please try again.',
      });
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>
        <h1 className={styles.title}>Signup</h1>
        <Form onFinish={handleSignup}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Form.Item label={<Typography.Text style={{ color: 'white' }}>Username</Typography.Text>} required>
              <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder='username' />
            </Form.Item>
            <Form.Item label={<Typography.Text style={{ color: 'white' }}>Email</Typography.Text>} required>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder='email' />
            </Form.Item>
            <Form.Item label={<Typography.Text style={{ color: 'white' }}>Password</Typography.Text>} required>
              <Input.Password
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Input password"
              />
            </Form.Item>
            <Form.Item label={<Typography.Text style={{ color: 'white' }}>Confirm Password</Typography.Text>} required>
              <Input.Password
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
              />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Sign Up
              </Button>
            </Form.Item>
          </Space>
        </Form>
      </div>
      <div className={styles.imageContainer}>
        <Image
          className={styles.logo}
          src="/journalpng.svg"
          alt="Journal Logo"
          width={600}
          height={270}
          priority
        />
      </div>
    </div>
  );
};

export default SignupPage;
