'use client';

import { Check } from 'lucide-react';

interface StatusSelectorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const statusOptions = [
  { value: 'not_started', label: '未开始', color: 'bg-gray-100 text-gray-800 border-gray-300' },
  { value: 'in_progress', label: '进行中', color: 'bg-blue-100 text-blue-800 border-blue-300' },
  { value: 'completed', label: '已完成', color: 'bg-green-100 text-green-800 border-green-300' },
  { value: 'abandoned', label: '已放弃', color: 'bg-red-100 text-red-800 border-red-300' },
];

export default function StatusSelector({ value, onChange, className = '' }: StatusSelectorProps) {
  return (
    <div className={`grid grid-cols-2 gap-2 ${className}`}>
      {statusOptions.map((option) => {
        const isSelected = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`
              relative px-4 py-3 rounded-lg border-2 font-medium text-sm
              transition-all duration-200
              ${isSelected 
                ? `${option.color} border-current shadow-sm` 
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
              }
            `}
          >
            <div className="flex items-center justify-center gap-2">
              {isSelected && (
                <Check className="w-4 h-4" />
              )}
              <span>{option.label}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
