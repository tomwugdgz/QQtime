import React, { useState } from 'react';
import { ActivityOption, TransactionType, ActivityCategory } from '../types';
import { X, Check, AlertTriangle, Clock, Plus, Trash2, Pencil, Save } from 'lucide-react';

interface ActionLoggerProps {
  options: ActivityOption[];
  onLog: (option: ActivityOption, minutes: number, description: string) => void;
  type: TransactionType;
  onAdd?: (option: ActivityOption) => void;
  onDelete?: (id: string) => void;
}

export const ActionLogger: React.FC<ActionLoggerProps> = ({ options, onLog, type, onAdd, onDelete }) => {
  const [selectedOption, setSelectedOption] = useState<ActivityOption | null>(null);
  const [duration, setDuration] = useState<string>('');
  const [description, setDescription] = useState('');

  // Management State
  const [isManaging, setIsManaging] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newActivityName, setNewActivityName] = useState('');
  const [newActivityDuration, setNewActivityDuration] = useState('30');
  const [newActivityCategory, setNewActivityCategory] = useState<string>(
      type === 'EARN' ? ActivityCategory.STUDY : ActivityCategory.PENALTY_LIFE
  );

  const handleOpen = (option: ActivityOption) => {
    if (isManaging) return; // Disable logging when managing
    setSelectedOption(option);
    
    if (option.id === 'procrastination' || option.id === 'refuse_chores') setDuration('30');
    else if (option.id === 'sloppy' || option.id === 'bad_schedule') setDuration('60');
    else if (option.id === 'lying') setDuration('120');
    else setDuration(option.defaultDurationMinutes.toString());
    
    setDescription('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedOption && duration) {
      onLog(selectedOption, parseInt(duration, 10), description || selectedOption.name);
      setSelectedOption(null);
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if(onAdd && newActivityName) {
          const newOption: ActivityOption = {
              id: `custom_${Date.now()}`,
              name: newActivityName,
              category: newActivityCategory as ActivityCategory,
              defaultDurationMinutes: parseInt(newActivityDuration) || 30,
              exchangeRatio: type === 'EARN' ? 0.5 : -1,
              isPenalty: type === 'PENALTY',
              description: '自定义项目'
          };
          onAdd(newOption);
          setShowAddModal(false);
          setNewActivityName('');
      }
  };

  const getCardColor = (cat: string) => {
    if (cat.includes('学习')) return 'bg-blue-50 border-blue-200 text-blue-700';
    if (cat.includes('运动')) return 'bg-green-50 border-green-200 text-green-700';
    if (cat.includes('生活')) return 'bg-orange-50 border-orange-200 text-orange-700';
    if (type === 'PENALTY') return 'bg-red-50 border-red-200 text-red-700';
    return 'bg-gray-50 border-gray-200 text-gray-700';
  };

  return (
    <div>
      {/* Management Toggle */}
      {(onAdd || onDelete) && (
          <div className="flex justify-end mb-2">
              <button 
                onClick={() => setIsManaging(!isManaging)}
                className={`text-xs flex items-center gap-1 px-2 py-1 rounded transition-colors ${isManaging ? 'bg-gray-200 text-gray-800' : 'text-gray-400 hover:text-gray-600'}`}
              >
                  {isManaging ? <Check size={14} /> : <Pencil size={14} />}
                  {isManaging ? '完成编辑' : '管理标签'}
              </button>
          </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {options.map((option) => (
          <div key={option.id} className="relative group">
            <button
                onClick={() => handleOpen(option)}
                disabled={isManaging}
                className={`w-full p-3 rounded-xl border text-left transition-all flex flex-col items-start justify-between min-h-[80px] shadow-sm ${
                    isManaging ? 'opacity-80 cursor-default' : 'active:scale-95 hover:shadow-md'
                } ${getCardColor(option.category)}`}
            >
                <span className="font-bold text-sm block">{option.name}</span>
                <span className="text-xs opacity-80 mt-1 line-clamp-2">{option.description}</span>
            </button>
            
            {/* Delete Button */}
            {isManaging && onDelete && (
                <button 
                    onClick={(e) => { e.stopPropagation(); onDelete(option.id); }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full shadow-md hover:bg-red-600 transition-transform hover:scale-110 z-10"
                >
                    <Trash2 size={14} />
                </button>
            )}
          </div>
        ))}

        {/* Add Button (Only visible in manage mode) */}
        {isManaging && onAdd && (
            <button
                onClick={() => setShowAddModal(true)}
                className="p-3 rounded-xl border-2 border-dashed border-gray-300 text-gray-400 flex flex-col items-center justify-center min-h-[80px] hover:border-gray-400 hover:text-gray-500 hover:bg-gray-50 transition-colors"
            >
                <Plus size={24} />
                <span className="text-xs font-bold mt-1">添加新项</span>
            </button>
        )}
      </div>

      {/* Logging Modal */}
      {selectedOption && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                {type === 'EARN' ? '记录: ' : '扣除: '} {selectedOption.name}
              </h3>
              <button onClick={() => setSelectedOption(null)} className="p-2 hover:bg-gray-100 rounded-full">
                <X size={24} className="text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {type === 'EARN' ? '实际完成时长 (分钟)' : '扣除时长 (分钟)'}
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-3 text-gray-400" size={20} />
                  <input
                    type="number"
                    required
                    min="1"
                    max={type === 'EARN' ? 300 : 120}
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-lg"
                  />
                </div>
                {type === 'EARN' && (
                  <p className="text-xs text-green-600 mt-2 font-semibold">
                     预计获得兑换: {Math.floor(parseInt(duration || '0') * 0.5)} 分钟
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">备注 (可选)</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="例如: 书名、运动项目..."
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
              </div>
              
              {type === 'PENALTY' && (
                <div className="bg-red-50 p-3 rounded-lg flex items-start gap-2 text-sm text-red-700">
                    <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                    <p>确认违规行为后，将直接扣除现有游玩时间。</p>
                </div>
              )}

              <button
                type="submit"
                className={`w-full py-3 rounded-xl font-bold text-white shadow-lg flex justify-center items-center gap-2 ${
                  type === 'EARN' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                <Check size={20} />
                确认提交
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add New Item Modal */}
      {showAddModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800">添加自定义{type === 'EARN' ? '习惯' : '违规'}</h3>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X size={24} className="text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">名称</label>
                <input
                  type="text"
                  required
                  maxLength={10}
                  value={newActivityName}
                  onChange={(e) => setNewActivityName(e.target.value)}
                  placeholder={type === 'EARN' ? "例如: 练习钢琴" : "例如: 乱扔垃圾"}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">分类</label>
                  <select 
                    value={newActivityCategory}
                    onChange={(e) => setNewActivityCategory(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                  >
                      {type === 'EARN' ? (
                          <>
                            <option value={ActivityCategory.STUDY}>{ActivityCategory.STUDY}</option>
                            <option value={ActivityCategory.HEALTH}>{ActivityCategory.HEALTH}</option>
                            <option value={ActivityCategory.LIFE}>{ActivityCategory.LIFE}</option>
                          </>
                      ) : (
                          <>
                            <option value={ActivityCategory.PENALTY_STUDY}>{ActivityCategory.PENALTY_STUDY}</option>
                            <option value={ActivityCategory.PENALTY_LIFE}>{ActivityCategory.PENALTY_LIFE}</option>
                            <option value={ActivityCategory.PENALTY_MORAL}>{ActivityCategory.PENALTY_MORAL}</option>
                          </>
                      )}
                  </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">默认时长 (分钟)</label>
                <input
                  type="number"
                  required
                  min="5"
                  max="300"
                  value={newActivityDuration}
                  onChange={(e) => setNewActivityDuration(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl font-bold text-white shadow-lg bg-gray-800 hover:bg-gray-900 flex justify-center gap-2"
              >
                <Save size={18} />
                保存标签
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};