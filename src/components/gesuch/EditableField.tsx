'use client';

import { useState, useRef, useEffect } from 'react';

interface EditableFieldProps {
  value: string;
  fieldPath: string;
  label?: string;
  multiline?: boolean;
  className?: string;
  editMode: boolean;
  onChange: (value: string) => void;
  onAiRewrite: (params: {
    instruction: string;
    currentText: string;
    fieldPath: string;
  }) => Promise<string | null>;
}

export default function EditableField({
  value,
  fieldPath,
  label,
  multiline = false,
  className = '',
  editMode,
  onChange,
  onAiRewrite,
}: EditableFieldProps) {
  const [localValue, setLocalValue] = useState(value);
  const [showAiInput, setShowAiInput] = useState(false);
  const [aiInstruction, setAiInstruction] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync local value when overrides change externally
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Auto-grow textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [localValue, editMode]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    setLocalValue(e.target.value);
    onChange(e.target.value);
  };

  const handleAiRewrite = async () => {
    if (!aiInstruction.trim()) return;
    setAiLoading(true);
    const result = await onAiRewrite({
      instruction: aiInstruction,
      currentText: localValue,
      fieldPath,
    });
    if (result) {
      setLocalValue(result);
      onChange(result);
      setAiInstruction('');
      setShowAiInput(false);
    }
    setAiLoading(false);
  };

  if (!editMode) {
    return <span className={className}>{value}</span>;
  }

  return (
    <span className="group relative block">
      {label && (
        <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-primary/70">
          {label}
        </span>
      )}
      <span className="relative block">
        {multiline ? (
          <textarea
            ref={textareaRef}
            value={localValue}
            onChange={handleChange}
            rows={3}
            className={`${className} block w-full resize-none overflow-hidden rounded-md border border-primary/30 bg-primary/5 px-2 py-1 text-inherit outline-none ring-1 ring-primary/20 transition focus:border-primary focus:ring-primary`}
          />
        ) : (
          <input
            type="text"
            value={localValue}
            onChange={handleChange}
            className={`${className} block w-full rounded-md border border-primary/30 bg-primary/5 px-2 py-1 text-inherit outline-none ring-1 ring-primary/20 transition focus:border-primary focus:ring-primary`}
          />
        )}

        {/* AI rewrite toggle */}
        <button
          type="button"
          onClick={() => setShowAiInput((prev) => !prev)}
          title="KI-Überarbeitung"
          className="absolute right-2 top-2 rounded p-0.5 text-primary/50 opacity-0 transition hover:bg-primary/10 hover:text-primary group-hover:opacity-100"
          aria-label="KI-Überarbeitung aufrufen"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2a10 10 0 1 0 10 10" />
            <path d="M12 8v4l3 3" />
            <circle cx="18" cy="6" r="3" fill="currentColor" stroke="none" opacity="0.5" />
            <path d="M16 4l4 4" strokeWidth="1.5" />
          </svg>
        </button>
      </span>

      {/* AI instruction input */}
      {showAiInput && (
        <span className="mt-1 flex gap-1 rounded-md border border-primary/20 bg-primary/5 p-1.5">
          <input
            type="text"
            value={aiInstruction}
            onChange={(e) => setAiInstruction(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAiRewrite();
              if (e.key === 'Escape') setShowAiInput(false);
            }}
            placeholder="Anweisung z.B. «Kürzer, prägnanter»"
            className="min-w-0 flex-1 rounded bg-transparent px-2 py-1 text-xs text-text-light outline-none placeholder:text-text-muted"
            autoFocus
          />
          <button
            type="button"
            onClick={handleAiRewrite}
            disabled={aiLoading || !aiInstruction.trim()}
            className="shrink-0 rounded bg-primary px-3 py-1 text-xs font-medium text-white transition hover:bg-primary/80 disabled:opacity-50"
          >
            {aiLoading ? '...' : 'KI'}
          </button>
          <button
            type="button"
            onClick={() => setShowAiInput(false)}
            className="shrink-0 rounded px-2 py-1 text-xs text-text-muted transition hover:text-text-light"
          >
            ✕
          </button>
        </span>
      )}
    </span>
  );
}
