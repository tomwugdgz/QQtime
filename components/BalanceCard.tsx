import React from 'react';
import { MAX_BANK_HOURS } from '../constants';
import { Battery, BatteryWarning, BatteryCharging } from 'lucide-react';

interface BalanceCardProps {
  balanceMinutes: number;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({ balanceMinutes }) => {
  const maxMinutes = MAX_BANK_HOURS * 60;
  const percentage = Math.min(100, Math.max(0, (balanceMinutes / maxMinutes) * 100));
  
  const hours = Math.floor(balanceMinutes / 60);
  const minutes = balanceMinutes % 60;

  let colorClass = 'bg-green-500';
  let Icon = BatteryCharging;
  
  if (percentage < 20) {
    colorClass = 'bg-red-500';
    Icon = BatteryWarning;
  } else if (percentage < 50) {
    colorClass = 'bg-yellow-500';
    Icon = Battery;
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <Icon size={100} />
      </div>
      
      <h2 className="text-gray-500 text-sm font-bold uppercase tracking-wide mb-2">当前可用游玩时间</h2>
      <div className="flex items-baseline space-x-2 z-10 relative">
        <span className="text-5xl font-extrabold text-gray-800">
          {hours}<span className="text-2xl text-gray-500 ml-1">小时</span>
        </span>
        <span className="text-3xl font-bold text-gray-600">
          {minutes}<span className="text-lg text-gray-400 ml-1">分钟</span>
        </span>
      </div>

      <div className="mt-6">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>0h</span>
          <span>上限 {MAX_BANK_HOURS}h</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div 
            className={`h-4 rounded-full transition-all duration-500 ease-out ${colorClass}`} 
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        {balanceMinutes >= maxMinutes && (
          <p className="text-xs text-red-500 mt-2 font-medium text-center">已达存储上限，请及时兑换游玩！</p>
        )}
      </div>
    </div>
  );
};