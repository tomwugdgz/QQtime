import { ActivityOption, ActivityCategory, AgeGroup } from './types';

export const MAX_BANK_HOURS = 12;
export const MAX_SINGLE_PLAY_HOURS = 2;

export const AGE_GROUPS: AgeGroup[] = ['3-6', '7-12', '13-16'];

export const EARN_ACTIVITIES: ActivityOption[] = [
  {
    id: 'reading',
    name: '专注阅读',
    category: ActivityCategory.STUDY,
    defaultDurationMinutes: 60,
    exchangeRatio: 0.5,
    description: '独立完成阅读，无走神',
  },
  {
    id: 'self_study',
    name: '自主学习',
    category: ActivityCategory.STUDY,
    defaultDurationMinutes: 60,
    exchangeRatio: 0.5,
    description: '主动完成学科知识学习',
  },
  {
    id: 'writing',
    name: '练字/写作',
    category: ActivityCategory.STUDY,
    defaultDurationMinutes: 60,
    exchangeRatio: 0.5,
    description: '字迹工整，内容完整',
  },
  {
    id: 'outdoor',
    name: '户外运动',
    category: ActivityCategory.HEALTH,
    defaultDurationMinutes: 60,
    exchangeRatio: 0.5,
    description: '有氧运动，全程无怠工',
  },
  {
    id: 'indoor',
    name: '居家体能',
    category: ActivityCategory.HEALTH,
    defaultDurationMinutes: 60,
    exchangeRatio: 0.5,
    description: '动作标准，坚持全程',
  },
  {
    id: 'chores',
    name: '家务劳动',
    category: ActivityCategory.LIFE,
    defaultDurationMinutes: 60,
    exchangeRatio: 0.5,
    description: '质量达标，无敷衍',
  },
  {
    id: 'crafts',
    name: '手工/科创',
    category: ActivityCategory.LIFE,
    defaultDurationMinutes: 60,
    exchangeRatio: 0.5,
    description: '全程投入，有成果',
  },
];

export const PENALTY_ACTIVITIES: ActivityOption[] = [
  {
    id: 'procrastination',
    name: '拖延/玩手机',
    category: ActivityCategory.PENALTY_STUDY,
    defaultDurationMinutes: 0,
    exchangeRatio: -1, // Special handling: fixed deduction usually
    description: '扣除0.5小时 (30分钟)',
    isPenalty: true,
  },
  {
    id: 'sloppy',
    name: '敷衍作业',
    category: ActivityCategory.PENALTY_STUDY,
    defaultDurationMinutes: 0,
    exchangeRatio: -1,
    description: '扣除1小时 (60分钟)',
    isPenalty: true,
  },
  {
    id: 'refuse_chores',
    name: '拒绝家务',
    category: ActivityCategory.PENALTY_LIFE,
    defaultDurationMinutes: 0,
    exchangeRatio: -1,
    description: '扣除0.5小时 (30分钟)',
    isPenalty: true,
  },
  {
    id: 'bad_schedule',
    name: '作息不规律',
    category: ActivityCategory.PENALTY_LIFE,
    defaultDurationMinutes: 0,
    exchangeRatio: -1,
    description: '扣除1小时 (60分钟)',
    isPenalty: true,
  },
  {
    id: 'conflict',
    name: '争吵/欺负他人',
    category: ActivityCategory.PENALTY_MORAL,
    defaultDurationMinutes: 0,
    exchangeRatio: -1,
    description: '扣除1-2小时',
    isPenalty: true,
  },
  {
    id: 'lying',
    name: '撒谎/隐瞒',
    category: ActivityCategory.PENALTY_MORAL,
    defaultDurationMinutes: 0,
    exchangeRatio: -1,
    description: '扣除2小时 (120分钟)',
    isPenalty: true,
  },
];