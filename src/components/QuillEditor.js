'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

const ReactQuill = dynamic(() => import('react-quill'), {
  ssr: false,
  loading: () => <p>Loading Editor...</p>,
});

export default function QuillEditor({ value, onChange }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div>Loading editor...</div>;
  }

  const modules = {
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        ['blockquote', 'code-block'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        ['link', 'image'],
        ['clean']
      ]
    }
  };

  return (
    <>
      <div style={{ display: mounted ? 'block' : 'none' }}>
        <ReactQuill
          value={value}
          onChange={onChange}
          modules={modules}
          theme="snow"
          placeholder="Start writing your thoughts..."
        />
      </div>
      <style jsx global>{`
        .ql-container {
          min-height: 200px;
        }
      `}</style>
    </>
  );
}
