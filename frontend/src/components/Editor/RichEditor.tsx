import React, { useState, useRef, useEffect } from 'react';
import './RichEditor.css';

interface RichEditorProps {
  content: string;
  onContentChange: (newContent: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  placeholder?: string;
  readOnly?: boolean;
}

/**
 * Rich Text Editor Component
 * 
 * Features:
 * - Plain text and markdown support
 * - Soft focus highlight animation
 * - Readable typography (max-width 900px)
 * - Proper line height and spacing
 * - Optional transcript panel support (future)
 * - Smooth scrolling
 */
const RichEditor: React.FC<RichEditorProps> = ({
  content,
  onContentChange,
  onFocus,
  onBlur,
  placeholder = 'Start typing...',
  readOnly = false,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      // Auto-adjust height based on content
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [content]);

  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onContentChange(e.target.value);
  };

  return (
    <div className={`rich-editor-container ${isFocused ? 'focused' : ''}`}>
      <div className="rich-editor-wrapper">
        <textarea
          ref={textareaRef}
          className="rich-editor-textarea"
          value={content}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          readOnly={readOnly}
          spellCheck="true"
          aria-label="Editor content"
        />
      </div>

      {/* Optional: Transcript Panel Placeholder */}
      {/* Future integration for synced transcript display */}
    </div>
  );
};

export default RichEditor;
