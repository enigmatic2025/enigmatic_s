"use client";

import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import 'react-quill-new/dist/quill.snow.css';
import { cn } from '@/lib/utils';

// Dynamic import to avoid SSR issues with Quill
const ReactQuill = dynamic(() => import('react-quill-new'), { 
  ssr: false,
  loading: () => <div className="h-40 w-full animate-pulse bg-muted/20 rounded-md" />
}) as any;

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function RichTextEditor({ value, onChange, placeholder, className }: RichTextEditorProps) {
  
  const modules = useMemo(() => ({
    toolbar: [
      ['bold', 'italic', 'strike'],
      [{ 'header': 1 }, { 'header': 2 }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link'],
      ['clean']
    ],
  }), []);

  const formats = [
    'header',
    'bold', 'italic', 'strike',
    'list',
    'link'
  ];

  return (
    <div className={cn(
      "w-full rounded-md border border-input bg-transparent focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 transition-all",
      className
    )}>
      <style jsx global>{`
        .ql-toolbar.ql-snow {
          border: none !important;
          border-bottom: 1px solid var(--border) !important;
          background: transparent;
          padding: 8px !important;
        }
        .quill {
            display: flex;
            flex-direction: column;
            /* height: 100%; - Removed to rely on flex-1 from parent */
        }
        .ql-container.ql-snow {
          border: none !important;
          font-family: inherit;
          font-size: 0.875rem; /* text-sm */
          flex: 1;
          display: flex;
          flex-direction: column;
          height: auto !important;
          min-height: 0;
        }
        .ql-editor {
          flex: 1;
          height: auto !important;
          overflow-y: auto;
          color: var(--foreground);
          padding: 12px 16px;
          list-style: none !important; /* Ensure root has no bullets */
        }
        .ql-editor p {
             list-style: none !important;
             display: block !important;
             padding: 0 !important;
             margin: 0 !important;
        }
        .ql-editor.ql-blank::before {
          color: var(--muted-foreground);
          font-style: normal;
          font-size: 0.875rem;
          left: 16px; 
        }
        /* Custom scrollbar matching app */
        .ql-editor::-webkit-scrollbar {
          width: 8px;
        }
        .ql-editor::-webkit-scrollbar-track {
          background: transparent; 
        }
        .ql-editor::-webkit-scrollbar-thumb {
          background-color: var(--muted-foreground);
          border-radius: 20px;
          border: 3px solid transparent;
          background-clip: content-box;
          opacity: 0.5;
        }
        /* Fix list styles visibility */
        .ql-editor ul {
          padding-left: 0 !important;
          list-style-type: disc !important;
          list-style-position: inside !important;
        }
        .ql-editor ol {
          padding-left: 0 !important;
          list-style-type: decimal !important;
          list-style-position: inside !important;
        }
        .ql-editor li {
            padding-left: 0.5em; /* Breathing room */
        }
        
        /* Dark mode adjustments for toolbar icons */
        .dark .ql-stroke {
          stroke: #e2e8f0 !important; /* zinc-200 */
        }
        .dark .ql-fill {
          fill: #e2e8f0 !important;
        }
        .dark .ql-picker {
          color: #e2e8f0 !important;
        }
        .dark .ql-picker-options {
          background-color: #18181b !important; /* zinc-950 */
          border-color: #27272a !important; /* zinc-800 */
        }
        /* Hover states */
        .ql-snow.ql-toolbar button:hover .ql-stroke,
        .ql-snow.ql-toolbar button.ql-active .ql-stroke {
          stroke: #3b82f6 !important; /* blue-500 */
        }
        .ql-snow.ql-toolbar button:hover .ql-fill,
        .ql-snow.ql-toolbar button.ql-active .ql-fill {
          fill: #3b82f6 !important;
        }
      `}</style>
      
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        className="" 
      />
    </div>
  );
}
