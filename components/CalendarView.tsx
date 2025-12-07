import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Circle } from 'lucide-react';
import { Transaction } from '../types';

interface CalendarViewProps {
  transactions: Transaction[];
}

export const CalendarView: React.FC<CalendarViewProps> = ({ transactions }) => {
  const [displayDate, setDisplayDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const year = displayDate.getFullYear();
  const month = displayDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 is Sunday

  const handlePrevMonth = () => {
    setDisplayDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setDisplayDate(new Date(year, month + 1, 1));
  };

  // Group transactions by date string (YYYY-M-D) for easy lookup
  const transactionsByDate = useMemo(() => {
    const map: Record<string, Transaction[]> = {};
    transactions.forEach(t => {
      const d = new Date(t.timestamp);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (!map[key]) map[key] = [];
      map[key].push(t);
    });
    return map;
  }, [transactions]);

  const getDayTransactions = (d: number) => {
    const key = `${year}-${month}-${d}`;
    return transactionsByDate[key] || [];
  };

  // Data for selected date
  const selectedTransactions = useMemo(() => {
    const key = `${selectedDate.getFullYear()}-${selectedDate.getMonth()}-${selectedDate.getDate()}`;
    return transactionsByDate[key] || [];
  }, [selectedDate, transactionsByDate]);

  const dailyStats = useMemo(() => {
    let earn = 0;
    let spend = 0;
    selectedTransactions.forEach(t => {
      if (t.bankImpactMinutes > 0) earn += t.bankImpactMinutes;
      else spend += Math.abs(t.bankImpactMinutes);
    });
    return { earn, spend, net: earn - spend };
  }, [selectedTransactions]);

  const renderCalendarDays = () => {
    const days = [];
    // Padding for previous month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`pad-${i}`} className="h-10 w-10" />);
    }

    // Days of current month
    for (let d = 1; d <= daysInMonth; d++) {
      const dayTrans = getDayTransactions(d);
      const hasEarn = dayTrans.some(t => t.type === 'EARN');
      const hasSpend = dayTrans.some(t => t.type !== 'EARN');
      
      const isSelected = 
        selectedDate.getDate() === d && 
        selectedDate.getMonth() === month && 
        selectedDate.getFullYear() === year;

      const isToday = 
        new Date().getDate() === d && 
        new Date().getMonth() === month && 
        new Date().getFullYear() === year;

      days.push(
        <button
          key={d}
          onClick={() => setSelectedDate(new Date(year, month, d))}
          className={`h-10 w-10 rounded-full flex flex-col items-center justify-center relative transition-all
            ${isSelected ? 'bg-indigo-600 text-white shadow-md scale-110 z-10' : 'hover:bg-gray-100 text-gray-700'}
            ${isToday && !isSelected ? 'border border-indigo-200 bg-indigo-50 font-bold' : ''}
          `}
        >
          <span className="text-sm">{d}</span>
          <div className="flex gap-0.5 mt-0.5 h-1.5">
            {hasEarn && <div className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white/70' : 'bg-green-400'}`}></div>}
            {hasSpend && <div className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white/70' : 'bg-red-400'}`}></div>}
          </div>
        </button>
      );
    }
    return days;
  };

  return (
    <div className="space-y-6">
      {/* Calendar Card */}
      <div className="bg-white rounded-2xl shadow-sm p-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <button onClick={handlePrevMonth} className="p-1 hover:bg-gray-100 rounded-full text-gray-500">
            <ChevronLeft size={20} />
          </button>
          <h3 className="font-bold text-gray-800">
            {year}年 {month + 1}月
          </h3>
          <button onClick={handleNextMonth} className="p-1 hover:bg-gray-100 rounded-full text-gray-500">
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Weekdays */}
        <div className="grid grid-cols-7 mb-2">
          {['日', '一', '二', '三', '四', '五', '六'].map(day => (
            <div key={day} className="text-center text-xs text-gray-400 font-medium">
              {day}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-y-2 justify-items-center">
          {renderCalendarDays()}
        </div>
      </div>

      {/* Selected Day Details */}
      <div>
        <div className="flex justify-between items-center mb-3 px-1">
          <h3 className="font-bold text-gray-700">
            {selectedDate.getMonth() + 1}月{selectedDate.getDate()}日 详情
          </h3>
          <div className="text-xs flex gap-3">
            <span className="text-green-600 font-medium">存入: +{dailyStats.earn}</span>
            <span className="text-red-500 font-medium">支出: -{dailyStats.spend}</span>
          </div>
        </div>

        <div className="space-y-3">
          {selectedTransactions.length === 0 ? (
            <div className="bg-white p-8 rounded-xl border border-dashed border-gray-200 text-center text-gray-400 text-sm">
              当日无记录
            </div>
          ) : (
            selectedTransactions.map(t => (
              <div key={t.id} className="bg-white p-4 rounded-xl shadow-sm flex justify-between items-center border-l-4 border-transparent animate-in fade-in slide-in-from-bottom-1" 
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
                      <p className="text-xs text-gray-400 mt-1">{new Date(t.timestamp).toLocaleTimeString('zh-CN', {hour: '2-digit', minute:'2-digit'})}</p>
                  </div>
                  <div className="text-right">
                      <span className={`text-lg font-bold ${
                          t.type === 'EARN' ? 'text-indigo-600' : 'text-gray-600'
                      }`}>
                          {t.bankImpactMinutes > 0 ? '+' : ''}{t.bankImpactMinutes}
                      </span>
                      <p className="text-[10px] text-gray-400">分钟</p>
                  </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};