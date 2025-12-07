export type TransactionType = 'EARN' | 'SPEND' | 'PENALTY';

export enum ActivityCategory {
  STUDY = '学习成长',
  HEALTH = '运动健康',
  LIFE = '生活实践',
  PLAY = '自由游玩',
  PENALTY_STUDY = '学习违规',
  PENALTY_LIFE = '生活违规',
  PENALTY_MORAL = '品德违规',
}

export interface ActivityOption {
  id: string;
  name: string;
  category: ActivityCategory;
  defaultDurationMinutes: number; // Default input duration
  exchangeRatio: number; // 0.5 means 2 mins work = 1 min play. -1 means direct deduction.
  description?: string;
  isPenalty?: boolean;
}

export interface Transaction {
  id: string;
  timestamp: number;
  type: TransactionType;
  category: ActivityCategory;
  description: string;
  inputDuration: number; // The actual duration of the task (e.g., 60 mins reading)
  bankImpactMinutes: number; // The amount added/removed from bank (e.g., +30 mins)
}

export type AgeGroup = '3-6' | '7-12' | '13-16';