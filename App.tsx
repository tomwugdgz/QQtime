import React, { useState, useEffect, useRef } from 'react';
import { BalanceCard } from './components/BalanceCard';
import { ActionLogger } from './components/ActionLogger';
import { HistoryChart } from './components/HistoryChart';
import { CalendarView } from './components/CalendarView';
import { ActivityOption, Transaction, AgeGroup, TransactionType, ActivityCategory } from './types';
import { EARN_ACTIVITIES, PENALTY_ACTIVITIES, MAX_BANK_HOURS, MAX_SINGLE_PLAY_HOURS, AGE_GROUPS } from './constants';
import { History, Award, AlertOctagon, Settings, User, Trash2, FileDown, FileUp, Banknote, Gamepad2, Calendar, BarChart3 } from 'lucide-react';

const STORAGE_KEY_DATA = 'timebank_data_v1';
const STORAGE_KEY_SETTINGS = 'timebank_settings_v1';
const STORAGE_KEY_OPTIONS = 'timebank_options_v1';

const App: React.FC = () => {
  const [balance, setBalance] = useState<number>(0); // In minutes
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [ageGroup, setAgeGroup] = useState<AgeGroup>('7-12');
  const [activeTab, setActiveTab] = useState<'EARN' | 'SPEND' | 'PENALTY' | 'HISTORY'>('EARN');
  const [showSettings, setShowSettings] = useState(false);
  
  // Custom Options State
  const [earnOptions, setEarnOptions] = useState<ActivityOption[]>(EARN_ACTIVITIES);
  const [penaltyOptions, setPenaltyOptions] = useState<ActivityOption[]>(PENALTY_ACTIVITIES);

  // Spend Mode: TIME (Play) or MONEY (Cash)
  const [spendMode, setSpendMode] = useState<'TIME' | 'MONEY'>('TIME');
  // History Mode: CHART or CALENDAR
  const [historyMode, setHistoryMode] = useState<'CHART' | 'CALENDAR'>('CHART');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load data
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY_DATA);
    const savedSettings = localStorage.getItem(STORAGE_KEY_SETTINGS);
    const savedOptions = localStorage.getItem(STORAGE_KEY_OPTIONS);

    if (savedData) {
      const parsed = JSON.parse(savedData);
      setBalance(parsed.balance || 0);
      setTransactions(parsed.transactions || []);
    }
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      setAgeGroup(parsed.ageGroup || '7-12');
    }
    if (savedOptions) {
        const parsed = JSON.parse(savedOptions);
        if (parsed.earn && parsed.earn.length > 0) setEarnOptions(parsed.earn);
        if (parsed.penalty && parsed.penalty.length > 0) setPenaltyOptions(parsed.penalty);
    }
  }, []);

  // Save data
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify({ balance, transactions }));
  }, [balance, transactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify({ ageGroup }));
  }, [ageGroup]);

  // Save options
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_OPTIONS, JSON.stringify({ earn: earnOptions, penalty: penaltyOptions }));
  }, [earnOptions, penaltyOptions]);

  const handleTransaction = (option: ActivityOption | null, minutes: number, description: string, type: TransactionType) => {
    let impact = 0;
    let newBalance = balance;

    if (type === 'EARN' && option) {
      impact = Math.floor(minutes * option.exchangeRatio);
      newBalance += impact;
      
      if (newBalance > MAX_BANK_HOURS * 60) {
        newBalance = MAX_BANK_HOURS * 60;
      }
    } else if (type === 'SPEND') {
      impact = -minutes;
      newBalance += impact;
      if (newBalance < 0) newBalance = 0;
    } else if (type === 'PENALTY') {
      impact = -minutes;
      newBalance += impact;
      if (newBalance < 0) newBalance = 0;
    }

    const newTransaction: Transaction = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      type,
      category: option ? option.category : (type === 'SPEND' && description.includes('零花钱') ? ActivityCategory.LIFE : ActivityCategory.PLAY),
      description,
      inputDuration: minutes,
      bankImpactMinutes: impact,
    };

    setBalance(newBalance);
    setTransactions([newTransaction, ...transactions]);
  };

  const handlePlay = (minutes: number, description: string) => {
    if (minutes > MAX_SINGLE_PLAY_HOURS * 60) {
      alert(`单次游玩不能超过 ${MAX_SINGLE_PLAY_HOURS} 小时`);
      return;
    }
    if (minutes > balance) {
      alert('余额不足！');
      return;
    }
    handleTransaction(null, minutes, description, 'SPEND');
  };

  const handleMoneyRedeem = (minutes: number) => {
      if (minutes > balance) {
          alert('余额不足！');
          return;
      }
      const amount = Math.floor((minutes / 30) * 5);
      if (window.confirm(`确认使用 ${minutes} 分钟兑换 ¥${amount} 零花钱吗？`)) {
          handleTransaction(null, minutes, `兑换零花钱: ¥${amount}`, 'SPEND');
      }
  };

  const handleAddOption = (type: TransactionType, option: ActivityOption) => {
      if (type === 'EARN') {
          setEarnOptions([...earnOptions, option]);
      } else if (type === 'PENALTY') {
          setPenaltyOptions([...penaltyOptions, option]);
      }
  };

  const handleDeleteOption = (type: TransactionType, id: string) => {
      if(window.confirm('确定要删除这个标签吗？')) {
        if (type === 'EARN') {
            setEarnOptions(earnOptions.filter(o => o.id !== id));
        } else if (type === 'PENALTY') {
            setPenaltyOptions(penaltyOptions.filter(o => o.id !== id));
        }
      }
  };

  const clearData = () => {
      if(window.confirm('确定要清空所有数据吗？此操作无法撤销。')) {
          setBalance(0);
          setTransactions([]);
          localStorage.removeItem(STORAGE_KEY_DATA);
      }
  };

  const exportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,\uFEFF"; 
    csvContent += "时间,类型,项目,描述,投入时长(分),存折变动(分)\n";

    transactions.forEach(t => {
      const row = [
        new Date(t.timestamp).toLocaleString('zh-CN'),
        t.type === 'EARN' ? '赚取' : t.type === 'SPEND' ? '消费' : '惩罚',
        t.category,
        `"${t.description.replace(/"/g, '""')}"`,
        t.inputDuration,
        t.bankImpactMinutes
      ].join(",");
      csvContent += row + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `timebank_export_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
          try {
              const data = JSON.parse(event.target?.result as string);
              if (data.balance !== undefined && Array.isArray(data.transactions)) {
                  if(window.confirm(`确认导入备份数据？当前余额将变为: ${data.balance}分钟`)) {
                       setBalance(data.balance);
                       setTransactions(data.transactions);
                       alert('导入成功！');
                  }
              } else {
                  alert('JSON文件格式不正确');
              }
          } catch (err) {
              alert('文件解析失败，请确保上传的是备份的JSON文件。');
          }
      };
      reader.readAsText(file);
      e.target.value = ''; 
  };
  
  const backupData = () => {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ balance, transactions, earn: earnOptions, penalty: penaltyOptions }));
      const link = document.createElement("a");
      link.setAttribute("href", dataStr);
      link.setAttribute("download", `timebank_backup_${new Date().toISOString().slice(0,10)}.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 max-w-lg mx-auto border-x border-gray-200 shadow-2xl">
      <input type="file" ref={fileInputRef} onChange={importData} accept=".json" className="hidden" />

      {/* Header */}
      <header className="bg-indigo-600 text-white p-6 rounded-b-3xl shadow-lg relative z-10">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold">TimeBank</h1>
            <p className="text-indigo-200 text-sm">让每一分钟都有价值</p>
          </div>
          <button onClick={() => setShowSettings(!showSettings)} className="p-2 bg-indigo-500 rounded-full hover:bg-indigo-400 transition-colors">
            <Settings size={20} />
          </button>
        </div>

        {showSettings && (
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 mb-4 text-sm animate-in fade-in slide-in-from-top-4">
             <div className="flex flex-col gap-3">
                <label className="flex items-center justify-between">
                    <span>年龄段设置</span>
                    <select 
                        value={ageGroup} 
                        onChange={(e) => setAgeGroup(e.target.value as AgeGroup)}
                        className="text-gray-800 rounded px-2 py-1 outline-none text-xs"
                    >
                        {AGE_GROUPS.map(g => <option key={g} value={g}>{g}岁</option>)}
                    </select>
                </label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                    <button onClick={exportCSV} className="bg-white/20 hover:bg-white/30 py-2 rounded flex items-center justify-center gap-1 text-xs">
                        <FileDown size={14}/> 导出表格(CSV)
                    </button>
                    <button onClick={backupData} className="bg-white/20 hover:bg-white/30 py-2 rounded flex items-center justify-center gap-1 text-xs">
                        <FileDown size={14}/> 备份数据(JSON)
                    </button>
                    <button onClick={() => fileInputRef.current?.click()} className="bg-white/20 hover:bg-white/30 py-2 rounded flex items-center justify-center gap-1 text-xs">
                        <FileUp size={14}/> 导入备份
                    </button>
                    <button onClick={clearData} className="bg-red-500/50 hover:bg-red-500/70 py-2 rounded flex items-center justify-center gap-1 text-xs text-white">
                        <Trash2 size={14}/> 清空数据
                    </button>
                </div>
                <div className="text-xs text-indigo-100 opacity-80 mt-1">
                    当前上限: {MAX_BANK_HOURS}h | 汇率: 30分=5元
                </div>
             </div>
          </div>
        )}

        <BalanceCard balanceMinutes={balance} />
      </header>

      {/* Main Content */}
      <main className="p-4 -mt-4 relative z-0">
        
        {/* Navigation Tabs */}
        <div className="flex bg-white rounded-xl p-1 shadow-sm mb-6">
            <button 
                onClick={() => setActiveTab('EARN')}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${activeTab === 'EARN' ? 'bg-indigo-100 text-indigo-700 shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
            >
                <Award size={16} /> 赚取
            </button>
            <button 
                onClick={() => setActiveTab('SPEND')}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${activeTab === 'SPEND' ? 'bg-green-100 text-green-700 shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
            >
                <User size={16} /> 兑换
            </button>
            <button 
                onClick={() => setActiveTab('PENALTY')}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${activeTab === 'PENALTY' ? 'bg-red-100 text-red-700 shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
            >
                <AlertOctagon size={16} /> 惩罚
            </button>
             <button 
                onClick={() => setActiveTab('HISTORY')}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${activeTab === 'HISTORY' ? 'bg-gray-100 text-gray-700 shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
            >
                <History size={16} /> 记录
            </button>
        </div>

        {/* Tab Content */}
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            {activeTab === 'EARN' && (
                <div>
                    <h3 className="font-bold text-gray-700 mb-3 ml-1">选择正向习惯</h3>
                    <ActionLogger 
                        options={earnOptions} 
                        type="EARN" 
                        onLog={(opt, mins, desc) => handleTransaction(opt, mins, desc, 'EARN')}
                        onAdd={(opt) => handleAddOption('EARN', opt)}
                        onDelete={(id) => handleDeleteOption('EARN', id)}
                    />
                    <div className="mt-4 p-3 bg-blue-50 text-blue-700 text-xs rounded-lg">
                        💡 提示: 3-6岁幼儿可拆分任务，7-12岁鼓励自主规划。
                    </div>
                </div>
            )}

            {activeTab === 'SPEND' && (
                <div className="bg-white p-6 rounded-2xl shadow-sm">
                    {/* Mode Switcher */}
                    <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
                        <button 
                            onClick={() => setSpendMode('TIME')}
                            className={`flex-1 py-2 rounded-md text-sm font-bold transition-all flex items-center justify-center gap-2 ${spendMode === 'TIME' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-400'}`}
                        >
                            <Gamepad2 size={16} /> 游玩时间
                        </button>
                        <button 
                            onClick={() => setSpendMode('MONEY')}
                            className={`flex-1 py-2 rounded-md text-sm font-bold transition-all flex items-center justify-center gap-2 ${spendMode === 'MONEY' ? 'bg-white text-yellow-600 shadow-sm' : 'text-gray-400'}`}
                        >
                            <Banknote size={16} /> 零花钱
                        </button>
                    </div>

                    {spendMode === 'TIME' ? (
                        <>
                            <div className="mb-6 text-center">
                                 <div className="text-4xl font-black text-green-500 mb-2">1 : 1</div>
                                 <p className="text-gray-400 text-xs">兑换比例 (分钟)</p>
                            </div>
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                const formData = new FormData(e.currentTarget);
                                const m = parseInt(formData.get('mins') as string);
                                const d = formData.get('desc') as string;
                                if(m > 0) handlePlay(m, d || '自由游玩');
                                (e.target as HTMLFormElement).reset();
                            }} className="space-y-4">
                                <div>
                                     <label className="block text-sm font-medium text-gray-600 mb-1">本次兑换时长 (分钟)</label>
                                     <input type="number" name="mins" max={Math.min(balance, 120)} min="1" required className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none font-bold text-lg" placeholder="30" />
                                     <p className="text-xs text-gray-400 mt-1">单次上限120分钟，当前余额 {balance} 分钟</p>
                                </div>
                                <div>
                                     <label className="block text-sm font-medium text-gray-600 mb-1">游玩内容 (可选)</label>
                                     <input type="text" name="desc" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none" placeholder="例如: 玩乐高..." />
                                </div>
                                <button disabled={balance <= 0} className="w-full bg-green-500 text-white font-bold py-3 rounded-xl shadow-lg hover:bg-green-600 disabled:bg-gray-300 disabled:shadow-none transition-all">
                                    兑换游玩
                                </button>
                            </form>
                        </>
                    ) : (
                        <>
                            <div className="mb-6 text-center">
                                 <div className="text-4xl font-black text-yellow-500 mb-2">30 <span className="text-base text-gray-400">分</span> = 5 <span className="text-base text-gray-400">元</span></div>
                                 <p className="text-gray-400 text-xs">零花钱汇率</p>
                            </div>
                             <form onSubmit={(e) => {
                                e.preventDefault();
                                const formData = new FormData(e.currentTarget);
                                const m = parseInt(formData.get('mins') as string);
                                if(m > 0) handleMoneyRedeem(m);
                                (e.target as HTMLFormElement).reset();
                            }} className="space-y-4">
                                <div>
                                     <label className="block text-sm font-medium text-gray-600 mb-1">兑换时长 (分钟)</label>
                                     <input type="number" name="mins" max={balance} min="30" step="30" required className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none font-bold text-lg" placeholder="30" />
                                     <p className="text-xs text-gray-400 mt-1">建议按30的倍数兑换</p>
                                </div>
                                <div className="bg-yellow-50 p-3 rounded-lg text-yellow-800 text-sm">
                                    🧮 可兑换金额: <strong>¥ 自动计算</strong>
                                </div>
                                <button disabled={balance < 30} className="w-full bg-yellow-500 text-white font-bold py-3 rounded-xl shadow-lg hover:bg-yellow-600 disabled:bg-gray-300 disabled:shadow-none transition-all">
                                    兑换现金
                                </button>
                            </form>
                        </>
                    )}
                </div>
            )}

            {activeTab === 'PENALTY' && (
                <div>
                    <h3 className="font-bold text-red-700 mb-3 ml-1">违规行为记录</h3>
                    <ActionLogger 
                        options={penaltyOptions} 
                        type="PENALTY" 
                        onLog={(opt, mins, desc) => handleTransaction(opt, mins, desc, 'PENALTY')}
                        onAdd={(opt) => handleAddOption('PENALTY', opt)}
                        onDelete={(id) => handleDeleteOption('PENALTY', id)}
                    />
                </div>
            )}

            {activeTab === 'HISTORY' && (
                <div className="space-y-6">
                    {/* View Switcher */}
                    <div className="flex bg-gray-100 rounded-lg p-1 mb-4">
                        <button 
                            onClick={() => setHistoryMode('CHART')}
                            className={`flex-1 py-1.5 rounded-md text-xs font-bold transition-all flex items-center justify-center gap-1 ${historyMode === 'CHART' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-400'}`}
                        >
                            <BarChart3 size={14} /> 趋势
                        </button>
                        <button 
                            onClick={() => setHistoryMode('CALENDAR')}
                            className={`flex-1 py-1.5 rounded-md text-xs font-bold transition-all flex items-center justify-center gap-1 ${historyMode === 'CALENDAR' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-400'}`}
                        >
                            <Calendar size={14} /> 日历
                        </button>
                    </div>

                    {historyMode === 'CHART' ? (
                      <>
                        <HistoryChart transactions={transactions} />
                        <div>
                            <h3 className="font-bold text-gray-700 mb-3 ml-1">详细流水 (全部)</h3>
                            <div className="space-y-3">
                                {transactions.length === 0 && <p className="text-center text-gray-400 text-sm py-4">暂无记录</p>}
                                {transactions.map(t => (
                                    <div key={t.id} className="bg-white p-4 rounded-xl shadow-sm flex justify-between items-center border-l-4 border-transparent" 
                                        style={{
                                            borderLeftColor: t.type === 'EARN' ? '#8b5cf6' : t.type === 'PENALTY' ? '#ef4444' : '#10b981'
                                        }}
                                    >
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-gray-800 text-sm">{t.description}</span>
                                                <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                                                    t.type === 'EARN' ? 'bg-indigo-50 text-indigo-600' :
                                                    t.type === 'PENALTY' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                                                }`}>{t.category}</span>
                                            </div>
                                            <p className="text-xs text-gray-400 mt-1">{new Date(t.timestamp).toLocaleString()}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className={`text-lg font-bold ${
                                                t.type === 'EARN' ? 'text-indigo-600' : 'text-gray-600'
                                            }`}>
                                                {t.bankImpactMinutes > 0 ? '+' : ''}{t.bankImpactMinutes}
                                            </span>
                                            <p className="text-[10px] text-gray-400">存折变动</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                      </>
                    ) : (
                      <CalendarView transactions={transactions} />
                    )}
                </div>
            )}
        </div>

      </main>
    </div>
  );
};

export default App;