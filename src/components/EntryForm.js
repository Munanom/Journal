'use client';

import React, { useState } from 'react';
import { Form, Button, DatePicker, Select, Input } from 'antd';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css'; 
import dayjs from 'dayjs';
import styles from '../app/page.module.css';

import Quill from 'quill';
import 'react-quill/dist/quill.snow.css';

const { Option } = Select;
const QuillNoSSRWrapper = dynamic(() => import('react-quill'), {
  ssr: false,
  loading: () => <p>Loading...</p>
});

// Define custom icons for audio, location, and video
const CustomIcons = Quill.import('ui/icons');
CustomIcons['audio'] = '<svg viewBox="0 0 24 24"><path d="M12 3a3 3 0 00-3 3v6a3 3 0 006 0V6a3 3 0 00-3-3zm0 10a1 1 0 01-1-1V6a1 1 0 012 0v6a1 1 0 01-1 1zm5-1a5 5 0 01-10 0H6a7 7 0 0014 0h-2zm-5 6a7.98 7.98 0 01-5-1.75V21a1 1 0 001 1h8a1 1 0 001-1v-3.75A7.98 7.98 0 0112 18z"/></svg>';
CustomIcons['location'] = '<svg viewbox="0 0 18 18"><path d="M9 0a7 7 0 017 7c0 1.5-.5 2.8-1.3 3.9L9 17.8 3.3 10.9A7.015 7.015 0 012 7a7 7 0 017-7zm0 2a5 5 0 100 10A5 5 0 009 2z"></path></svg>';

// Custom handler for image upload
function imageHandler() {
  const input = document.createElement('input');
  input.setAttribute('type', 'file');
  input.setAttribute('accept', 'image/*');
  input.click();

  input.onchange = () => {
    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const range = this.quill.getSelection();
      this.quill.insertEmbed(range.index, 'image', e.target.result);
    };

    reader.readAsDataURL(file);
  };
}

// Custom handler for audio upload
function audioHandler() {
  const input = document.createElement('input');
  input.setAttribute('type', 'file');
  input.setAttribute('accept', 'audio/*');
  input.click();

  input.onchange = () => {
    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const range = this.quill.getSelection();
      this.quill.insertEmbed(range.index, 'audio', e.target.result);
    };

    reader.readAsDataURL(file);
  };
}

// Custom handler for video upload
function videoHandler() {
  const input = document.createElement('input');
  input.setAttribute('type', 'file');
  input.setAttribute('accept', 'video/*');
  input.click();

  input.onchange = () => {
    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const range = this.quill.getSelection();
      this.quill.insertEmbed(range.index, 'video', e.target.result);
    };

    reader.readAsDataURL(file);
  };
}

// Custom handler for location input
function locationHandler() {
  navigator.geolocation.getCurrentPosition((position) => {
    const { latitude, longitude } = position.coords;
    const range = this.quill.getSelection();
    this.quill.insertText(range.index, `Location: ${latitude}, ${longitude}`);
  });
}

const modules = {
  toolbar: {
    container: [
      [{ 'header': '1'}, {'header': '2'}, { 'font': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      ['link', 'image', 'audio', 'video', 'location'],
      [{ 'align': [] }, { 'color': [] }, { 'background': [] }],
      ['clean']
    ],
    handlers: {
      image: imageHandler,
      audio: audioHandler,
      video: videoHandler,
      location: locationHandler
    }
  }
};

const EntryForm = ({ initialTitle = '', initialContent = '', initialDate = null, initialMood = '', onSubmit }) => {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [date, setDate] = useState(initialDate ? dayjs(initialDate) : null);
  const [mood, setMood] = useState(initialMood);

  const handleSubmit = () => {
    onSubmit({ title, content, date, mood });
  };

  return (
    <Form onFinish={handleSubmit} className={styles.form}>
      <Form.Item>
        <h3>Title</h3>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter a title for your entry"
        />
      </Form.Item>
      <Form.Item>
        <h3>Date</h3>
        <DatePicker
          value={date}
          onChange={(value) => setDate(value)}
          placeholder="Select the date"
          style={{ width: '100%' }}
        />
      </Form.Item>
      <Form.Item>
        <h3>Mood</h3>
        <Select
          value={mood}
          onChange={(value) => setMood(value)}
          placeholder="Select your mood"
          style={{ width: '100%' }}
        >
          <Option value="happy">Happy</Option>
          <Option value="sad">Sad</Option>
          <Option value="angry">Angry</Option>
          <Option value="excited">Excited</Option>
          <Option value="anxious">Anxious</Option>
        </Select>
      </Form.Item>
      <Form.Item>
        <h3>Content</h3>
        <QuillNoSSRWrapper
          value={content}
          placeholder="Start writing..."
          onChange={setContent}
          theme="snow"
          modules={modules}
          className={styles.quillEditor}
        />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit">
          Save
        </Button>
      </Form.Item>
    </Form>
  );
};

export default EntryForm;
