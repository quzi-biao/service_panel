import { Layers } from 'lucide-react';

interface ProjectTypeFilterProps {
  projectTypes: string[];
  selectedType: string | null;
  onTypeSelect: (type: string | null) => void;
  projectCounts: Record<string, number>;
}

export default function ProjectTypeFilter({
  projectTypes,
  selectedType,
  onTypeSelect,
  projectCounts,
}: ProjectTypeFilterProps) {
  return (
    <div className="mb-6">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onTypeSelect(null)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            selectedType === null
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
          }`}
        >
          全部项目
          <span className="ml-2 text-xs opacity-75">
            ({Object.values(projectCounts).reduce((a, b) => a + b, 0)})
          </span>
        </button>
        {projectTypes.map((type) => (
          <button
            key={type}
            onClick={() => onTypeSelect(type)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedType === type
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            {type}
            <span className="ml-2 text-xs opacity-75">({projectCounts[type] || 0})</span>
          </button>
        ))}
      </div>
    </div>
  );
}
