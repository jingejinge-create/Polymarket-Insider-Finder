'use client';

import { getScoreColors, getScoreSeverity } from '@/lib/scoring';

interface ScoreBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
}

export function ScoreBadge({ score, size = 'md' }: ScoreBadgeProps) {
  const { bg, text, glow } = getScoreColors(score);
  const severity = getScoreSeverity(score);
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base',
  };
  
  return (
    <span 
      className={`
        ${sizeClasses[size]}
        ${bg} ${text} ${glow}
        rounded-full font-mono font-bold
        ${severity === 'critical' ? 'score-critical' : ''}
      `}
    >
      {score}%
    </span>
  );
}
