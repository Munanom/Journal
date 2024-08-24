'use client';
import React, { useState, useContext } from 'react';
import { Form, Button, DatePicker, Select, Upload, Input, Typography } from 'antd';
import { PaperClipOutlined, PictureOutlined } from '@ant-design/icons';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { EntriesContext } from '../../context/EntriesContext';
import styles from '../page.module.css';

const { Option } = Select;
const { Text } = Typography;
const QuillNoSSRWrapper = dynamic(import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';

const AddEntryPage = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [date, setDate] = useState(null);
  const [mood, setMood] = useState('');
  const router = useRouter();
  const { addEntry } = useContext(EntriesContext);

  const handleAddEntry = async () => {
    const newEntry = {
      id: Date.now(),
      title,
      content,
      date: date ? date.toISOString() : new Date().toISOString(),
      mood,
    };
    await addEntry(newEntry);
    router.push('/entries');
  };

  const handleFileUpload = (file) => {
    console.log('File uploaded:', file);
    return false;
  };

  const handleImageUpload = (file) => {
    console.log('Image uploaded:', file);
    return false;
  };

  return (
    <div className={styles.formContainer}>
      <Form onFinish={handleAddEntry} className={styles.form}>
        <Form.Item
          label={<Text className={styles.formLabel}>Title</Text>}
          labelCol={{ span: 24 }}
          wrapperCol={{ span: 24 }}
        >
          <Input value={title} onChange={(e) => setTitle(e.target.value)} />
        </Form.Item>
        <Form.Item
          label={<Text className={styles.formLabel}>Content</Text>}
          labelCol={{ span: 24 }}
          wrapperCol={{ span: 24 }}
        >
          <QuillNoSSRWrapper
            value={content}
            onChange={setContent}
            placeholder="Start writing..."
            modules={{
              toolbar: [
                [{ 'header': '1' }, { 'header': '2' }, { 'font': [] }],
                [{ size: [] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                ['link', 'image', 'video'],
                ['clean'],
              ],
            }}
            formats={[
              'header', 'font', 'size',
              'bold', 'italic', 'underline', 'strike',
              'list', 'bullet',
              'link', 'image', 'video',
            ]}
            theme="snow"
            className={styles.quillEditor} // Add a class name for custom styling
          />
          <div className={styles.uploadContainer}>
            <Upload beforeUpload={handleFileUpload} showUploadList={false}>
              <Button icon={<PaperClipOutlined />} />
            </Upload>
            <Upload beforeUpload={handleImageUpload} showUploadList={false}>
              <Button icon={<PictureOutlined />} />
            </Upload>
          </div>
        </Form.Item>
        <Form.Item
          label={<Text className={styles.formLabel}>Date</Text>}
          labelCol={{ span: 24 }}
          wrapperCol={{ span: 24 }}
        >
          <DatePicker
            value={date}
            onChange={(value) => setDate(value)}
            style={{ width: '100%' }}
          />
        </Form.Item>
        <Form.Item
          label={<Text className={styles.formLabel}>Mood</Text>}
          labelCol={{ span: 24 }}
          wrapperCol={{ span: 24 }}
        >
          <Select value={mood} onChange={(value) => setMood(value)} style={{ width: '100%' }}>
            <Option value="happy">Happy</Option>
            <Option value="sad">Sad</Option>
            <Option value="angry">Angry</Option>
            <Option value="excited">Excited</Option>
            <Option value="anxious">Anxious</Option>
          </Select>
        </Form.Item>
        <Form.Item wrapperCol={{ span: 24 }}>
          <div className={styles.buttonContainer}>
            <Button type="primary" htmlType="submit" className={styles.addButton}>Add Entry</Button>
          </div>
        </Form.Item>
      </Form>
    </div>
  );
};

export default AddEntryPage;
