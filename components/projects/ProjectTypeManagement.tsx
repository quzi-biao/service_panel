'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Edit2, Trash2, Check, GripVertical } from 'lucide-react';

interface ProjectType {
  id: number;
  name: string;
  sort_order: number;
}

interface ProjectTypeManagementProps {
  show: boolean;
  onClose: () => void;
  onTypesUpdated: () => void;
}

export default function ProjectTypeManagement({
  show,
  onClose,
  onTypesUpdated,
}: ProjectTypeManagementProps) {
  const [types, setTypes] = useState<ProjectType[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newTypeName, setNewTypeName] = useState('');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [deleteMode, setDeleteMode] = useState(false);

  useEffect(() => {
    if (show) {
      fetchTypes();
    }
  }, [show]);

  const fetchTypes = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/project-types');
      const data = await response.json();
      setTypes(data);
    } catch (error) {
      console.error('Failed to fetch types:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddType = async () => {
    if (!newTypeName.trim()) return;

    try {
      const response = await fetch('/api/project-types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newTypeName.trim() }),
      });

      if (response.ok) {
        setNewTypeName('');
        setIsAdding(false);
        await fetchTypes();
        onTypesUpdated();
      } else {
        const error = await response.json();
        alert(error.error || '添加失败');
      }
    } catch (error) {
      console.error('Failed to add type:', error);
      alert('添加失败');
    }
  };

  const handleUpdateType = async (id: number, oldName: string) => {
    if (!editingName.trim() || editingName === oldName) {
      setEditingId(null);
      return;
    }

    try {
      const response = await fetch('/api/project-types', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, name: editingName.trim() }),
      });

      if (response.ok) {
        setEditingId(null);
        await fetchTypes();
        onTypesUpdated();
      } else {
        const error = await response.json();
        alert(error.error || '更新失败');
      }
    } catch (error) {
      console.error('Failed to update type:', error);
      alert('更新失败');
    }
  };

  const handleDeleteType = async (id: number, name: string) => {
    if (!confirm(`确定要删除类型"${name}"吗？`)) return;

    try {
      const response = await fetch(`/api/project-types?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchTypes();
        onTypesUpdated();
      } else {
        const error = await response.json();
        alert(error.error || '删除失败');
      }
    } catch (error) {
      console.error('Failed to delete type:', error);
      alert('删除失败');
    }
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newTypes = [...types];
    const draggedItem = newTypes[draggedIndex];
    newTypes.splice(draggedIndex, 1);
    newTypes.splice(index, 0, draggedItem);

    setTypes(newTypes.map((type, idx) => ({ ...type, sort_order: idx + 1 })));
    setDraggedIndex(index);
  };

  const handleDragEnd = async () => {
    setDraggedIndex(null);
    
    // Save the new sort order to the server
    try {
      const sortOrders = types.map((type, index) => ({
        id: type.id,
        sort_order: index + 1
      }));
      
      await fetch('/api/project-types', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sortOrders }),
      });
    } catch (error) {
      console.error('Failed to update sort order:', error);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-2xl font-bold text-gray-900">项目类型管理</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setDeleteMode(!deleteMode)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-all ${
                  deleteMode
                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {deleteMode ? '取消删除' : '删除模式'}
              </button>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
          <p className="text-sm text-gray-500">拖动类型可调整排序</p>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            </div>
          ) : (
            <div className="space-y-2">
              {types.map((type, index) => (
                <div
                  key={type.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-indigo-300 transition-colors ${
                    draggedIndex === index ? 'opacity-50' : ''
                  }`}
                >
                  <GripVertical className="w-5 h-5 text-gray-400 cursor-move flex-shrink-0" />
                  
                  {editingId === type.id ? (
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleUpdateType(type.id, type.name);
                        if (e.key === 'Escape') setEditingId(null);
                      }}
                      className="flex-1 px-3 py-1.5 border border-indigo-500 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                      autoFocus
                    />
                  ) : (
                    <span className="flex-1 text-gray-900">{type.name}</span>
                  )}

                  <div className="flex items-center gap-2">
                    {editingId === type.id ? (
                      <>
                        <button
                          onClick={() => handleUpdateType(type.id, type.name)}
                          className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => {
                          setEditingId(type.id);
                          setEditingName(type.name);
                        }}
                        className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
                    
                    {deleteMode && (
                      <button
                        onClick={() => handleDeleteType(type.id, type.name)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {isAdding && (
                <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-lg border border-indigo-300">
                  <GripVertical className="w-5 h-5 text-gray-400 flex-shrink-0 opacity-50" />
                  <input
                    type="text"
                    value={newTypeName}
                    onChange={(e) => setNewTypeName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddType();
                      if (e.key === 'Escape') {
                        setIsAdding(false);
                        setNewTypeName('');
                      }
                    }}
                    placeholder="输入新类型名称"
                    className="flex-1 px-3 py-1.5 border border-indigo-500 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 placeholder:text-gray-400"
                    autoFocus
                  />
                  <button
                    onClick={handleAddType}
                    className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setIsAdding(false);
                      setNewTypeName('');
                    }}
                    className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200">
          <button
            onClick={() => setIsAdding(true)}
            disabled={isAdding}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-5 h-5" />
            添加新类型
          </button>
        </div>
      </div>
    </div>
  );
}
