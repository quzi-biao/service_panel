'use client';

import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import Header from '@/components/shared/Header';
import TipCard from '@/components/tips/TipCard';
import AddTipDialog from '@/components/tips/AddTipDialog';

interface Tip {
  id: number;
  content: string;
  tags: string | null;
  created_at: string;
  updated_at: string;
}

export default function TipsPage() {
  const [tips, setTips] = useState<Tip[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);

  useEffect(() => {
    fetchTips();
  }, []);

  const fetchTips = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/tips');
      const data = await response.json();
      if (data.success) {
        setTips(data.tips);
      }
    } catch (error) {
      console.error('Error fetching tips:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTip = async (tipData: { content: string; tags: string | null }) => {
    try {
      const response = await fetch('/api/tips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tipData),
      });

      const data = await response.json();
      if (data.success && data.tip) {
        setTips([data.tip, ...tips]);
      } else {
        alert('创建失败: ' + data.error);
      }
    } catch (error) {
      console.error('Error adding tip:', error);
      alert('创建失败');
    }
  };

  const handleUpdateTip = (updatedTip: Tip) => {
    setTips(prevTips =>
      prevTips.map(tip =>
        tip.id === updatedTip.id ? updatedTip : tip
      )
    );
  };

  const handleDeleteTip = (tipId: number) => {
    setTips(prevTips => prevTips.filter(tip => tip.id !== tipId));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        rightContent={
          <button
            onClick={() => setShowAddDialog(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>创建</span>
          </button>
        }
      />

      <div className="container mx-auto px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-500">加载中...</div>
          </div>
        ) : tips.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <p className="text-gray-500 mb-4">还没有任何记录</p>
            <button
              onClick={() => setShowAddDialog(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              创建第一条记录
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tips.map((tip) => (
              <TipCard
                key={tip.id}
                tip={tip}
                onUpdate={handleUpdateTip}
                onDelete={handleDeleteTip}
              />
            ))}
          </div>
        )}
      </div>

      <AddTipDialog
        isOpen={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        onSubmit={handleAddTip}
      />
    </div>
  );
}
