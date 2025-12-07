import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Transaction } from '../types';

interface HistoryChartProps {
  transactions: Transaction[];
}

export const HistoryChart: React.FC<HistoryChartProps> = ({ transactions }) => {
  // Aggregate data by day (last 7 days)
  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' }));
    }
    return days;
  };

  const processData = () => {
    const days = getLast7Days();
    const data = days.map(day => ({ name: day, earn: 0, spend: 0 }));

    transactions.forEach(t => {
      const tDate = new Date(t.timestamp).toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' });
      const dayIndex = days.indexOf(tDate);
      if (dayIndex !== -1) {
        if (t.type === 'EARN') {
          data[dayIndex].earn += t.bankImpactMinutes; // Show how much banked
        } else if (t.type === 'SPEND' || t.type === 'PENALTY') {
          data[dayIndex].spend += Math.abs(t.bankImpactMinutes);
        }
      }
    });
    return data;
  };

  const data = processData();

  if (transactions.length === 0) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-sm flex items-center justify-center h-64 text-gray-400 text-sm">
        暂无数据，开始记录你的第一次活动吧！
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm">
      <h3 className="text-gray-700 font-bold mb-4">近7天存取趋势 (分钟)</h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
            <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} />
            <YAxis fontSize={10} tickLine={false} axisLine={false} />
            <Tooltip 
                cursor={{fill: 'transparent'}}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Bar dataKey="earn" name="存入" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={20} />
            <Bar dataKey="spend" name="支出/扣除" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={20} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};