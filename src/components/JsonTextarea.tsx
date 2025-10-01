'use client';

import { Textarea } from '@/components/ui/textarea';
import { useState, useEffect } from 'react';

interface JsonTextareaProps {
  id?: string;
  name?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function JsonTextarea({
  id,
  name,
  value,
  onChange,
  placeholder,
  className,
}: JsonTextareaProps) {
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    try {
      JSON.parse(value);
      setIsValid(true);
    } catch {
      setIsValid(false);
    }
  }, [value]);

  return (
    <div className="space-y-2">
      <Textarea
        id={id}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${className} ${!isValid ? 'border-red-500' : ''}`}
      />
      {!isValid && (
        <p className="text-sm text-red-500">Invalid JSON format</p>
      )}
    </div>
  );
}
