import React, { useState, useRef, useEffect } from 'react';
import './EditorHeader.css';

interface EditorHeaderProps {
  title: string;
  onTitleChange: (newTitle: string) => void;
  date?: string;
  duration?: string;
  tags?: string[];
  isEditing?: boolean;
}

/**
 * Editor Header Component
 * 
 * Features:
 * - Editable title with contentEditable or input fallback
 * - Metadata display: date, duration, tags
 * - Inline editing with blur/enter to save
 * - Proper typography hierarchy
 * - Subtle border separator
 */
const EditorHeader: React.FC<EditorHeaderProps> = ({
  title,
  onTitleChange,
  date,
  duration,
  tags = [],
  isEditing = false,
}) => {
  const [localTitle, setLocalTitle] = useState(title);
  const [isEditingLocal, setIsEditingLocal] = useState(isEditing);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    setLocalTitle(title);
  }, [title]);

  useEffect(() => {
    if (isEditingLocal && titleRef.current) {
      titleRef.current.focus();
      // Move cursor to end of text
      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(titleRef.current);
      range.collapse(false);
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  }, [isEditingLocal]);

  const handleTitleBlur = () => {
    if (localTitle.trim() !== title) {
      onTitleChange(localTitle.trim() || title);
    }
    setIsEditingLocal(false);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLHeadingElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleTitleBlur();
    } else if (e.key === 'Escape') {
      setLocalTitle(title);
      setIsEditingLocal(false);
    }
  };

  const handleTitleInput = (e: React.FormEvent<HTMLHeadingElement>) => {
    const text = e.currentTarget.textContent || '';
    setLocalTitle(text);
  };

  return (
    <header className="editor-header">
      {/* Title Section */}
      <div className="editor-header-title-section">
        <h1
          ref={titleRef}
          className={`editor-header-title ${isEditingLocal ? 'editing' : ''}`}
          contentEditable={true}
          suppressContentEditableWarning={true}
          onBlur={handleTitleBlur}
          onKeyDown={handleTitleKeyDown}
          onInput={handleTitleInput}
          onClick={() => setIsEditingLocal(true)}
          onDoubleClick={() => setIsEditingLocal(true)}
          role="textbox"
          aria-label="Note title"
          aria-multiline="false"
        >
          {localTitle}
        </h1>
      </div>

      {/* Metadata Section */}
      <div className="editor-header-metadata">
        {date && (
          <span className="editor-header-meta-item editor-header-date">{date}</span>
        )}

        {date && duration && (
          <span className="editor-header-meta-separator">•</span>
        )}

        {duration && (
          <span className="editor-header-meta-item editor-header-duration">{duration}</span>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div className="editor-header-tags">
            {tags.map((tag) => (
              <span key={tag} className="editor-header-tag">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </header>
  );
};

export default EditorHeader;
