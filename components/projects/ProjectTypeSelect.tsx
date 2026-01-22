'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface ProjectType {
  id: number;
  name: string;
  sort_order: number;
}

interface ProjectTypeSelectProps {
  value: string | number | null;
  onChange: (value: number) => void;
  className?: string;
  placeholder?: string;
}

export default function ProjectTypeSelect({
  value,
  onChange,
  className = '',
  placeholder = '请选择项目类型',
}: ProjectTypeSelectProps) {
  const [projectTypes, setProjectTypes] = useState<ProjectType[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchProjectTypes();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const fetchProjectTypes = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/project-types');
      if (response.ok) {
        const data = await response.json();
        setProjectTypes(data);
      }
    } catch (error) {
      console.error('Failed to fetch project types:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeName = (typeId: string | number | null): string => {
    if (!typeId) return '';
    const type = projectTypes.find(t => t.id.toString() === typeId.toString());
    return type ? type.name : '';
  };

  const handleSelect = (typeId: number) => {
    onChange(typeId);
    setIsOpen(false);
  };

  const selectedTypeName = getTypeName(value);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 text-left bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors hover:border-gray-400 flex items-center justify-between"
      >
        <span className={selectedTypeName ? 'text-gray-900' : 'text-gray-400'}>
          {loading ? '加载中...' : selectedTypeName || placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && !loading && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {projectTypes.length === 0 ? (
            <div className="px-4 py-3 text-sm text-gray-500 text-center">
              暂无项目类型
            </div>
          ) : (
            <div className="py-1">
              {projectTypes.map((type) => {
                const isSelected = value?.toString() === type.id.toString();
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => handleSelect(type.id)}
                    className={`w-full px-4 py-2 text-left text-sm transition-colors flex items-center justify-between ${
                      isSelected
                        ? 'bg-indigo-50 text-indigo-700 font-medium'
                        : 'text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <span>{type.name}</span>
                    {isSelected && <Check className="w-4 h-4 text-indigo-600" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
